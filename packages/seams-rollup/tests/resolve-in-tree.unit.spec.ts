import type { FileEntry, Tree } from '@ai-swfactory-oss/files'
import { describe, expect, it } from 'vitest'

import { resolveInTree, type TreeResolverConfig } from '../src/index'

const encoder = new TextEncoder()

const file = (path: string): FileEntry => ({ path, kind: 'file', content: encoder.encode('export {}\n'), executable: false })

const TREE: Tree = {
  entries: [
    file('src/main.ts'),
    file('src/util/strings.ts'),
    file('src/widgets/index.tsx'),
    file('src/data.json'),
    file('lib/helpers.js'),
    { path: 'src/components', kind: 'directory' },
    file('src/components/index.ts'),
  ],
}

const CONFIG: TreeResolverConfig = {
  aliases: [
    { pattern: '@/*', target: 'src/*' },
    { pattern: '~/*', target: 'lib/*' },
  ],
  extensions: ['.ts', '.tsx', '.js'],
}

describe('resolveInTree', () => {
  it('resolves an import through the @/* alias to its target file in the Tree', () => {
    expect(resolveInTree(TREE, 'src/main.ts', '@/util/strings.ts', CONFIG)).toEqual({ kind: 'file', path: 'src/util/strings.ts' })
  })

  it('resolves an import through the ~/* alias to its target file in the Tree', () => {
    expect(resolveInTree(TREE, 'src/main.ts', '~/helpers', CONFIG)).toEqual({ kind: 'file', path: 'lib/helpers.js' })
  })

  it('resolves an import without an extension to the file extension probing finds in the Tree', () => {
    expect(resolveInTree(TREE, 'src/main.ts', './util/strings', CONFIG)).toEqual({ kind: 'file', path: 'src/util/strings.ts' })
    expect(resolveInTree(TREE, 'src/util/strings.ts', '../../lib/helpers', CONFIG)).toEqual({ kind: 'file', path: 'lib/helpers.js' })
  })

  it('resolves an import that names its file exactly to that file', () => {
    expect(resolveInTree(TREE, 'src/main.ts', './data.json', CONFIG)).toEqual({ kind: 'file', path: 'src/data.json' })
  })

  it('resolves an import naming a directory to the index file index probing finds in it', () => {
    expect(resolveInTree(TREE, 'src/main.ts', './widgets', CONFIG)).toEqual({ kind: 'file', path: 'src/widgets/index.tsx' })
    expect(resolveInTree(TREE, 'src/main.ts', '@/components', CONFIG)).toEqual({ kind: 'file', path: 'src/components/index.ts' })
  })

  it('resolves a bare name and a node: builtin each as external', () => {
    expect(resolveInTree(TREE, 'src/main.ts', 'react', CONFIG)).toEqual({ kind: 'external', id: 'react' })
    expect(resolveInTree(TREE, 'src/main.ts', '@scope/pkg/sub', CONFIG)).toEqual({ kind: 'external', id: '@scope/pkg/sub' })
    expect(resolveInTree(TREE, 'src/main.ts', 'node:fs', CONFIG)).toEqual({ kind: 'external', id: 'node:fs' })
  })

  it('refuses as data naming the import one that resolves to nothing in the Tree and is not external', () => {
    expect(resolveInTree(TREE, 'src/main.ts', './missing', CONFIG)).toEqual({
      kind: 'unresolved',
      specifier: './missing',
      importer: 'src/main.ts',
      reason: '`./missing` from `src/main.ts` names no file of the Tree, by itself, with an extension or as a directory index',
    })
    expect(resolveInTree(TREE, 'src/main.ts', '@/nowhere', CONFIG)).toEqual({
      kind: 'unresolved',
      specifier: '@/nowhere',
      importer: 'src/main.ts',
      reason: '`@/nowhere` from `src/main.ts` names no file of the Tree, by itself, with an extension or as a directory index',
    })
  })

  it('refuses as data naming the import one that climbs out of the Tree', () => {
    expect(resolveInTree(TREE, 'src/main.ts', '../../outside', CONFIG)).toEqual({
      kind: 'unresolved',
      specifier: '../../outside',
      importer: 'src/main.ts',
      reason: '`../../outside` from `src/main.ts` leaves the Tree',
    })
  })
})
