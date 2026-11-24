import type { FileEntry, Tree } from '@ai-swfactory-oss/files'
import ts from 'typescript'

import { diagnosticOf, instantiationsOf, outputEntryOf, ROOT, sortedOutputs, treeFilesOf, trimmed } from './tree-files'
import type { TypeScriptLib, TypeScriptModule, TypeScriptOptions, TypeScriptResult, TypeScriptTarget } from './types'

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

const libFileName = (lib: TypeScriptLib): string => `lib.${lib}.d.ts`

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
  const files = treeFilesOf(tree)
  const isLibFile = (path: string): boolean =>
    libDirectory === '' ? /^lib\.[^/]*\.d\.ts$/.test(path) : path.startsWith(`${libDirectory}/`)
  const rootNames = files
    .paths()
    .filter(path => SOURCE.test(path) && !isLibFile(path))
    .sort()
  const outputs: FileEntry[] = []
  const host: ts.CompilerHost = {
    getSourceFile: (fileName, languageVersion) => {
      const text = files.textOf(fileName)
      return text === undefined ? undefined : ts.createSourceFile(fileName, text, languageVersion)
    },
    getDefaultLibLocation: () => `${ROOT}${libDirectory}`,
    getDefaultLibFileName: () => `${ROOT}${libDirectory === '' ? '' : `${libDirectory}/`}${libFileName(options.lib)}`,
    writeFile: (fileName, text) => {
      outputs.push(outputEntryOf(fileName, text))
    },
    getCurrentDirectory: () => ROOT,
    getCanonicalFileName: fileName => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: files.has,
    readFile: files.textOf,
    directoryExists: files.directoryExists,
    getDirectories: () => [],
  }
  const program = ts.createProgram({ rootNames: rootNames.map(path => `${ROOT}${path}`), options: compilerOptionsOf(options), host })
  const { checked, instantiations } = instantiationsOf(program)
  const emitted = options.emit ? program.emit().diagnostics : []
  return {
    diagnostics: [...checked, ...emitted].map(diagnosticOf),
    instantiations,
    outputs: sortedOutputs(outputs),
  }
}
