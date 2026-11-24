import type { Tree } from '@ai-swfactory-oss/files'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { type ModuleSyntax, moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

const SOURCE = [
  "import { bind } from './binding'",
  "export const answer: number = bind(api => api.value, { count: 1, flags: [true, 'x'] })",
  'function unsupported() {}',
  '',
].join('\n')

const tree: Tree = { entries: [file('src/module.ts', SOURCE)] }

describe('moduleSyntaxOf', () => {
  it('moduleSyntaxOf returns the same plain data for the same Tree and path, and that data survives a JSON round trip unchanged', () => {
    expectTypeOf(moduleSyntaxOf).parameters.toEqualTypeOf<[Tree, string]>()
    expectTypeOf(moduleSyntaxOf).returns.toEqualTypeOf<ModuleSyntax>()

    const first = moduleSyntaxOf(tree, 'src/module.ts')

    expect(first.statements.map(statement => statement.kind)).toEqual(['import', 'variable', 'unsupported'])
    expect(moduleSyntaxOf(tree, 'src/module.ts')).toEqual(first)
    expect(JSON.parse(JSON.stringify(first))).toEqual(first)
  })
})
