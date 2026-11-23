export type { TreeAlias, TreeAliasPattern, TreeResolution, TreeResolverConfig } from './resolve'
export { resolveInTree } from './resolve'

export interface EmittedFile {
  readonly path: string
  readonly contents: string
}

export interface BundleResult {
  readonly files: readonly EmittedFile[]
}

export interface Rollup {
  readonly bundle: () => BundleResult
}

export const createRollup = (): Rollup => ({
  bundle: () => ({ files: [] }),
})
