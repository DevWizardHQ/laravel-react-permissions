# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.1.5 - 2025-01-27

### Fixed

- **Critical Fix**: Fixed `ReferenceError: all is not defined` error when using hyphenated
  permission names in expressions
- Fixed regex word boundary issue that prevented proper matching of permissions containing hyphens
  (e.g., `view-all`, `user-profile.edit`)
- Permission expressions like `visitor.request.view-all||visitor.request.view-department` now work
  correctly

### Added

- Comprehensive test suite for hyphenated permissions covering various edge cases
- Support for complex nested expressions with hyphenated permission names
- Better handling of mixed permission types (hyphenated and non-hyphenated)

### Technical Details

- Updated `evaluatePermissionExpression` function to use word boundaries only for non-hyphenated
  permissions
- Hyphenated permissions now use simple regex matching instead of word boundaries
- Maintains backward compatibility with existing non-hyphenated permissions

## v1.1.4 - 2025-09-25

### What's Changed

- fix: double pipe issue by @iqbalhasandev in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/23

**Full Changelog**: https://github.com/DevWizardHQ/laravel-react-permissions/compare/v1.1.3...v1.1.4

## v1.1.3 - 2025-01-27

### Fixed

- **Logical operators without spaces**: Fixed issue where logical operators (`||`, `&&`, `|`, `&`)
  were not working when used without spaces around them (e.g.,
  `properties.view-all||properties.view-own`)
- **Permission names with hyphens**: Updated regex pattern to properly support permission names
  containing hyphens (e.g., `properties.view-all`, `user-profile.edit`)
- **Operator normalization**: Improved operator normalization logic to prevent double replacement
  issues

### Added

- **Comprehensive test coverage**: Added extensive test suite for logical operators without spaces,
  covering various edge cases and scenarios
- **Hyphenated permission support**: Full support for permission names with hyphens in logical
  expressions

### Technical Details

- Updated regex pattern from `[a-zA-Z0-9_.*?]*` to `[a-zA-Z0-9_.*?-]*` to include hyphens
- Fixed operator normalization using negative lookbehind to prevent double replacement
- Added 12 new test cases covering no-spaces scenarios, hyphenated permissions, and edge cases

## v1.1.2 - 2025-09-19

### What's Changed

- build(deps-dev): bump jest-environment-jsdom from 30.1.1 to 30.1.2 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/3
- build(deps-dev): bump jest from 30.1.1 to 30.1.2 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/4
- build(deps-dev): bump eslint from 9.34.0 to 9.35.0 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/6
- build(deps-dev): bump @typescript-eslint/eslint-plugin from 8.41.0 to 8.43.0 by @dependabot[bot]
  in https://github.com/DevWizardHQ/laravel-react-permissions/pull/8
- build(deps-dev): bump @typescript-eslint/parser from 8.41.0 to 8.43.0 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/9
- build(deps-dev): bump jest from 30.1.2 to 30.1.3 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/7
- build(deps-dev): bump @typescript-eslint/eslint-plugin from 8.43.0 to 8.44.0 by @dependabot[bot]
  in https://github.com/DevWizardHQ/laravel-react-permissions/pull/10
- build(deps-dev): bump ts-jest from 29.4.1 to 29.4.2 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/11
- build(deps-dev): bump @types/react from 19.1.12 to 19.1.13 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/12
- build(deps-dev): bump globals from 16.3.0 to 16.4.0 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/14
- fix: Wildcard pattern matching fails when userPermissions array is empty by @iqbalhasandev in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/16
- build(deps): bump actions/setup-node from 4 to 5 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/5

**Full Changelog**: https://github.com/DevWizardHQ/laravel-react-permissions/compare/v1.1.1...v1.1.2

## v1.1.1 - 2025-08-31

### What's Changed

- Fix: Improve TypeScript import suggestions and module exports by @iqbalhasandev in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/2

### New Contributors

- @iqbalhasandev made their first contribution in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/2

**Full Changelog**: https://github.com/DevWizardHQ/laravel-react-permissions/compare/v1.1.0...v1.1.1

## 0.1.0 - 2025-08-31

##### Added

- Initial release of @devwizard/laravel-react-permissions
- Core `<Can>` component for conditional rendering
- `usePermissions` hook for programmatic permission checking
- `withPermission` HOC for component wrapping
- Advanced pattern matching with wildcards (`*`) and single chars (`?`)
- Boolean logic support with logical operators (`||`, `&&`, `|`, `&`)
- Custom permissions array support
- Expression validation and safe evaluation
- Full TypeScript support with type definitions
- Comprehensive documentation and examples
- Laravel Spatie Permission integration
- Performance optimizations with memoization
- Zero-dependency architecture (only peer dependencies)

##### Features

- Pattern matching: `users.*`, `admin.?dit`
- Boolean expressions: `(users.* || posts.*) && admin.access`
- Custom permissions: Override auth with custom arrays
- Safe evaluation: Protected against code injection
- Laravel conventions: Follows `@can` directive patterns
- TypeScript: Complete type safety and IntelliSense

##### Documentation

- Complete setup guide
- Pattern matching examples
- API reference documentation
- Real-world usage scenarios
- Migration guide from other solutions

### What's Changed

- build(deps): bump actions/checkout from 4 to 5 by @dependabot[bot] in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/1

### New Contributors

- @dependabot[bot] made their first contribution in
  https://github.com/DevWizardHQ/laravel-react-permissions/pull/1

**Full Changelog**: https://github.com/DevWizardHQ/laravel-react-permissions/commits/0.1.0
