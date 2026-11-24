import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, file, outputsOf, PROJECT, projectTree, tsconfig } from './project-fixtures'

const WRONG = "export const wrong: number = 'x'\n"

describe('compileProject', () => {
  it('with rootNames the roots are those files and not the ones the tsconfig includes', () => {
    const tree = projectTree(
      tsconfig('tsconfig.json', { compilerOptions: { ...BASE_OPTIONS, rootDir: '.' }, include: ['src'] }),
      file('entry/main.ts', "import { two } from '../src/helper'\nexport const one: number = two - 1\nexport const bad: number = 'x'\n"),
      file('src/helper.ts', 'export const two: number = 2\n'),
      file('src/unreached.ts', WRONG),
    )

    const result = compileProject(tree, { ...PROJECT, outDir: 'out', rootNames: ['entry/main.ts'] })

    expect(result.diagnostics.map(diagnostic => [diagnostic.file, diagnostic.code])).toEqual([['entry/main.ts', 2322]])
    expect(outputsOf(result)).toEqual([
      ['out/entry/main.d.ts', 'export declare const one: number;\nexport declare const bad: number;\n'],
      ['out/src/helper.d.ts', 'export declare const two: number;\n'],
    ])
  })
})
