import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, codesOf, file, PROJECT, projectTree, tsconfig } from './project-fixtures'

describe('compileProject', () => {
  it('a tsconfig extending a base file and a package base in node_modules takes the merged options', () => {
    const tree = projectTree(
      tsconfig('tsconfig.base.json', { compilerOptions: { ...BASE_OPTIONS, noUnusedLocals: true } }),
      file('node_modules/@fixture/tsconfig/package.json', '{ "name": "@fixture/tsconfig", "version": "1.0.0" }\n'),
      tsconfig('node_modules/@fixture/tsconfig/tsconfig.json', { compilerOptions: { noImplicitReturns: true } }),
      tsconfig('tsconfig.json', { extends: ['./tsconfig.base.json', '@fixture/tsconfig/tsconfig.json'], include: ['src'] }),
      file('src/checked.ts', 'const unused = 1\nexport function pick(flag: boolean) {\n  if (flag) return 1\n}\n'),
    )

    expect(codesOf(compileProject(tree, PROJECT))).toEqual([6133, 7030])
  })
})
