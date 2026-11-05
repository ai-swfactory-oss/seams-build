import type { LoadResult, TypeScriptLoader } from '../index'

export const createFakeTypeScriptLoader = (result: LoadResult = { modules: [] }): TypeScriptLoader => ({
  load: () => result,
})
