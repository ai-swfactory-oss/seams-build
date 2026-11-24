import type { Tree } from '@ai-swfactory-oss/files'
import ts from 'typescript'

import type {
  ModuleSyntax,
  SyntaxExpression,
  SyntaxImportName,
  SyntaxParameter,
  SyntaxProperty,
  SyntaxStatement,
  SyntaxType,
  SyntaxTypeMember,
  SyntaxTypeNode,
  SyntaxTypeParameter,
  UnsupportedSyntax,
} from './syntax-types'
import { normalized, treeFilesOf } from './tree-files'

const FILE_NOT_FOUND = 6053

const JSX_SOURCE = /\.[jt]sx$/

const hasModifier = (node: ts.HasModifiers, kind: ts.SyntaxKind): boolean =>
  (ts.getModifiers(node) ?? []).some(modifier => modifier.kind === kind)

const nameOf = (name: ts.PropertyName): string | null =>
  ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : null

const readerOf = (source: ts.SourceFile, path: string) => {
  const unsupported = (node: ts.Node): UnsupportedSyntax => {
    const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source))
    return { kind: 'unsupported', path, line: line + 1, column: character + 1, syntax: node.getText(source) }
  }

  const typeOf = (node: ts.TypeNode | undefined): SyntaxType =>
    node === undefined ? { kind: 'unannotated' } : { kind: 'annotated', text: node.getText(source) }

  const parameterOf = (parameter: ts.ParameterDeclaration): SyntaxParameter =>
    ts.isIdentifier(parameter.name) && parameter.initializer === undefined && parameter.dotDotDotToken === undefined
      ? { kind: 'parameter', name: parameter.name.text, type: typeOf(parameter.type) }
      : unsupported(parameter)

  const propertyOf = (property: ts.ObjectLiteralElementLike): SyntaxProperty => {
    if (ts.isShorthandPropertyAssignment(property) && property.objectAssignmentInitializer === undefined) {
      return { kind: 'property', name: property.name.text, value: { kind: 'identifier', name: property.name.text } }
    }
    if (ts.isPropertyAssignment(property)) {
      const name = nameOf(property.name)
      if (name !== null) return { kind: 'property', name, value: expressionOf(property.initializer) }
    }
    return unsupported(property)
  }

  const arrowOf = (node: ts.ArrowFunction): SyntaxExpression => {
    if (node.typeParameters !== undefined) return unsupported(node)
    return {
      kind: 'arrow',
      async: hasModifier(node, ts.SyntaxKind.AsyncKeyword),
      parameters: node.parameters.map(parameterOf),
      returnType: typeOf(node.type),
      body: ts.isBlock(node.body) ? unsupported(node.body) : expressionOf(node.body),
    }
  }

  const expressionOf = (node: ts.Expression): SyntaxExpression => {
    if (ts.isParenthesizedExpression(node)) return expressionOf(node.expression)
    if (ts.isStringLiteral(node)) return { kind: 'string', value: node.text }
    if (ts.isNumericLiteral(node)) return { kind: 'number', value: Number(node.text) }
    if (node.kind === ts.SyntaxKind.TrueKeyword) return { kind: 'boolean', value: true }
    if (node.kind === ts.SyntaxKind.FalseKeyword) return { kind: 'boolean', value: false }
    if (ts.isIdentifier(node)) return { kind: 'identifier', name: node.text }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name) && node.questionDotToken === undefined) {
      return { kind: 'property-access', object: expressionOf(node.expression), name: node.name.text }
    }
    if (ts.isCallExpression(node) && node.questionDotToken === undefined) {
      return {
        kind: 'call',
        callee: expressionOf(node.expression),
        typeArguments: (node.typeArguments ?? []).map(argument => argument.getText(source)),
        arguments: node.arguments.map(expressionOf),
      }
    }
    if (ts.isArrowFunction(node)) return arrowOf(node)
    if (ts.isObjectLiteralExpression(node)) return { kind: 'object', properties: node.properties.map(propertyOf) }
    if (ts.isArrayLiteralExpression(node)) return { kind: 'array', elements: node.elements.map(expressionOf) }
    return unsupported(node)
  }

  const importNameOf = (element: ts.ImportSpecifier): SyntaxImportName => ({
    name: (element.propertyName ?? element.name).text,
    alias: element.propertyName === undefined ? null : element.name.text,
    typeOnly: element.isTypeOnly,
  })

  const importOf = (node: ts.ImportDeclaration): SyntaxStatement => {
    if (!ts.isStringLiteral(node.moduleSpecifier)) return unsupported(node)
    const from = node.moduleSpecifier.text
    const clause = node.importClause
    if (clause === undefined) return { kind: 'import', from, typeOnly: false, defaultName: null, names: [] }
    const bindings = clause.namedBindings
    if (bindings !== undefined && !ts.isNamedImports(bindings)) return unsupported(node)
    return {
      kind: 'import',
      from,
      typeOnly: clause.phaseModifier === ts.SyntaxKind.TypeKeyword,
      defaultName: clause.name === undefined ? null : clause.name.text,
      names: bindings === undefined ? [] : bindings.elements.map(importNameOf),
    }
  }

  const variableOf = (node: ts.VariableStatement): SyntaxStatement => {
    const [declaration, ...others] = node.declarationList.declarations
    if (declaration === undefined || others.length > 0 || !ts.isIdentifier(declaration.name)) return unsupported(node)
    const declared = hasModifier(node, ts.SyntaxKind.DeclareKeyword)
    if (declared === (declaration.initializer !== undefined)) return unsupported(node)
    return {
      kind: 'variable',
      exported: hasModifier(node, ts.SyntaxKind.ExportKeyword),
      name: declaration.name.text,
      type: typeOf(declaration.type),
      initializer:
        declaration.initializer === undefined
          ? { kind: 'declared' }
          : { kind: 'initialized', expression: expressionOf(declaration.initializer) },
    }
  }

  const typeParameterOf = (parameter: ts.ParameterDeclaration): SyntaxTypeParameter =>
    ts.isIdentifier(parameter.name) &&
    parameter.type !== undefined &&
    parameter.questionToken === undefined &&
    parameter.dotDotDotToken === undefined
      ? { kind: 'parameter', name: parameter.name.text, type: typeNodeOf(parameter.type) }
      : unsupported(parameter)

  const memberOf = (member: ts.TypeElement): SyntaxTypeMember => {
    if (ts.isPropertySignature(member) && member.questionToken === undefined && member.type !== undefined) {
      const name = nameOf(member.name)
      if (name !== null) {
        return {
          kind: 'property',
          name,
          readonly: hasModifier(member, ts.SyntaxKind.ReadonlyKeyword),
          type: typeNodeOf(member.type),
        }
      }
    }
    return unsupported(member)
  }

  const typeNodeOf = (node: ts.TypeNode): SyntaxTypeNode => {
    if (ts.isParenthesizedTypeNode(node)) return typeNodeOf(node.type)
    const text = node.getText(source)
    if (ts.isFunctionTypeNode(node) && node.typeParameters === undefined) {
      return { kind: 'function', text, parameters: node.parameters.map(typeParameterOf), returnType: typeNodeOf(node.type) }
    }
    if (ts.isTypeLiteralNode(node)) return { kind: 'object', text, members: node.members.map(memberOf) }
    return { kind: 'text', text }
  }

  const isPlainDeclaration = (node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration): boolean =>
    node.typeParameters === undefined && !hasModifier(node, ts.SyntaxKind.DefaultKeyword)

  const interfaceOf = (node: ts.InterfaceDeclaration): SyntaxStatement =>
    isPlainDeclaration(node) && node.heritageClauses === undefined
      ? {
          kind: 'interface',
          exported: hasModifier(node, ts.SyntaxKind.ExportKeyword),
          name: node.name.text,
          properties: node.members.map(memberOf),
        }
      : unsupported(node)

  const typeAliasOf = (node: ts.TypeAliasDeclaration): SyntaxStatement =>
    isPlainDeclaration(node)
      ? { kind: 'type-alias', exported: hasModifier(node, ts.SyntaxKind.ExportKeyword), name: node.name.text, type: typeNodeOf(node.type) }
      : unsupported(node)

  const statementOf = (node: ts.Statement): SyntaxStatement => {
    if (ts.isImportDeclaration(node)) return importOf(node)
    if (ts.isExpressionStatement(node)) return { kind: 'expression', expression: expressionOf(node.expression) }
    if (ts.isVariableStatement(node)) return variableOf(node)
    if (ts.isInterfaceDeclaration(node)) return interfaceOf(node)
    if (ts.isTypeAliasDeclaration(node)) return typeAliasOf(node)
    return unsupported(node)
  }

  return { statementOf }
}

export const moduleSyntaxOf = (tree: Tree, path: string): ModuleSyntax => {
  const file = normalized(path)
  const text = treeFilesOf(tree).textOf(file)
  if (text === undefined) {
    return {
      statements: [],
      diagnostics: [{ file, start: null, code: FILE_NOT_FOUND, category: 'error', message: `File '${file}' not found.` }],
    }
  }
  const scriptKind = JSX_SOURCE.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind)
  return { statements: source.statements.map(readerOf(source, file).statementOf), diagnostics: [] }
}
