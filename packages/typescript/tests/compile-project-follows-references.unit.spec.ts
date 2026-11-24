import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, file, projectTree, tsconfig } from './project-fixtures'

describe('compileProject', () => {
  it('a project sees its reference through the referenced declarations and a type error across it is reported', () => {
    const tree = projectTree(
      tsconfig('packages/core/tsconfig.json', {
        compilerOptions: { ...BASE_OPTIONS, composite: true, rootDir: 'src', outDir: 'dist' },
        include: ['src'],
      }),
      file('packages/core/src/index.ts', 'export const answer = 42\n'),
      file('packages/core/dist/index.d.ts', 'export declare const answer: string;\n'),
      tsconfig('packages/app/tsconfig.json', { compilerOptions: BASE_OPTIONS, include: ['src'], references: [{ path: '../core' }] }),
      file('packages/app/src/main.ts', "import { answer } from '../../core/src/index'\nexport const counted: number = answer\n"),
    )

    const result = compileProject(tree, { tsconfig: 'packages/app/tsconfig.json', libDirectory: 'lib', outDir: null })

    expect(result.diagnostics.map(({ file: named, code }) => ({ named, code }))).toEqual([
      { named: 'packages/app/src/main.ts', code: 2322 },
    ])
  })
})
