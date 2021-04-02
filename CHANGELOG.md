# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.3] – 2021-04-02

### Fixed

- Minor dependency upgrades

## [2.0.1] – 2020-12-20

### Added

- Documentation on `babel-plugin-class-bound-components`

## [2.0.0] – 2020-12-11

### Changed

- Modifiers moved from being members of the components instances to being pure functions. `extend`, `withVariants`, `withOptions` and `as` are now accessible as separate exports and receive the source component as first argument
- Package does not require `Symbol` polyfill anymore since the component config is now stored under a string key

## [1.1.1] – 2020-07-10

### Changed

- Minor `lodash` upgrade to fix vulnerability

### Fixed

- Move `coveralls` from dependencies to dev dependencies

## [1.1.0] – 2020-07-08

### Added

- Test coverage with `coveralls`
- ESlint integration
- Tests for environments without global `Proxy`
- Thread through `forwardRef` if possible

## [1.0.0] - 2020-05-23

### Added

- Initial version containing `createClassBoundComponent` function with proxy and TypeScript
