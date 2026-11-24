import type { FileEntry, Tree } from '@ai-swfactory-oss/files'
import ts from 'typescript'

import type { TypeScriptDiagnostic, TypeScriptDiagnosticCategory, TypeScriptFileInstantiations, TypeScriptInstantiations } from './types'

export const ROOT = '/'

const decoder = new TextDecoder()

const encoder = new TextEncoder()

export const trimmed = (path: string): string => path.replace(/^\/+/, '').replace(/\/+$/, '')

export const normalized = (path: string): string => {
  const segments: string[] = []
  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') segments.pop()
    else segments.push(segment)
  }
  return segments.join('/')
}

export interface TreeFiles {
  readonly paths: () => readonly string[]
  readonly has: (fileName: string) => boolean
  readonly textOf: (fileName: string) => string | undefined
  readonly directoryExists: (directory: string) => boolean
  readonly directoriesIn: (directory: string) => string[]
}

export const treeFilesOf = (tree: Tree): TreeFiles => {
  const files = new Map(
    tree.entries
      .filter((entry): entry is FileEntry => entry.kind === 'file')
      .map(entry => [normalized(entry.path), entry.content] as const),
  )
  const prefixOf = (directory: string): string => {
    const path = normalized(directory)
    return path === '' ? '' : `${path}/`
  }
  return {
    paths: () => [...files.keys()],
    has: fileName => files.has(normalized(fileName)),
    textOf: fileName => {
      const content = files.get(normalized(fileName))
      return content === undefined ? undefined : decoder.decode(content)
    },
    directoryExists: directory => {
      const prefix = prefixOf(directory)
      return prefix === '' || [...files.keys()].some(path => path.startsWith(prefix))
    },
    directoriesIn: directory => {
      const prefix = prefixOf(directory)
      const names = new Set<string>()
      for (const path of files.keys()) {
        if (!path.startsWith(prefix)) continue
        const rest = path.slice(prefix.length).split('/')
        const name = rest[0]
        if (rest.length > 1 && name !== undefined) names.add(name)
      }
      return [...names].sort()
    },
  }
}

export const outputEntryOf = (fileName: string, text: string): FileEntry => ({
  path: normalized(fileName),
  kind: 'file',
  content: encoder.encode(text),
  executable: false,
})

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

export const diagnosticOf = (diagnostic: ts.Diagnostic): TypeScriptDiagnostic => {
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

export const instantiationsOf = (
  program: ts.Program,
): { readonly checked: readonly ts.Diagnostic[]; readonly instantiations: TypeScriptInstantiations } => {
  const files = program.getRootFileNames().map((fileName): TypeScriptFileInstantiations => {
    const before = program.getInstantiationCount()
    program.getSemanticDiagnostics(program.getSourceFile(fileName))
    return { path: trimmed(fileName), count: program.getInstantiationCount() - before }
  })
  const checked = ts.getPreEmitDiagnostics(program)
  return { checked, instantiations: { program: program.getInstantiationCount(), files } }
}

export const sortedOutputs = (outputs: FileEntry[]): Tree => ({ entries: outputs.sort((a, b) => a.path.localeCompare(b.path)) })
