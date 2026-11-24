import { describe, expect, it } from 'vitest'

import { compileProject } from '../src/index'
import { BASE_OPTIONS, file, PROJECT, projectTree, tsconfig } from './project-fixtures'

const SOURCE = file('src/ok.ts', 'export const ok = 1\n')

const CONFIGS = [
  tsconfig('tsconfig.json', { compilerOptions: { ...BASE_OPTIONS, notAnOption: true }, include: ['src'] }),
  tsconfig('tsconfig.json', { extends: './missing.json', compilerOptions: BASE_OPTIONS, include: ['src'] }),
  file('tsconfig.json', '{ "compilerOptions": '),
]

describe('compileProject', () => {
  it('an unknown option, a missing extends target and a malformed tsconfig each come back as an error diagnostic without throwing', () => {
    const configErrors = CONFIGS.map(config =>
      compileProject(projectTree(config, SOURCE), PROJECT).diagnostics.some(
        diagnostic =>
          diagnostic.category === 'error' && (diagnostic.file === 'tsconfig.json' || diagnostic.message.includes('missing.json')),
      ),
    )

    expect(configErrors).toEqual([true, true, true])
  })
})
