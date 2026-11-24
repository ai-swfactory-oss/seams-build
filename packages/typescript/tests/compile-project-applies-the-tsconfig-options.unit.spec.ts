import { describe, expect, it } from 'vitest'

import { compileProject, compileTree } from '../src/index'
import { BASE_OPTIONS, codesOf, file, PROJECT, projectTree, tsconfig } from './project-fixtures'

const SOURCES = [
  file('src/value.ts', 'export const value: number = 1\n'),
  file('src/use.ts', "import { value } from '@/value'\nexport const doubled = value * 2\nexport function loose(x) {\n  return x\n}\n"),
  file('src/view.tsx', 'export const view = <div />\n'),
]

describe('compileProject', () => {
  it('a fixture project is checked with the paths, strict and jsx options its tsconfig declares', () => {
    const tree = projectTree(
      tsconfig('tsconfig.json', {
        compilerOptions: { ...BASE_OPTIONS, strict: false, jsx: 'preserve', paths: { '@/*': ['./src/*'] } },
        include: ['src'],
      }),
      ...SOURCES,
    )

    expect(codesOf(compileProject(tree, PROJECT))).toEqual([])
    expect(
      codesOf(
        compileTree(tree, {
          libDirectory: 'lib',
          lib: 'es5',
          target: 'es2022',
          module: 'esnext',
          strict: true,
          declaration: false,
          emit: false,
        }),
      ),
    ).toEqual(expect.arrayContaining([2307, 7006, 17004]))
  })
})
