import { describe, expect, it } from 'vitest'

import { createTypeScript } from '../src/index'
import { createFakeTypeScript } from '../src/testing/index'

describe('createTypeScript', () => {
  it('reports no diagnostics while the seam is a skeleton', () => {
    expect(createTypeScript().check()).toEqual({ diagnostics: [] })
  })
})

describe('createFakeTypeScript', () => {
  it('reports no diagnostics by default', () => {
    expect(createFakeTypeScript().check()).toEqual({ diagnostics: [] })
  })

  it('returns the result it was given', () => {
    const result = { diagnostics: [{ file: 'index.ts', message: 'unused' }] }
    expect(createFakeTypeScript(result).check()).toBe(result)
  })
})
