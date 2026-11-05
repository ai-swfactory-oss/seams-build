import { describe, expect, it } from 'vitest'

import { createRollup } from '../src/index'
import { createFakeRollup } from '../src/testing/index'

describe('createRollup', () => {
  it('emits no files while the seam is a skeleton', () => {
    expect(createRollup().bundle()).toEqual({ files: [] })
  })
})

describe('createFakeRollup', () => {
  it('emits no files by default', () => {
    expect(createFakeRollup().bundle()).toEqual({ files: [] })
  })

  it('returns the result it was given', () => {
    const result = { files: [{ path: 'index.js', contents: 'export {}\n' }] }
    expect(createFakeRollup(result).bundle()).toBe(result)
  })
})
