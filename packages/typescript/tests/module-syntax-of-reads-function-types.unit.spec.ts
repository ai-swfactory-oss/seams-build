import { describe, expect, it } from 'vitest'

import { moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

const FUNCTION_TYPE = '(data: CallsConfig, options: { readonly ports: CallsPorts }) => CallsSdk'

describe('moduleSyntaxOf', () => {
  it("a function type is read with each parameter's name and type text, reaching an options parameter's ports", () => {
    const tree = { entries: [file('src/sdk.ts', `export type CreateCallsSdk = ${FUNCTION_TYPE}\n`)] }

    expect(moduleSyntaxOf(tree, 'src/sdk.ts').statements).toEqual([
      {
        kind: 'type-alias',
        exported: true,
        name: 'CreateCallsSdk',
        type: {
          kind: 'function',
          text: FUNCTION_TYPE,
          parameters: [
            { kind: 'parameter', name: 'data', type: { kind: 'text', text: 'CallsConfig' } },
            {
              kind: 'parameter',
              name: 'options',
              type: {
                kind: 'object',
                text: '{ readonly ports: CallsPorts }',
                members: [{ kind: 'property', name: 'ports', readonly: true, type: { kind: 'text', text: 'CallsPorts' } }],
              },
            },
          ],
          returnType: { kind: 'text', text: 'CallsSdk' },
        },
      },
    ])
  })
})
