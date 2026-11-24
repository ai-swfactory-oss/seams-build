import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, file, PROJECT, projectTree, tsconfig } from './project-fixtures'

const WRONG = "export const wrong: number = 'x'\n"

describe('compileProject', () => {
  it('files include and exclude decide the root files and a source outside them is not checked', () => {
    const tree = projectTree(
      tsconfig('tsconfig.json', { compilerOptions: BASE_OPTIONS, files: ['extra/one.ts'], include: ['src'], exclude: ['src/skipped'] }),
      file('extra/one.ts', WRONG),
      file('src/kept.ts', WRONG),
      file('src/skipped/gone.ts', WRONG),
      file('other/outside.ts', WRONG),
    )

    expect(
      compileProject(tree, PROJECT)
        .diagnostics.map(diagnostic => diagnostic.file ?? '')
        .sort(),
    ).toEqual(['extra/one.ts', 'src/kept.ts'])
  })
})
