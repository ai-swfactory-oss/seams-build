import type { CheckResult, TypeScript } from '../index'

export const createFakeTypeScript = (result: CheckResult = { diagnostics: [] }): TypeScript => ({
  check: () => result,
})
