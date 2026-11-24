import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, file, outputsOf, PROJECT, projectTree, tsconfig } from './project-fixtures'

describe('compileProject', () => {
  it('with outDir given the declarations of a fixture project are emitted under that path in the outputs tree', () => {
    const tree = projectTree(
      tsconfig('tsconfig.json', { compilerOptions: { ...BASE_OPTIONS, rootDir: 'src' }, include: ['src'] }),
      file('src/answer.ts', 'export const answer: number = 42\n'),
    )

    expect(outputsOf(compileProject(tree, { ...PROJECT, outDir: 'out' }))).toEqual([
      ['out/answer.d.ts', 'export declare const answer: number;\n'],
    ])
  })
})
