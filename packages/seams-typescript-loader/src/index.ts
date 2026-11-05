export interface LoadedModule {
  readonly path: string
}

export interface LoadResult {
  readonly modules: readonly LoadedModule[]
}

export interface TypeScriptLoader {
  readonly load: () => LoadResult
}

export const createTypeScriptLoader = (): TypeScriptLoader => ({
  load: () => ({ modules: [] }),
})
