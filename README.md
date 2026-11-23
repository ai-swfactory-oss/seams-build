# seams-build

Libraries for the build and test toolchain: TypeScript, Rollup, test runners and pytest.

`@ai-swfactory-oss/typescript` is a pure library over a Tree. The other packages are still the guarded skeleton: each one's create function returns a seam that reports an empty result, and its `./testing` holds a fake of that seam.

## Packages

- `@ai-swfactory-oss/typescript`: type-checks and emits the sources of a Tree in-process, and returns diagnostics and emitted outputs as data.
- `@ai-swfactory-oss/seams-rollup`: the Rollup bundler seam.
- `@ai-swfactory-oss/seams-test-runner`: the test runner seam.
- `@ai-swfactory-oss/seams-python`: the Python and pytest seam.

## Licence

MIT
