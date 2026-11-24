import { describe, expect, it } from 'vitest'

import { moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

const SOURCE = [
  "import { alpha, beta as second } from './letters'",
  'register(alpha)',
  "import type { Shape } from './shape'",
  "import main, { type Options } from './main'",
  "import './side-effect'",
  'start()',
  '',
].join('\n')

describe('moduleSyntaxOf', () => {
  it("the module's imports and expression statements are returned in source order", () => {
    const syntax = moduleSyntaxOf({ entries: [file('src/module.ts', SOURCE)] }, 'src/module.ts')

    expect(syntax).toEqual({
      diagnostics: [],
      statements: [
        {
          kind: 'import',
          from: './letters',
          typeOnly: false,
          defaultName: null,
          names: [
            { name: 'alpha', alias: null, typeOnly: false },
            { name: 'beta', alias: 'second', typeOnly: false },
          ],
        },
        {
          kind: 'expression',
          expression: {
            kind: 'call',
            callee: { kind: 'identifier', name: 'register' },
            typeArguments: [],
            arguments: [{ kind: 'identifier', name: 'alpha' }],
          },
        },
        { kind: 'import', from: './shape', typeOnly: true, defaultName: null, names: [{ name: 'Shape', alias: null, typeOnly: false }] },
        { kind: 'import', from: './main', typeOnly: false, defaultName: 'main', names: [{ name: 'Options', alias: null, typeOnly: true }] },
        { kind: 'import', from: './side-effect', typeOnly: false, defaultName: null, names: [] },
        {
          kind: 'expression',
          expression: { kind: 'call', callee: { kind: 'identifier', name: 'start' }, typeArguments: [], arguments: [] },
        },
      ],
    })
  })
})
