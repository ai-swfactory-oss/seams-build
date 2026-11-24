export { compileTree } from './compile'
export { moduleSyntaxOf } from './module-syntax'
export { compileProject } from './project'
export { standardLibrarySelection, typescriptVersion, withStandardLibrary } from './standard-library'
export type {
  ModuleSyntax,
  SyntaxExpression,
  SyntaxImport,
  SyntaxImportName,
  SyntaxParameter,
  SyntaxProperty,
  SyntaxStatement,
  SyntaxType,
  SyntaxVariable,
  UnsupportedSyntax,
} from './syntax-types'
export type {
  TypeScriptDiagnostic,
  TypeScriptDiagnosticCategory,
  TypeScriptFileInstantiations,
  TypeScriptInstantiations,
  TypeScriptLib,
  TypeScriptModule,
  TypeScriptOptions,
  TypeScriptPosition,
  TypeScriptProjectOptions,
  TypeScriptResult,
  TypeScriptTarget,
} from './types'
