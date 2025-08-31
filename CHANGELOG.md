# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
