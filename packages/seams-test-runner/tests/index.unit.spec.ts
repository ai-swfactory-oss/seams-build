import { describe, expect, it } from 'vitest'

import { createTestRunner } from '../src/index'
import { createFakeTestRunner } from '../src/testing/index'

describe('createTestRunner', () => {
  it('reports no results while the seam is a skeleton', () => {
    expect(createTestRunner().run()).toEqual({ results: [] })
  })
})

describe('createFakeTestRunner', () => {
  it('reports no results by default', () => {
    expect(createFakeTestRunner().run()).toEqual({ results: [] })
  })

  it('returns the result it was given', () => {
    const result = { results: [{ name: 'adds', passed: true }] }
    expect(createFakeTestRunner(result).run()).toBe(result)
  })
})
