import type { PytestResult, Python } from '../index'

export const createFakePython = (result: PytestResult = { outcomes: [] }): Python => ({
  pytest: () => result,
})
