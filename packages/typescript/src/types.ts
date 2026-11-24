import type { Tree } from '@ai-swfactory-oss/files'

export type TypeScriptLib = 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022'

export type TypeScriptTarget = 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022' | 'esnext'

export type TypeScriptModule = 'es2015' | 'es2020' | 'es2022' | 'esnext' | 'preserve'

export interface TypeScriptOptions {
  readonly libDirectory: string
  readonly lib: TypeScriptLib
  readonly target: TypeScriptTarget
  readonly module: TypeScriptModule
  readonly strict: boolean
  readonly declaration: boolean
  readonly emit: boolean
}

export type TypeScriptDiagnosticCategory = 'error' | 'warning' | 'suggestion' | 'message'

export interface TypeScriptPosition {
  readonly line: number
  readonly column: number
}

export interface TypeScriptDiagnostic {
  readonly file: string | null
  readonly start: TypeScriptPosition | null
  readonly code: number
  readonly category: TypeScriptDiagnosticCategory
  readonly message: string
}

export interface TypeScriptFileInstantiations {
  readonly path: string
  readonly count: number
}

export interface TypeScriptInstantiations {
  readonly program: number
  readonly files: readonly TypeScriptFileInstantiations[]
}

export interface TypeScriptProjectOptions {
  readonly tsconfig: string
  readonly libDirectory: string
  readonly outDir: string | null
  readonly rootNames?: readonly string[]
}

export interface TypeScriptResult {
  readonly diagnostics: readonly TypeScriptDiagnostic[]
  readonly instantiations: TypeScriptInstantiations
  readonly outputs: Tree
}
