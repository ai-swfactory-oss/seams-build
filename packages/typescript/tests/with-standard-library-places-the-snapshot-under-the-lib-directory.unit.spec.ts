import type { FileEntry, Tree } from '@ai-swfactory-oss/files'
import { describe, expect, it } from 'vitest'

import { compileTree, standardLibrarySelection, type TypeScriptOptions, withStandardLibrary } from '../src/index'

const encoder = new TextEncoder()

const file = (path: string, text: string): FileEntry => ({ path, kind: 'file', content: encoder.encode(text), executable: false })

const LIB_TEXTS: readonly (readonly [string, string])[] = [
  [
    'lib.es5.d.ts',
    [
      '/// <reference no-default-lib="true"/>',
      '/// <reference lib="decorators" />',
      '/// <reference lib="decorators.legacy" />',
      'interface Array<T> { length: number; [n: number]: T }',
      'interface Boolean {}',
      'interface Function {}',
      'interface CallableFunction extends Function {}',
      'interface NewableFunction extends Function {}',
      'interface IArguments {}',
      'interface Number {}',
      'interface Object {}',
      'interface RegExp {}',
      'interface String { readonly length: number }',
      '',
    ].join('\n'),
  ],
  ['lib.decorators.d.ts', '/// <reference no-default-lib="true"/>\n'],
  ['lib.decorators.legacy.d.ts', '/// <reference no-default-lib="true"/>\n'],
]

const OPTIONS: TypeScriptOptions = {
  libDirectory: 'lib',
  lib: 'es5',
  target: 'es2022',
  module: 'esnext',
  strict: true,
  declaration: true,
  emit: true,
}

const SOURCES: Tree = {
  entries: [file('src/answer.ts', 'export const answer: number = 42\n'), file('src/wrong.ts', "export const wrong: number = 'x'\n")],
}

describe('withStandardLibrary', () => {
  it('a project compiles against the standard library placed by withStandardLibrary as against the same files placed by hand', () => {
    const snapshot: Tree = { entries: LIB_TEXTS.map(([name, text]) => file(`${standardLibrarySelection.root}/${name}`, text)) }
    const byHand: Tree = { entries: [...SOURCES.entries, ...LIB_TEXTS.map(([name, text]) => file(`lib/${name}`, text))] }

    const placed = withStandardLibrary(SOURCES, snapshot, 'lib')

    expect([placed.entries.map(entry => entry.path), compileTree(placed, OPTIONS)]).toEqual([
      byHand.entries.map(entry => entry.path),
      compileTree(byHand, OPTIONS),
    ])
  })
})
