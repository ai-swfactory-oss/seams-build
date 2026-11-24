import type { PipeEntry, Tree } from '@ai-swfactory-oss/files'
import { describe, expect, it } from 'vitest'

import { compileTree, type TypeScriptOptions } from '../src/index'
import { file, outputsOf, projectTree } from './project-fixtures'

const OPTIONS: TypeScriptOptions = {
  libDirectory: 'lib',
  lib: 'es5',
  target: 'es2022',
  module: 'esnext',
  strict: true,
  declaration: true,
  emit: true,
}

const pipe: PipeEntry = { path: 'src/channel', kind: 'pipe' }

describe('compileTree', () => {
  it('compileTree accepts a Tree holding a pipe entry, as the current files package produces', () => {
    const tree: Tree = projectTree(file('src/answer.ts', 'export const answer: number = 42\n'), pipe)

    const result = compileTree(tree, OPTIONS)

    expect(result.diagnostics).toEqual([])
    expect(outputsOf(result)).toEqual([
      ['src/answer.d.ts', 'export declare const answer: number;\n'],
      ['src/answer.js', 'export const answer = 42;\n'],
    ])
  })
})
