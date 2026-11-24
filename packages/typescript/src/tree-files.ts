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
  readonly realpath: (path: string) => string
}

const MAX_LINK_HOPS = 40

const parentOf = (path: string): string => path.slice(0, Math.max(path.lastIndexOf('/'), 0))

const joined = (directory: string, name: string): string => (directory === '' ? name : `${directory}/${name}`)

const segmentsOf = (path: string): readonly string[] =>
  normalized(path)
    .split('/')
    .filter(segment => segment !== '')

export const treeFilesOf = (tree: Tree): TreeFiles => {
  const files = new Map<string, Uint8Array>()
  const links = new Map<string, string>()
  const children = new Map<string, Set<string>>()
  const addAncestors = (path: string): void => {
    let child = path
    while (child !== '') {
      const parent = parentOf(child)
      const names = children.get(parent) ?? new Set<string>()
      names.add(child.slice(parent === '' ? 0 : parent.length + 1))
      children.set(parent, names)
      child = parent
    }
  }
  for (const entry of tree.entries) {
    const path = normalized(entry.path)
    if (entry.kind === 'file') files.set(path, entry.content)
    else if (entry.kind === 'symlink') links.set(path, entry.target)
    else if (entry.kind === 'directory') children.set(path, children.get(path) ?? new Set<string>())
    addAncestors(path)
  }
  const resolved = (path: string): string | undefined => {
    let hops = 0
    const walk = (segments: readonly string[]): string | undefined => {
      let current = ''
      for (const segment of segments) {
        const candidate = joined(current, segment)
        const target = links.get(candidate)
        if (target === undefined) {
          current = candidate
          continue
        }
        hops += 1
        if (hops > MAX_LINK_HOPS) return undefined
        const next = walk(segmentsOf(target.startsWith('/') ? target : `${current}/${target}`))
        if (next === undefined) return undefined
        current = next
      }
      return current
    }
    return walk(segmentsOf(path))
  }
  const isDirectory = (real: string | undefined): boolean => real !== undefined && (real === '' || children.has(real))
  return {
    paths: () => [...files.keys()],
    has: fileName => {
      const real = resolved(fileName)
      return real !== undefined && files.has(real)
    },
    textOf: fileName => {
      const real = resolved(fileName)
      const content = real === undefined ? undefined : files.get(real)
      return content === undefined ? undefined : decoder.decode(content)
    },
    directoryExists: directory => isDirectory(resolved(directory)),
    directoriesIn: directory => {
      const real = resolved(directory)
      const names = real === undefined ? undefined : children.get(real)
      if (real === undefined || names === undefined) return []
      return [...names].filter(name => isDirectory(resolved(joined(real, name)))).sort()
    },
    realpath: path => {
      const real = resolved(path)
      return real === undefined ? path : `${ROOT}${real}`
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
