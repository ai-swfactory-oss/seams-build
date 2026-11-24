import { describe, expect, it } from 'vitest'

import { moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

const SOURCE = ['function helper() {}', 'const [first] = list', 'ready ? go() : wait()', 'call(...rest)', ''].join('\n')

const PATH = 'src/module.ts'

describe('moduleSyntaxOf', () => {
  it('a construct outside the supported kinds yields an unsupported entry with its path, line, column and syntax, and nothing is thrown', () => {
    const tree = { entries: [file(PATH, SOURCE)] }

    expect(() => moduleSyntaxOf(tree, PATH)).not.toThrow()
    expect(moduleSyntaxOf(tree, PATH).statements).toEqual([
      { kind: 'unsupported', path: PATH, line: 1, column: 1, syntax: 'function helper() {}' },
      { kind: 'unsupported', path: PATH, line: 2, column: 1, syntax: 'const [first] = list' },
      { kind: 'expression', expression: { kind: 'unsupported', path: PATH, line: 3, column: 1, syntax: 'ready ? go() : wait()' } },
      {
        kind: 'expression',
        expression: {
          kind: 'call',
          callee: { kind: 'identifier', name: 'call' },
          typeArguments: [],
          arguments: [{ kind: 'unsupported', path: PATH, line: 4, column: 6, syntax: '...rest' }],
        },
      },
    ])
  })
})
