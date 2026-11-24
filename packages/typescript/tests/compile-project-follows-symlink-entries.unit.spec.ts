import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, file, PROJECT, projectTree, symlink, tsconfig } from './project-fixtures'

describe('compileProject', () => {
  it('a project resolves a dependency reached through a symlinked node_modules entry and a type error against it is reported', () => {
    const tree = projectTree(
      tsconfig('tsconfig.json', { compilerOptions: BASE_OPTIONS, include: ['src'] }),
      file('src/main.ts', "import { answer } from 'dep'\nexport const counted: number = answer\n"),
      symlink('node_modules/dep', '.pnpm/dep@1.0.0/node_modules/dep'),
      file(
        'node_modules/.pnpm/dep@1.0.0/node_modules/dep/package.json',
        JSON.stringify({ name: 'dep', version: '1.0.0', types: 'index.d.ts' }),
      ),
      file('node_modules/.pnpm/dep@1.0.0/node_modules/dep/index.d.ts', 'export declare const answer: string;\n'),
    )

    const result = compileProject(tree, PROJECT)

    expect(result.diagnostics.map(({ file: named, code }) => ({ named, code }))).toEqual([{ named: 'src/main.ts', code: 2322 }])
  })
})
