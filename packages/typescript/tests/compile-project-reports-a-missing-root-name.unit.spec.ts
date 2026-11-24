import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, file, PROJECT, projectTree, tsconfig } from './project-fixtures'

describe('compileProject', () => {
  it('a rootNames path the Tree lacks is a diagnostic naming that file and the compile returns', () => {
    const tree = projectTree(
      tsconfig('tsconfig.json', { compilerOptions: BASE_OPTIONS, include: ['src'] }),
      file('src/present.ts', 'export const present: number = 1\n'),
    )

    const result = compileProject(tree, { ...PROJECT, rootNames: ['src/present.ts', 'src/absent.ts'] })

    expect(result.diagnostics.map(diagnostic => [diagnostic.category, diagnostic.message.includes('/src/absent.ts')])).toEqual([
      ['error', true],
    ])
  })
})
