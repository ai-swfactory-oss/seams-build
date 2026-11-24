import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, file, PROJECT, projectTree, symlink, tsconfig } from './project-fixtures'

const STORE = 'node_modules/.pnpm/shared@1.0.0/node_modules/shared'

describe('compileProject', () => {
  it('a package reached through two symlinked paths is one set of declarations and its class is assignable across them', () => {
    const tree = projectTree(
      tsconfig('tsconfig.json', { compilerOptions: BASE_OPTIONS, include: ['src'] }),
      file(
        'src/main.ts',
        [
          "import { Box as First } from 'first'",
          "import { Box as Second } from 'second'",
          'declare const first: First',
          'export const second: Second = first',
          '',
        ].join('\n'),
      ),
      symlink('node_modules/first', '.pnpm/shared@1.0.0/node_modules/shared'),
      symlink('node_modules/second', `/${STORE}`),
      file(`${STORE}/package.json`, JSON.stringify({ types: 'index.d.ts' })),
      file(`${STORE}/index.d.ts`, 'export declare class Box {\n  private readonly held;\n}\n'),
    )

    const result = compileProject(tree, PROJECT)

    expect(result.diagnostics).toEqual([])
  })
})
