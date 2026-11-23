# @ai-swfactory-oss/typescript

A pure TypeScript library. `compileTree(tree, options)` type-checks and emits the sources of a Tree in-process and returns the diagnostics and the emitted outputs as plain data. It takes no port, has no adapter and reads nothing from disk: every file the compiler reads, the standard library declaration files included, comes from the given Tree.

```ts
import { compileTree } from '@ai-swfactory-oss/typescript'

const { diagnostics, outputs } = compileTree(tree, {
  libDirectory: 'lib',
  lib: 'es2022',
  target: 'es2022',
  module: 'esnext',
  strict: true,
  declaration: true,
  emit: true,
})
```

- The sources are the Tree's `.ts`, `.tsx`, `.mts` and `.cts` files outside `libDirectory`.
- A diagnostic carries the file it names (or `null`), its 1-based line and column, its code, its category and its message.
- The outputs are a Tree of the emitted files, at the paths the compiler writes them. With `emit: false` it is empty.
- The options are the package's own plain data; no TypeScript compiler type appears in its public types.

## The standard library declaration files

The caller supplies the standard library declaration files in the Tree, under `libDirectory`, by these file names. They are the files of the same names that the `typescript` package ships in its `lib` directory. `lib` names the newest set the sources may use, and each set needs its own files and every file of the sets before it:

- `es5`: `lib.es5.d.ts`, `lib.decorators.d.ts`, `lib.decorators.legacy.d.ts`.
- `es2015`: `lib.es2015.d.ts`, `lib.es2015.core.d.ts`, `lib.es2015.collection.d.ts`, `lib.es2015.iterable.d.ts`, `lib.es2015.generator.d.ts`, `lib.es2015.promise.d.ts`, `lib.es2015.proxy.d.ts`, `lib.es2015.reflect.d.ts`, `lib.es2015.symbol.d.ts`, `lib.es2015.symbol.wellknown.d.ts`.
- `es2016`: `lib.es2016.d.ts`, `lib.es2016.array.include.d.ts`, `lib.es2016.intl.d.ts`.
- `es2017`: `lib.es2017.d.ts`, `lib.es2017.arraybuffer.d.ts`, `lib.es2017.date.d.ts`, `lib.es2017.intl.d.ts`, `lib.es2017.object.d.ts`, `lib.es2017.sharedmemory.d.ts`, `lib.es2017.string.d.ts`, `lib.es2017.typedarrays.d.ts`.
- `es2018`: `lib.es2018.d.ts`, `lib.es2018.asynciterable.d.ts`, `lib.es2018.asyncgenerator.d.ts`, `lib.es2018.promise.d.ts`, `lib.es2018.regexp.d.ts`, `lib.es2018.intl.d.ts`.
- `es2019`: `lib.es2019.d.ts`, `lib.es2019.array.d.ts`, `lib.es2019.object.d.ts`, `lib.es2019.string.d.ts`, `lib.es2019.symbol.d.ts`, `lib.es2019.intl.d.ts`.
- `es2020`: `lib.es2020.d.ts`, `lib.es2020.bigint.d.ts`, `lib.es2020.date.d.ts`, `lib.es2020.number.d.ts`, `lib.es2020.promise.d.ts`, `lib.es2020.sharedmemory.d.ts`, `lib.es2020.string.d.ts`, `lib.es2020.symbol.wellknown.d.ts`, `lib.es2020.intl.d.ts`.
- `es2021`: `lib.es2021.d.ts`, `lib.es2021.promise.d.ts`, `lib.es2021.string.d.ts`, `lib.es2021.weakref.d.ts`, `lib.es2021.intl.d.ts`.
- `es2022`: `lib.es2022.d.ts`, `lib.es2022.array.d.ts`, `lib.es2022.error.d.ts`, `lib.es2022.intl.d.ts`, `lib.es2022.object.d.ts`, `lib.es2022.regexp.d.ts`, `lib.es2022.string.d.ts`.

A file the compiler needs and the Tree lacks is reported as a diagnostic naming it.

## Licence

MIT
