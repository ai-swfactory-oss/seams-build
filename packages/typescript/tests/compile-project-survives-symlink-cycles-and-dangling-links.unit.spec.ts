import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, codesOf, file, PROJECT, projectTree, symlink, tsconfig } from './project-fixtures'

describe('compileProject', () => {
  it('a symlink cycle and a dangling link resolve to nothing and the compile returns without throwing', () => {
    const tree = projectTree(
      tsconfig('tsconfig.json', { compilerOptions: BASE_OPTIONS, include: ['src'] }),
      file('src/main.ts', "import { looped } from 'loop'\nimport { gone } from 'gone'\nexport const both = [looped, gone]\n"),
      symlink('node_modules/loop', 'loop-back'),
      symlink('node_modules/loop-back', 'loop'),
      symlink('node_modules/gone', '.pnpm/gone@1.0.0/node_modules/gone'),
    )

    const result = compileProject(tree, PROJECT)

    expect(codesOf(result)).toEqual([2307, 2307])
  })
})
