export interface TestResult {
  readonly name: string
  readonly passed: boolean
}

export interface RunResult {
  readonly results: readonly TestResult[]
}

export interface TestRunner {
  readonly run: () => RunResult
}

export const createTestRunner = (): TestRunner => ({
  run: () => ({ results: [] }),
})
