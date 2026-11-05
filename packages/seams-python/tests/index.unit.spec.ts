import { describe, expect, it } from 'vitest'

import { createPython } from '../src/index'
import { createFakePython } from '../src/testing/index'

describe('createPython', () => {
  it('reports no pytest outcomes while the seam is a skeleton', () => {
    expect(createPython().pytest()).toEqual({ outcomes: [] })
  })
})

describe('createFakePython', () => {
  it('reports no pytest outcomes by default', () => {
    expect(createFakePython().pytest()).toEqual({ outcomes: [] })
  })

  it('returns the result it was given', () => {
    const result = { outcomes: [{ nodeId: 'tests/test_add.py::test_adds', passed: true }] }
    expect(createFakePython(result).pytest()).toBe(result)
  })
})
