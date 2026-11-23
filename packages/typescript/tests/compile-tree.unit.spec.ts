import type { FileEntry, Tree } from '@ai-swfactory-oss/files'
import { describe, expect, expectTypeOf, it } from 'vitest'

import * as entry from '../src/index'
import { compileTree, type TypeScriptOptions } from '../src/index'

const encoder = new TextEncoder()

const decoder = new TextDecoder()

const file = (path: string, text: string): FileEntry => ({ path, kind: 'file', content: encoder.encode(text), executable: false })

const LIB_FILES: readonly FileEntry[] = [
  file(
    'lib/lib.es5.d.ts',
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
  ),
  file('lib/lib.decorators.d.ts', '/// <reference no-default-lib="true"/>\n'),
  file('lib/lib.decorators.legacy.d.ts', '/// <reference no-default-lib="true"/>\n'),
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

const treeOf = (...entries: readonly FileEntry[]): Tree => ({ entries: [...LIB_FILES, ...entries] })

const outputsOf = (tree: Tree): readonly (readonly [string, string])[] =>
  tree.entries.flatMap(output => (output.kind === 'file' ? [[output.path, decoder.decode(output.content)] as const] : []))

describe('compileTree', () => {
  it('returns the diagnostics and the emitted outputs of a Tree of sources as data', () => {
    const result = compileTree(treeOf(file('src/answer.ts', 'export const answer: number = 42\n')), OPTIONS)

    expect({ diagnostics: result.diagnostics, outputs: outputsOf(result.outputs) }).toEqual({
      diagnostics: [],
      outputs: [
        ['src/answer.d.ts', 'export declare const answer: number;\n'],
        ['src/answer.js', 'export const answer = 42;\n'],
      ],
    })
  })

  it('returns a type error in a source file as a diagnostic naming that file, given the standard library files the README names', () => {
    const result = compileTree(
      treeOf(file('src/ok.ts', 'export const ok = 1\n'), file('src/wrong.ts', "export const wrong: number = 'x'\n")),
      OPTIONS,
    )

    expect(result.diagnostics.map(({ file: named, start, code, category }) => ({ named, start, code, category }))).toEqual([
      { named: 'src/wrong.ts', start: { line: 1, column: 14 }, code: 2322, category: 'error' },
    ])
  })

  it('emits nothing when emit is off, and still returns the diagnostics', () => {
    const result = compileTree(treeOf(file('src/wrong.ts', "export const wrong: number = 'x'\n")), { ...OPTIONS, emit: false })

    expect([result.outputs, result.diagnostics.map(diagnostic => diagnostic.file)]).toEqual([{ entries: [] }, ['src/wrong.ts']])
  })

  it('reads the standard library files only from the given Tree, and reports the one it lacks', () => {
    const result = compileTree({ entries: [file('src/answer.ts', 'export const answer = 42\n')] }, OPTIONS)

    expect(result.diagnostics.some(diagnostic => diagnostic.message.includes('lib.es5.d.ts'))).toBe(true)
  })

  it('takes only the Tree and the options, which are a type the package declares, and exports only compileTree', () => {
    expectTypeOf(compileTree).parameters.toEqualTypeOf<[Tree, TypeScriptOptions]>()
    expect(Object.keys(entry)).toEqual(['compileTree'])
  })
})
