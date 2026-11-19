# seams-build

Seams for the build and test toolchain: TypeScript, its loader, Rollup, test runners and pytest. Each package puts a typed seam between code and one tool, with a fake under `./testing`.

This repository holds only the guarded skeleton so far: each package's create function returns a seam that reports an empty result, and its `./testing` holds a fake of that seam.

## Packages

- `@ai-swfactory-oss/seams-typescript`: the TypeScript compiler seam.
- `@ai-swfactory-oss/seams-typescript-loader`: the TypeScript loader seam.
- `@ai-swfactory-oss/seams-rollup`: the Rollup bundler seam.
- `@ai-swfactory-oss/seams-test-runner`: the test runner seam.
- `@ai-swfactory-oss/seams-python`: the Python and pytest seam.

## Licence

MIT
