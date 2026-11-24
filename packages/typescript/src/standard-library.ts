import type { Selection, Tree } from '@ai-swfactory-oss/files'
import ts from 'typescript'

import { normalized, trimmed } from './tree-files'

export const typescriptVersion: string = ts.version

const libDirectoryOf = (libFilePath: string): string => trimmed(libFilePath.slice(0, libFilePath.lastIndexOf('/')))

export const standardLibrarySelection: Selection = {
  root: libDirectoryOf(ts.getDefaultLibFilePath({})),
  include: ['lib.*.d.ts'],
  exclude: [],
}

const relativeToRoot = (path: string): string => {
  const root = normalized(standardLibrarySelection.root)
  const entry = normalized(path)
  return entry.startsWith(`${root}/`) ? entry.slice(root.length + 1) : entry
}

export const withStandardLibrary = (tree: Tree, standardLibrary: Tree, libDirectory: string): Tree => {
  const directory = trimmed(libDirectory)
  return {
    entries: [
      ...tree.entries,
      ...standardLibrary.entries.flatMap(entry => {
        if (entry.kind !== 'file') return []
        const name = relativeToRoot(entry.path)
        return [{ ...entry, path: directory === '' ? name : `${directory}/${name}` }]
      }),
    ],
  }
}
