import { describe, expect, it } from 'vitest'

import { moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

const SOURCE = ['export declare const version: string', 'const answer = 42', ''].join('\n')

describe('moduleSyntaxOf', () => {
  it("export declare const is read as a variable statement whose initializer is declared, and an initialised const's initializer is initialized with its expression", () => {
    const syntax = moduleSyntaxOf({ entries: [file('src/constants.ts', SOURCE)] }, 'src/constants.ts')

    expect(syntax.statements).toEqual([
      { kind: 'variable', exported: true, name: 'version', type: { kind: 'annotated', text: 'string' }, initializer: { kind: 'declared' } },
      {
        kind: 'variable',
        exported: false,
        name: 'answer',
        type: { kind: 'unannotated' },
        initializer: { kind: 'initialized', expression: { kind: 'number', value: 42 } },
      },
    ])
  })
})
