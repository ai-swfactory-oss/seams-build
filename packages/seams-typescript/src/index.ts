export interface Diagnostic {
  readonly file: string
  readonly message: string
}

export interface CheckResult {
  readonly diagnostics: readonly Diagnostic[]
}

export interface TypeScript {
  readonly check: () => CheckResult
}

export const createTypeScript = (): TypeScript => ({
  check: () => ({ diagnostics: [] }),
})
