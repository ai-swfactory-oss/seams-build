import { describe, expect, it } from 'vitest'

import { createTypeScriptLoader } from '../src/index'
import { createFakeTypeScriptLoader } from '../src/testing/index'

describe('createTypeScriptLoader', () => {
  it('loads no modules while the seam is a skeleton', () => {
    expect(createTypeScriptLoader().load()).toEqual({ modules: [] })
  })
})

describe('createFakeTypeScriptLoader', () => {
  it('loads no modules by default', () => {
    expect(createFakeTypeScriptLoader().load()).toEqual({ modules: [] })
  })

  it('returns the result it was given', () => {
    const result = { modules: [{ path: 'index.ts' }] }
    expect(createFakeTypeScriptLoader(result).load()).toBe(result)
  })
})
