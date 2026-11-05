# seams-build

Seams for the build and test toolchain: TypeScript, its loader, Rollup, test runners and pytest. Each package puts a typed seam between code and one tool, with a fake under `./testing`.

The packages are skeletons for now: their code arrives by migration from `ai-swfactory/seams`.

## Packages

- `@ai-swfactory-oss/seams-typescript`: the TypeScript compiler seam.
- `@ai-swfactory-oss/seams-typescript-loader`: the TypeScript loader seam.
- `@ai-swfactory-oss/seams-rollup`: the Rollup bundler seam.
- `@ai-swfactory-oss/seams-test-runner`: the test runner seam.
- `@ai-swfactory-oss/seams-python`: the Python and pytest seam.

## Licence

MIT
