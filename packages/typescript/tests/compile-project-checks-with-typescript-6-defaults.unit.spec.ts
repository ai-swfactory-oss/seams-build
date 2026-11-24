import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { codesOf, file, PROJECT, projectTree, tsconfig } from './project-fixtures'

describe('compileProject', () => {
  it('a tsconfig that does not set strict reports an implicit any as TypeScript 6.0 does', () => {
    const tree = projectTree(
      tsconfig('tsconfig.json', {
        compilerOptions: { lib: ['es5'], target: 'es2022', module: 'esnext', moduleResolution: 'bundler' },
        include: ['src'],
      }),
      file('src/loose.ts', 'export const identity = (value) => value\n'),
    )

    expect(codesOf(compileProject(tree, PROJECT))).toEqual([7006])
  })
})
