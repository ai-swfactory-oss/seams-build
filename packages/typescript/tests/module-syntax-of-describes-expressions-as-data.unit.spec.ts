import { describe, expect, it } from 'vitest'

import { moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

const SOURCE =
  "collect(42, 'two', true, false, name, a.b.c, () => x, async (value: string): Promise<void> => value, { key: 'v', short, 'quoted-key': 2 }, [1, 'x'])\n"

describe('moduleSyntaxOf', () => {
  it('calls, arrow functions, property-access chains, object and array literals, string, number and boolean literals and identifiers are each described as data', () => {
    const syntax = moduleSyntaxOf({ entries: [file('src/module.ts', SOURCE)] }, 'src/module.ts')

    expect(syntax.statements).toEqual([
      {
        kind: 'expression',
        expression: {
          kind: 'call',
          callee: { kind: 'identifier', name: 'collect' },
          typeArguments: [],
          arguments: [
            { kind: 'number', value: 42 },
            { kind: 'string', value: 'two' },
            { kind: 'boolean', value: true },
            { kind: 'boolean', value: false },
            { kind: 'identifier', name: 'name' },
            {
              kind: 'property-access',
              object: { kind: 'property-access', object: { kind: 'identifier', name: 'a' }, name: 'b' },
              name: 'c',
            },
            { kind: 'arrow', async: false, parameters: [], returnType: { kind: 'unannotated' }, body: { kind: 'identifier', name: 'x' } },
            {
              kind: 'arrow',
              async: true,
              parameters: [{ kind: 'parameter', name: 'value', type: { kind: 'annotated', text: 'string' } }],
              returnType: { kind: 'annotated', text: 'Promise<void>' },
              body: { kind: 'identifier', name: 'value' },
            },
            {
              kind: 'object',
              properties: [
                { kind: 'property', name: 'key', value: { kind: 'string', value: 'v' } },
                { kind: 'property', name: 'short', value: { kind: 'identifier', name: 'short' } },
                { kind: 'property', name: 'quoted-key', value: { kind: 'number', value: 2 } },
              ],
            },
            {
              kind: 'array',
              elements: [
                { kind: 'number', value: 1 },
                { kind: 'string', value: 'x' },
              ],
            },
          ],
        },
      },
    ])
  })
})
