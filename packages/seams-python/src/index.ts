export interface PytestOutcome {
  readonly nodeId: string
  readonly passed: boolean
}

export interface PytestResult {
  readonly outcomes: readonly PytestOutcome[]
}

export interface Python {
  readonly pytest: () => PytestResult
}

export const createPython = (): Python => ({
  pytest: () => ({ outcomes: [] }),
})
