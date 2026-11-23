import type { FileEntry, Tree } from '@ai-swfactory-oss/files'
import ts from 'typescript'

import type {
  TypeScriptDiagnostic,
  TypeScriptDiagnosticCategory,
  TypeScriptFileInstantiations,
  TypeScriptLib,
  TypeScriptModule,
  TypeScriptOptions,
  TypeScriptResult,
  TypeScriptTarget,
} from './types'

const ROOT = '/'

const TARGETS: Readonly<Record<TypeScriptTarget, ts.ScriptTarget>> = {
  es2015: ts.ScriptTarget.ES2015,
  es2016: ts.ScriptTarget.ES2016,
  es2017: ts.ScriptTarget.ES2017,
  es2018: ts.ScriptTarget.ES2018,
  es2019: ts.ScriptTarget.ES2019,
  es2020: ts.ScriptTarget.ES2020,
  es2021: ts.ScriptTarget.ES2021,
  es2022: ts.ScriptTarget.ES2022,
  esnext: ts.ScriptTarget.ESNext,
}

const MODULES: Readonly<Record<TypeScriptModule, ts.ModuleKind>> = {
  es2015: ts.ModuleKind.ES2015,
  es2020: ts.ModuleKind.ES2020,
  es2022: ts.ModuleKind.ES2022,
  esnext: ts.ModuleKind.ESNext,
  preserve: ts.ModuleKind.Preserve,
}

const SOURCE = /\.(?:ts|tsx|mts|cts)$/

const decoder = new TextDecoder()

const encoder = new TextEncoder()

const trimmed = (path: string): string => path.replace(/^\/+/, '').replace(/\/+$/, '')

const libFileName = (lib: TypeScriptLib): string => `lib.${lib}.d.ts`

const categoryOf = (category: ts.DiagnosticCategory): TypeScriptDiagnosticCategory => {
  switch (category) {
    case ts.DiagnosticCategory.Error:
      return 'error'
    case ts.DiagnosticCategory.Warning:
      return 'warning'
    case ts.DiagnosticCategory.Suggestion:
      return 'suggestion'
    case ts.DiagnosticCategory.Message:
      return 'message'
  }
}

const diagnosticOf = (diagnostic: ts.Diagnostic): TypeScriptDiagnostic => {
  const { file, start } = diagnostic
  const at = file === undefined || start === undefined ? null : file.getLineAndCharacterOfPosition(start)
  return {
    file: file === undefined ? null : trimmed(file.fileName),
    start: at === null ? null : { line: at.line + 1, column: at.character + 1 },
    code: diagnostic.code,
    category: categoryOf(diagnostic.category),
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  }
}

const compilerOptionsOf = (options: TypeScriptOptions): ts.CompilerOptions => ({
  target: TARGETS[options.target],
  module: MODULES[options.module],
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: options.strict,
  declaration: options.declaration,
  noEmit: !options.emit,
  types: [],
  skipDefaultLibCheck: true,
})

export const compileTree = (tree: Tree, options: TypeScriptOptions): TypeScriptResult => {
  const libDirectory = trimmed(options.libDirectory)
  const files = new Map(
    tree.entries.filter((entry): entry is FileEntry => entry.kind === 'file').map(entry => [trimmed(entry.path), entry.content] as const),
  )
  const textOf = (fileName: string): string | undefined => {
    const content = files.get(trimmed(fileName))
    return content === undefined ? undefined : decoder.decode(content)
  }
  const isLibFile = (path: string): boolean =>
    libDirectory === '' ? /^lib\.[^/]*\.d\.ts$/.test(path) : path.startsWith(`${libDirectory}/`)
  const rootNames = [...files.keys()].filter(path => SOURCE.test(path) && !isLibFile(path)).sort()
  const outputs: FileEntry[] = []
  const compilerOptions = compilerOptionsOf(options)
  const host: ts.CompilerHost = {
    getSourceFile: (fileName, languageVersion) => {
      const text = textOf(fileName)
      return text === undefined ? undefined : ts.createSourceFile(fileName, text, languageVersion)
    },
    getDefaultLibLocation: () => `${ROOT}${libDirectory}`,
    getDefaultLibFileName: () => `${ROOT}${libDirectory === '' ? '' : `${libDirectory}/`}${libFileName(options.lib)}`,
    writeFile: (fileName, text) => {
      outputs.push({ path: trimmed(fileName), kind: 'file', content: encoder.encode(text), executable: false })
    },
    getCurrentDirectory: () => ROOT,
    getCanonicalFileName: fileName => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: fileName => files.has(trimmed(fileName)),
    readFile: textOf,
    directoryExists: directory => {
      const prefix = trimmed(directory)
      return prefix === '' || [...files.keys()].some(path => path.startsWith(`${prefix}/`))
    },
    getDirectories: () => [],
  }
  const program = ts.createProgram({ rootNames: rootNames.map(path => `${ROOT}${path}`), options: compilerOptions, host })
  const fileCounts = program.getRootFileNames().map((fileName): TypeScriptFileInstantiations => {
    const before = program.getInstantiationCount()
    program.getSemanticDiagnostics(program.getSourceFile(fileName))
    return { path: trimmed(fileName), count: program.getInstantiationCount() - before }
  })
  const checked = ts.getPreEmitDiagnostics(program)
  const programCount = program.getInstantiationCount()
  const emitted = options.emit ? program.emit().diagnostics : []
  return {
    diagnostics: [...checked, ...emitted].map(diagnosticOf),
    instantiations: { program: programCount, files: fileCounts },
    outputs: { entries: outputs.sort((a, b) => a.path.localeCompare(b.path)) },
  }
}
