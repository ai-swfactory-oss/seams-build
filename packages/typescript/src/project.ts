import type { FileEntry, Tree } from '@ai-swfactory-oss/files'
import ts from 'typescript'

import { diagnosticOf, instantiationsOf, normalized, outputEntryOf, ROOT, sortedOutputs, treeFilesOf, trimmed } from './tree-files'
import type { TypeScriptProjectOptions, TypeScriptResult } from './types'
import { matchingFiles } from './wildcards'

const NO_INSTANTIATIONS = { program: 0, files: [] }

const absolute = (path: string): string => `${ROOT}${normalized(path)}`

const outDirOptionsOf = (outDir: string | null): ts.CompilerOptions | undefined =>
  outDir === null ? undefined : { outDir: absolute(outDir), declarationDir: absolute(outDir), declaration: true, noEmit: false }

export const compileProject = (tree: Tree, options: TypeScriptProjectOptions): TypeScriptResult => {
  const files = treeFilesOf(tree)
  const libDirectory = trimmed(options.libDirectory)
  const unrecoverable: ts.Diagnostic[] = []
  const configHost: ts.ParseConfigFileHost = {
    useCaseSensitiveFileNames: true,
    readDirectory: (root, extensions, excludes, includes) => matchingFiles(files.paths(), root, extensions, excludes, includes),
    fileExists: files.has,
    readFile: files.textOf,
    getCurrentDirectory: () => ROOT,
    onUnRecoverableConfigFileDiagnostic: diagnostic => {
      unrecoverable.push(diagnostic)
    },
  }
  const parsedOf = (configFile: string, extended: ts.CompilerOptions | undefined): ts.ParsedCommandLine | undefined =>
    ts.getParsedCommandLineOfConfigFile(absolute(configFile), extended, configHost)
  const parsed = parsedOf(options.tsconfig, outDirOptionsOf(options.outDir))
  if (parsed === undefined) {
    return { diagnostics: unrecoverable.map(diagnosticOf), instantiations: NO_INSTANTIATIONS, outputs: { entries: [] } }
  }
  const outputs: FileEntry[] = []
  const host: ts.CompilerHost = {
    getSourceFile: (fileName, languageVersion) => {
      const text = files.textOf(fileName)
      return text === undefined ? undefined : ts.createSourceFile(fileName, text, languageVersion)
    },
    getDefaultLibLocation: () => absolute(libDirectory),
    getDefaultLibFileName: compilerOptions => absolute(`${libDirectory}/${ts.getDefaultLibFileName(compilerOptions)}`),
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
    getDirectories: files.directoriesIn,
    realpath: files.realpath,
    getParsedCommandLine: configFile => parsedOf(configFile, undefined),
  }
  const program = ts.createProgram({
    rootNames: options.rootNames === undefined ? parsed.fileNames : options.rootNames.map(absolute),
    options: parsed.options,
    projectReferences: parsed.projectReferences,
    configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(parsed),
    host,
  })
  const { checked, instantiations } = instantiationsOf(program)
  const emitted = options.outDir === null ? [] : program.emit(undefined, undefined, undefined, true).diagnostics
  return {
    diagnostics: [...unrecoverable, ...checked, ...emitted].map(diagnosticOf),
    instantiations,
    outputs: sortedOutputs(outputs),
  }
}
