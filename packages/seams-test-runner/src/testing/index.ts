import type { RunResult, TestRunner } from '../index'

export const createFakeTestRunner = (result: RunResult = { results: [] }): TestRunner => ({
  run: () => result,
})
