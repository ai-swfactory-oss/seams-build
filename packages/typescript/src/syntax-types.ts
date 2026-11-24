import type { TypeScriptDiagnostic } from './types'

export interface UnsupportedSyntax {
  readonly kind: 'unsupported'
  readonly path: string
  readonly line: number
  readonly column: number
  readonly syntax: string
}

export type SyntaxType = { readonly kind: 'annotated'; readonly text: string } | { readonly kind: 'unannotated' }

export type SyntaxParameter = { readonly kind: 'parameter'; readonly name: string; readonly type: SyntaxType } | UnsupportedSyntax

export type SyntaxProperty = { readonly kind: 'property'; readonly name: string; readonly value: SyntaxExpression } | UnsupportedSyntax

export type SyntaxExpression =
  | {
      readonly kind: 'call'
      readonly callee: SyntaxExpression
      readonly typeArguments: readonly string[]
      readonly arguments: readonly SyntaxExpression[]
    }
  | {
      readonly kind: 'arrow'
      readonly async: boolean
      readonly parameters: readonly SyntaxParameter[]
      readonly returnType: SyntaxType
      readonly body: SyntaxExpression
    }
  | { readonly kind: 'property-access'; readonly object: SyntaxExpression; readonly name: string }
  | { readonly kind: 'object'; readonly properties: readonly SyntaxProperty[] }
  | { readonly kind: 'array'; readonly elements: readonly SyntaxExpression[] }
  | { readonly kind: 'string'; readonly value: string }
  | { readonly kind: 'number'; readonly value: number }
  | { readonly kind: 'boolean'; readonly value: boolean }
  | { readonly kind: 'identifier'; readonly name: string }
  | UnsupportedSyntax

export interface SyntaxImportName {
  readonly name: string
  readonly alias: string | null
  readonly typeOnly: boolean
}

export interface SyntaxImport {
  readonly kind: 'import'
  readonly from: string
  readonly typeOnly: boolean
  readonly defaultName: string | null
  readonly names: readonly SyntaxImportName[]
}

export type SyntaxInitializer = { readonly kind: 'initialized'; readonly expression: SyntaxExpression } | { readonly kind: 'declared' }

export interface SyntaxVariable {
  readonly kind: 'variable'
  readonly exported: boolean
  readonly name: string
  readonly type: SyntaxType
  readonly initializer: SyntaxInitializer
}

export type SyntaxTypeMember =
  | { readonly kind: 'property'; readonly name: string; readonly readonly: boolean; readonly type: SyntaxTypeNode }
  | UnsupportedSyntax

export type SyntaxTypeParameter = { readonly kind: 'parameter'; readonly name: string; readonly type: SyntaxTypeNode } | UnsupportedSyntax

export type SyntaxTypeNode =
  | {
      readonly kind: 'function'
      readonly text: string
      readonly parameters: readonly SyntaxTypeParameter[]
      readonly returnType: SyntaxTypeNode
    }
  | { readonly kind: 'object'; readonly text: string; readonly members: readonly SyntaxTypeMember[] }
  | { readonly kind: 'text'; readonly text: string }

export interface SyntaxInterface {
  readonly kind: 'interface'
  readonly exported: boolean
  readonly name: string
  readonly properties: readonly SyntaxTypeMember[]
}

export interface SyntaxTypeAlias {
  readonly kind: 'type-alias'
  readonly exported: boolean
  readonly name: string
  readonly type: SyntaxTypeNode
}

export type SyntaxStatement =
  | SyntaxImport
  | { readonly kind: 'expression'; readonly expression: SyntaxExpression }
  | SyntaxVariable
  | SyntaxInterface
  | SyntaxTypeAlias
  | UnsupportedSyntax

export interface ModuleSyntax {
  readonly statements: readonly SyntaxStatement[]
  readonly diagnostics: readonly TypeScriptDiagnostic[]
}
