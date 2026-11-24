import { describe, expect, it } from 'vitest'

import { moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

const SOURCE = [
  "export const callsBinding: Binding<CallsSdk> = bind<CallsSdk>(op => [op(api => api.calls.list, { command: ['calls', 'list'] })])",
  'const limit = 10',
  '',
].join('\n')

describe('moduleSyntaxOf', () => {
  it('an exported const whose annotated initialiser is a generic call is read as a variable statement', () => {
    const syntax = moduleSyntaxOf({ entries: [file('src/binding.ts', SOURCE)] }, 'src/binding.ts')

    expect(syntax.statements).toEqual([
      {
        kind: 'variable',
        exported: true,
        name: 'callsBinding',
        type: { kind: 'annotated', text: 'Binding<CallsSdk>' },
        initializer: {
          kind: 'call',
          callee: { kind: 'identifier', name: 'bind' },
          typeArguments: ['CallsSdk'],
          arguments: [
            {
              kind: 'arrow',
              async: false,
              parameters: [{ kind: 'parameter', name: 'op', type: { kind: 'unannotated' } }],
              returnType: { kind: 'unannotated' },
              body: {
                kind: 'array',
                elements: [
                  {
                    kind: 'call',
                    callee: { kind: 'identifier', name: 'op' },
                    typeArguments: [],
                    arguments: [
                      {
                        kind: 'arrow',
                        async: false,
                        parameters: [{ kind: 'parameter', name: 'api', type: { kind: 'unannotated' } }],
                        returnType: { kind: 'unannotated' },
                        body: {
                          kind: 'property-access',
                          object: { kind: 'property-access', object: { kind: 'identifier', name: 'api' }, name: 'calls' },
                          name: 'list',
                        },
                      },
                      {
                        kind: 'object',
                        properties: [
                          {
                            kind: 'property',
                            name: 'command',
                            value: {
                              kind: 'array',
                              elements: [
                                { kind: 'string', value: 'calls' },
                                { kind: 'string', value: 'list' },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
      { kind: 'variable', exported: false, name: 'limit', type: { kind: 'unannotated' }, initializer: { kind: 'number', value: 10 } },
    ])
  })
})
