import { describe, expect, it } from 'vitest'

import { moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

const SOURCE = ['export type Id = string | number', 'type Pair = { readonly left: Id }', ''].join('\n')

describe('moduleSyntaxOf', () => {
  it('a top-level type alias is read with its exported flag, name and type text', () => {
    const syntax = moduleSyntaxOf({ entries: [file('src/types.ts', SOURCE)] }, 'src/types.ts')

    expect(syntax.statements).toEqual([
      { kind: 'type-alias', exported: true, name: 'Id', type: { kind: 'text', text: 'string | number' } },
      {
        kind: 'type-alias',
        exported: false,
        name: 'Pair',
        type: {
          kind: 'object',
          text: '{ readonly left: Id }',
          members: [{ kind: 'property', name: 'left', readonly: true, type: { kind: 'text', text: 'Id' } }],
        },
      },
    ])
  })
})
