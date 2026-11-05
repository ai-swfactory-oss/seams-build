import type { BundleResult, Rollup } from '../index'

export const createFakeRollup = (result: BundleResult = { files: [] }): Rollup => ({
  bundle: () => result,
})
