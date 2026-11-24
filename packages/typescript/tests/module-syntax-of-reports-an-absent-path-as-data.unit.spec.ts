import { describe, expect, it } from 'vitest'

import { moduleSyntaxOf } from '../src/index'
import { file } from './project-fixtures'

describe('moduleSyntaxOf', () => {
  it('a path the Tree lacks returns no statements and one error diagnostic naming that path', () => {
    const tree = { entries: [file('src/present.ts', 'export const present = 1\n')] }

    const syntax = moduleSyntaxOf(tree, 'src/absent.ts')

    expect(syntax.statements).toEqual([])
    expect(
      syntax.diagnostics.map(diagnostic => [diagnostic.category, diagnostic.file, diagnostic.message.includes('src/absent.ts')]),
    ).toEqual([['error', 'src/absent.ts', true]])
  })
})
