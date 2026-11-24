import { describe, expect, it } from 'vitest'

import { moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

const SOURCE = [
  'export interface CallsPorts {',
  '  readonly clock: Clock',
  '  label: string',
  '}',
  'interface Call {',
  "  readonly 'call-id': string",
  '}',
  '',
].join('\n')

describe('moduleSyntaxOf', () => {
  it("a top-level interface declaration is read with its exported flag, name and each property's name, readonly flag and type text", () => {
    const syntax = moduleSyntaxOf({ entries: [file('src/ports.ts', SOURCE)] }, 'src/ports.ts')

    expect(syntax.statements).toEqual([
      {
        kind: 'interface',
        exported: true,
        name: 'CallsPorts',
        properties: [
          { kind: 'property', name: 'clock', readonly: true, type: { kind: 'text', text: 'Clock' } },
          { kind: 'property', name: 'label', readonly: false, type: { kind: 'text', text: 'string' } },
        ],
      },
      {
        kind: 'interface',
        exported: false,
        name: 'Call',
        properties: [{ kind: 'property', name: 'call-id', readonly: true, type: { kind: 'text', text: 'string' } }],
      },
    ])
  })
})
