import { createMemoryFiles } from '@ai-swfactory-oss/files/memory'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { standardLibrarySelection } from '../src/index'

const libDirectory = ts
  .getDefaultLibFilePath({})
  .replace(/\/[^/]*$/, '')
  .replace(/^\/+/, '')

describe('standardLibrarySelection', () => {
  it("the standard library selection is rooted at the running compiler's lib directory and selects its lib declaration files", async () => {
    const created = createMemoryFiles({
      entries: [
        { path: `${libDirectory}/lib.es5.d.ts`, kind: 'file', content: '', executable: false },
        { path: `${libDirectory}/lib.es2022.d.ts`, kind: 'file', content: '', executable: false },
        { path: `${libDirectory}/tsc.js`, kind: 'file', content: '', executable: false },
        { path: `${libDirectory}/typescript.d.ts`, kind: 'file', content: '', executable: false },
        { path: 'elsewhere/lib.es5.d.ts', kind: 'file', content: '', executable: false },
      ],
    })
    if (created.kind !== 'files') throw new Error(created.kind)

    const snapshot = await created.files.snapshot(standardLibrarySelection)
    if (snapshot.kind !== 'snapshot') throw new Error(snapshot.kind)

    expect([standardLibrarySelection.root, snapshot.tree.entries.map(entry => entry.path)]).toEqual([
      libDirectory,
      [`${libDirectory}/lib.es2022.d.ts`, `${libDirectory}/lib.es5.d.ts`],
    ])
  })
})
