import type { FileEntry, SymlinkEntry, Tree, TreeEntry } from '@ai-swfactory-oss/files'

import type { TypeScriptResult } from '../src/index'

const encoder = new TextEncoder()

const decoder = new TextDecoder()

export const file = (path: string, text: string): FileEntry => ({ path, kind: 'file', content: encoder.encode(text), executable: false })

export const symlink = (path: string, target: string): SymlinkEntry => ({ path, kind: 'symlink', target })

export const tsconfig = (path: string, config: object): FileEntry => file(path, JSON.stringify(config, null, 2))

const LIB_FILES: readonly FileEntry[] = [
  file(
    'lib/lib.es5.d.ts',
    [
      '/// <reference no-default-lib="true"/>',
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
]

export const BASE_OPTIONS = { lib: ['es5'], target: 'es2022', module: 'esnext', moduleResolution: 'bundler', strict: true }

export const projectTree = (...entries: readonly TreeEntry[]): Tree => ({ entries: [...LIB_FILES, ...entries] })

export const PROJECT = { tsconfig: 'tsconfig.json', libDirectory: 'lib', outDir: null }

export const codesOf = (result: TypeScriptResult): readonly number[] =>
  result.diagnostics.map(diagnostic => diagnostic.code).sort((a, b) => a - b)

export const outputsOf = (result: TypeScriptResult): readonly (readonly [string, string])[] =>
  result.outputs.entries.flatMap(output => (output.kind === 'file' ? [[output.path, decoder.decode(output.content)] as const] : []))
