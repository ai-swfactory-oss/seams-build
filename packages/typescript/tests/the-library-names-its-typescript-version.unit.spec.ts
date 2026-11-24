import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { typescriptVersion } from '../src/index'

describe('typescriptVersion', () => {
  it('typescriptVersion is the version of the compiler the library runs', () => {
    expect(typescriptVersion).toBe(ts.version)
  })
})
