# @devwizard/laravel-react-permissions

<div align="center">

[![npm version](https://img.shields.io/npm/v/@devwizard/laravel-react-permissions.svg)](https://www.npmjs.com/package/@devwizard/laravel-react-permissions)
[![npm downloads](https://img.shields.io/npm/dt/@devwizard/laravel-react-permissions.svg)](https://www.npmjs.com/package/@devwizard/laravel-react-permissions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tree Shakeable](https://img.shields.io/badge/Tree%20Shakeable-✓-brightgreen.svg)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen.svg)](#)

**🔐 Modern, Laravel-inspired permissions system for React/Inertia.js**

_Advanced pattern matching • Boolean expressions • Zero dependencies • Full TypeScript support_

[📖 Documentation](#-installation) • [🚀 Quick Start](#️-quick-setup) •
[💡 Examples](#-advanced-use-cases) • [🎯 Patterns](#-pattern-matching)

</div>

---

## 🌟 Why Choose This Package?

- 🎯 **Laravel-First** - Built specifically for Laravel + Inertia.js stack
- ⚡ **Zero Setup** - Works out of the box, no providers needed
- 🧠 **Smart Patterns** - Advanced wildcard and boolean logic support
- 📦 **Tiny Bundle** - Only 17.7kB, tree-shakeable, zero dependencies
- 🔒 **Type Safe** - Full TypeScript support with excellent IntelliSense
- 🎨 **Modern React** - Hooks-first design, no legacy patterns

## 🚀 Features

- ✅ **Laravel Convention** - Follows `@can` directive pattern from Laravel Blade
- ✅ **Advanced Pattern Matching** - Wildcards (`*`), single chars (`?`), complex expressions
- ✅ **Boolean Logic Support** - Boolean values and logical operators (`||`, `&&`, `|`, `&`)
- ✅ **Custom Permissions** - Override auth permissions with custom arrays
- ✅ **Expression Validation** - Safe evaluation of complex permission expressions
- ✅ **TypeScript Support** - Full type safety with excellent IntelliSense
- ✅ **Spatie Integration** - Seamless integration with Laravel Spatie Permission
- ✅ **Performance Optimized** - Efficient pattern matching and memoization
- ✅ **Zero Dependencies** - Only peer dependencies on React and Inertia.js

## 📦 Installation

```bash
npm install @devwizard/laravel-react-permissions
# or
yarn add @devwizard/laravel-react-permissions
# or
pnpm add @devwizard/laravel-react-permissions
```

## 🏗️ Quick Setup

### 1. Laravel Backend Setup

Add permissions to your Inertia middleware:

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
            ] : null,
        ],
    ];
}
```

### 2. React Frontend Usage

```tsx
import { Can, usePermissions } from '@devwizard/laravel-react-permissions';

// Basic usage
function UserManagement() {
  return (
    <Can permission="users.create">
      <button>Create User</button>
    </Can>
  );
}

// Advanced patterns
function AdminPanel() {
  const { hasPermission } = usePermissions();
  const canAccess = hasPermission('admin.* || moderator.users');

  return (
    <Can permission="(admin.* || moderator.*) && active.user">
      <AdminDashboard />
    </Can>
  );
}

// Custom permissions
function FeatureFlag() {
  const featurePermissions = ['feature.beta', 'feature.advanced'];

  return (
    <Can
      permission="feature.beta"
      permissions={featurePermissions}
      fallback={<div>Feature not available</div>}
    >
      <BetaFeature />
    </Can>
  );
}
```

## 🎯 Core Components

### `<Can>` Component

React component for conditional rendering based on permissions:

```tsx
<Can permission="users.* || admin.access" fallback={<div>Access denied</div>}>
  <UserManagement />
</Can>
```

**Props:**

- `permission?: string | boolean` - Permission to check (supports patterns and boolean logic)
- `permissions?: string[]` - Custom permissions array (overrides auth permissions)
- `fallback?: ReactNode` - What to render when access is denied
- `children: ReactNode` - Content to render when access is granted

### `usePermissions` Hook

Hook for programmatic permission checking:

```tsx
const { hasPermission, permissions } = usePermissions();
const canEdit = hasPermission('posts.edit || posts.moderate');

// With custom permissions
const { hasPermission } = usePermissions(['custom.perm', 'another.perm']);
```

**Parameters:**

- `permissions?: string[]` - Optional custom permissions array

**Returns:**

- `hasPermission: (permission: string | boolean) => boolean` - Check permission function
- `permissions: string[]` - Current permissions array
- `hasAnyPermission: (permissions: string[]) => boolean` - Check any of multiple permissions
- `hasAllPermissions: (permissions: string[]) => boolean` - Check all permissions
- `isAuthenticated: boolean` - Authentication status

### `withPermission` HOC

Higher-order component for wrapping components:

```tsx
const ProtectedComponent = withPermission(MyComponent, 'admin.access', <Unauthorized />);

// With custom permissions
const ProtectedFeature = withPermission(
  FeatureComponent,
  'feature.beta',
  <div>Feature not available</div>,
  ['feature.beta', 'admin.override']
);
```

## 🔍 Pattern Matching

### Wildcards (`*`) - Match Any Characters

```tsx
<Can permission="users.*">        {/* users.create, users.edit, users.delete */}
<Can permission="admin.*">        {/* admin.users, admin.settings, admin.logs */}
<Can permission="*.create">       {/* users.create, posts.create, etc. */}
```

### Single Characters (`?`) - Match One Character

```tsx
<Can permission="user?.edit">     {/* user1.edit, user2.edit, userA.edit */}
<Can permission="level?.access">  {/* level1.access, level2.access, etc. */}
```

### Boolean Logic - Logical Operators

```tsx
<Can permission="users.edit || posts.edit">           {/* OR logic */}
<Can permission="admin.access && users.manage">       {/* AND logic */}
<Can permission="(users.* || posts.*) && active">     {/* Grouped expressions */}
<Can permission="true">                               {/* Always allow */}
<Can permission="false">                              {/* Always deny */}
```

### Complex Expressions

```tsx
{
  /* Multiple operators */
}
<Can permission="(admin.* && active) || (moderator.* && verified)">
  <SensitiveData />
</Can>;

{
  /* Pattern combinations */
}
<Can permission="*.create || admin.* || super.user">
  <CreateButton />
</Can>;

{
  /* Business logic */
}
<Can permission="(department.hr && level.manager) || admin.override">
  <EmployeeData />
</Can>;
```

## 🎨 Advanced Use Cases

### Dynamic Permissions from API

```tsx
function TenantDashboard() {
  const [tenantPermissions, setTenantPermissions] = useState([]);

  useEffect(() => {
    fetchTenantPermissions().then(setTenantPermissions);
  }, []);

  return (
    <Can permission="tenant.admin || tenant.manager" permissions={tenantPermissions}>
      <TenantControls />
    </Can>
  );
}
```

### Feature Flags

```tsx
const featureFlags = ['feature.newUi', 'feature.advancedSearch'];

<Can permission="feature.newUi" permissions={featureFlags}>
  <NewUserInterface />
</Can>;
```

### Testing Scenarios

```tsx
// Mock permissions for testing
const mockPermissions = ['users.view', 'posts.create'];

<Can permission="users.view" permissions={mockPermissions}>
    <TestComponent />
</Can>

// No permissions (empty array)
<Can permission="admin.access" permissions={[]}>
    <div>Should not render</div>
</Can>
```

### Custom Permission Sources

```tsx
// From localStorage
const savedPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

// From API response
const apiPermissions = user?.customPermissions || [];

// From configuration
const configPermissions = ['feature.beta', 'admin.access'];

<Can permission="feature.beta" permissions={configPermissions}>
  <BetaFeature />
</Can>;
```

## 🔧 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  CanProps,
  UsePermissionsReturn,
  WithPermissionOptions,
} from '@devwizard/laravel-react-permissions';

// Typed component
const MyPermissionComponent: React.FC<CanProps> = ({ permission, permissions, children }) => {
  return (
    <Can permission={permission} permissions={permissions}>
      {children}
    </Can>
  );
};

// Typed hook usage
const PermissionChecker: React.FC = () => {
  const { hasPermission, permissions, isAuthenticated }: UsePermissionsReturn = usePermissions();

  return <div>{isAuthenticated && hasPermission('users.view') && <UserList />}</div>;
};
```

## 🧪 Compatibility

- **React**: 18.x, 19.x
- **Inertia.js**: 1.x, 2.x
- **TypeScript**: 5.x+
- **Node.js**: 16.x+

## 📊 Performance

- **Zero Runtime Dependencies** - Only peer dependencies
- **Tree Shakeable** - Import only what you need
- **Optimized Pattern Matching** - Efficient regex compilation
- **Memoized Results** - Cached permission evaluations
- **Small Bundle Size** - Minimal overhead

## 🛡️ Security

- **Safe Expression Evaluation** - Protected against code injection
- **Input Validation** - Syntax checking for complex expressions
- **No Eval Usage** - Uses Function constructor safely
- **Permission Isolation** - Custom permissions don't affect auth state

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**IQBAL HASAN**

- GitHub: [@devwizardHq](https://github.com/devwizardHq)
- Organization: [DevWizard](https://github.com/devwizardHq)

## 🙏 Acknowledgments

- Laravel team for the excellent `@can` directive inspiration
- Spatie for the Laravel Permission package
- Inertia.js team for the seamless React-Laravel integration

---

Made with ❤️ by [DevWizard](https://github.com/devwizardHq)

## 🏗️ Quick Setup

### 1. Laravel Backend Setup

Add permissions to your Inertia middleware:

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
            ] : null,
        ],
    ];
}
```

### 2. React Frontend Usage

```tsx
import { Can, usePermissions } from '@devwizard/laravel-react-permissions';

// Basic usage
function UserManagement() {
  return (
    <Can permission="users.create">
      <button>Create User</button>
    </Can>
  );
}

// Advanced patterns
function AdminPanel() {
  const { hasPermission } = usePermissions();
  const canAccess = hasPermission('admin.* || moderator.users');

  return (
    <Can permission="(admin.* || moderator.*) && active.user">
      <AdminDashboard />
    </Can>
  );
}

// Custom permissions
function FeatureFlag() {
  const featurePermissions = ['feature.beta', 'feature.advanced'];

  return (
    <Can
      permission="feature.beta"
      permissions={featurePermissions}
      fallback={<div>Feature not available</div>}
    >
      <BetaFeature />
    </Can>
  );
}
```

## 🔍 Advanced Pattern Matching & Boolean Logic

The permissions system supports powerful pattern matching and boolean expressions for maximum
flexibility:

### Boolean Values

#### Built-in Boolean Support

```tsx
<Can permission="true">      {/* Always visible to authenticated users */}
<Can permission="false">     {/* Never visible (useful for testing) */}
```

### Logical Operators

#### 1. OR Operators (`||` and `|`)

```tsx
<Can permission="users.* || posts.*">        {/* User management OR post management */}
<Can permission="admin.access | manager.access">  {/* Admin OR manager access */}
```

#### 2. AND Operators (`&&` and `&`)

```tsx
<Can permission="users.* && admin.access">   {/* User permissions AND admin access */}
<Can permission="reports.view & security.clearance">  {/* Reports AND security clearance */}
```

#### 3. Complex Expressions with Parentheses

```tsx
<Can permission="(users.* || posts.*) && admin.access">
  {/* (User OR post management) AND admin access */}
</Can>

<Can expression="(admin.* && security.*) || system.override">
  {/* Admin with security OR system override */}
</Can>
```

### Custom Permissions Support

Instead of always using auth permissions, you can provide your own permissions array:

#### Using Custom Permissions

```tsx
// Static permissions array
const staticPerms = ['users.create', 'users.edit', 'posts.view'];

<Can
  permission="users.create"
  permissions={staticPerms}
>
  <CreateUserButton />
</Can>

// Dynamic permissions from API or localStorage
<Can
  permission="posts.view || posts.edit"
  permissions={getDynamicPermissions()}
>
  <PostManagement />
</Can>

// Empty permissions (no access)
<Can
  permission="admin.access"
  permissions={[]}
  fallback={<div>No permissions available</div>}
>
  <AdminPanel />
</Can>
```

#### Hook with Custom Permissions

```tsx
const customPerms = ['feature.beta', 'admin.override'];
const { hasPermission } = usePermissions(customPerms);

const hasBeta = hasPermission('feature.beta'); // true
const hasAdmin = hasPermission('admin.access'); // false (not in custom array)
```

#### Common Use Cases

- **Feature Flags**: `permissions={featureFlags}`
- **Static Config**: `permissions={configPermissions}`
- **API Response**: `permissions={apiPermissions}`
- **Testing**: `permissions={mockPermissions}` or `permissions={[]}`
- **localStorage**: `permissions={JSON.parse(localStorage.getItem('perms'))}`

### Pattern Types

#### 1. Wildcard (`*`) - Match Any Characters

```tsx
<Can permission="users.*">     {/* matches: users.create, users.edit, users.delete */}
<Can permission="admin.*">     {/* matches: admin.users, admin.settings, admin.reports */}
```

#### 2. Single Character (`?`) - Match One Character

```tsx
<Can permission="user?.edit">  {/* matches: user1.edit, user2.edit, userA.edit */}
<Can permission="level?.view"> {/* matches: level1.view, level2.view, level3.view */}
```

#### 3. Exact Match - No Wildcards

```tsx
<Can permission="users.create">  {/* exact match only */}
```

### Advanced Usage Examples

```tsx
// Boolean with logical operators
<Can permission="users.* && (admin.access || true)">
  <div>User management (admin access helps but not required)</div>
</Can>

// Complex multi-level logic
<Can permission="(admin.* && security.*) || (manager.* && reports.view) || system.override">
  <div>Multiple access paths to sensitive data</div>
</Can>

// Feature flags with boolean logic
<Can permission="feature.beta || admin.access">
  <div>Beta feature or admin access</div>
</Can>

// Negation (coming soon)
<Can permission="admin.access && !feature.disabled">
  <div>Admin access unless feature is disabled</div>
</Can>
```

### Expression Validation

```tsx
const { isValidExpression, checkExpression } = usePermissions();

// Validate expressions before using them
const isValid = isValidExpression('users.* && (admin.access || manager.role)');
const result = checkExpression('(admin.* && security.*) || system.override');
```

## 📋 API Reference

- ✅ **Can Component** - Conditionally render components (similar to Laravel's `@can` Blade
  directive)
- ✅ **usePermissions Hook** - Check permissions programmatically
- ✅ **withPermission HOC** - Wrap components with permission logic
- ✅ **Navigation Integration** - Permission-aware navigation items
- ✅ **Boolean Logic Support** - Boolean values (`true`/`false`) and logical operators (`||`, `&&`,
  `|`, `&`)
- ✅ **Advanced Pattern Matching** - Wildcards (`*`), single chars (`?`), complex expressions
- ✅ **Expression Validation** - Syntax checking and safe evaluation of complex expressions
- ✅ **Flexible Permission Checking** - Single, multiple, all, any, pattern-based, and boolean logic
- ✅ **TypeScript Support** - Fully typed

## Installation

1. Copy this entire `permissions` folder to your `resources/js/` directory
2. Update your Laravel middleware to pass permissions via Inertia props
3. Import and use the components

## Laravel Backend Setup

Add to your `HandleInertiaRequests.php` middleware:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user() ? [
                ...$request->user()->toArray(),
                'permissions' => $request->user()->getAllPermissions()->pluck('name'),
            ] : null,
        ],
    ];
}
```

## Usage

## Component Usage

The `<Can>` component follows Laravel's `@can` convention and supports:

- **Pattern matching** with wildcards (`*`) and single chars (`?`)
- **Boolean logic** (true/false permissions)
- **Logical operators** (`||`, `&&`, `|`, `&`)
- **Custom permissions** array override
- **Fallback rendering** for unauthorized access

### Basic Permission Check

```tsx
import { Can } from '@/permissions';

<Can permission="users.create">
  <button>Create User</button>
</Can>;
```

### Using the Hook

```tsx
import { usePermissions } from '@/permissions';

function MyComponent() {
  const { hasPermission } = usePermissions();

  return <div>{hasPermission('users.edit') && <button>Edit User</button>}</div>;
}
```

### Navigation with Permissions

```tsx
import { type NavItem } from '@/permissions';

const navItems: NavItem[] = [
  {
    title: 'Users',
    href: '/users',
    permission: 'users.view',
  },
  {
    title: 'Admin',
    href: '/admin',
    pattern: 'admin.*',
  },
];
```

### Higher-Order Component

```tsx
import { withPermission } from '@/permissions';

const ProtectedComponent = withPermission(MyComponent, {
  permission: 'admin.access',
  fallback: <div>Access denied</div>,
});
```

## Component API

### Can Component

Props:

- `permission?: string` - Single permission (supports patterns, boolean values, and logical
  operators)
- `expression?: string` - Complex boolean expression with logical operators
- `anyPermissions?: string[]` - User needs ANY of these (each can be a pattern/expression)
- `allPermissions?: string[]` - User needs ALL of these (each can be a pattern/expression)
- `pattern?: string` - Legacy wildcard pattern (use `permission` prop instead)
- `anyPatterns?: string[]` - User needs ANY pattern match
- `allPatterns?: string[]` - User needs ALL pattern matches
- `fallback?: ReactNode` - Rendered when permission denied
- `requireAuth?: boolean` - Require authentication (default: true)

### usePermissions Hook

Returns:

- `userPermissions: string[]` - User's permissions
- `hasPermission(permission: string): boolean` - Check permission (supports all features)
- `hasAnyPermission(permissions: string[]): boolean` - Check any permission
- `hasAllPermissions(permissions: string[]): boolean` - Check all permissions
- `hasPermissionPattern(pattern: string): boolean` - Advanced pattern checking
- `hasAnyPattern(patterns: string[]): boolean` - Check any pattern matches
- `hasAllPatterns(patterns: string[]): boolean` - Check all patterns match
- `getMatchingPermissions(pattern: string): string[]` - Get permissions matching pattern
- `checkExpression(expression: string): boolean` - Evaluate complex boolean expressions
- `isValidExpression(expression: string): boolean` - Validate expression syntax
- `isAuthenticated: boolean` - User authentication status

## File Structure

```
permissions/
├── index.ts                    # Main exports
├── components/
│   ├── can.tsx                 # Main Can component
│   └── with-permission.tsx     # HOC wrapper
├── hooks/
│   └── use-permissions.tsx     # Main permissions hook
└── types/
    └── index.ts                # TypeScript definitions
```

## Integration with Existing Projects

1. Copy the entire `permissions` folder
2. Update import paths if your project structure differs
3. Ensure your Laravel backend passes permissions via Inertia props
4. Update your existing components to use `<Can>` instead of manual permission checks

## Laravel Conventions

- Component names follow Laravel patterns (`Can` ≈ `@can`)
- Permission patterns match Laravel conventions (`resource.action`)
- File structure follows Laravel organizational principles
- TypeScript interfaces mirror Laravel model structures

## 📚 Detailed API Reference

### `<Can>` Component Interface

```tsx
interface CanProps {
  permission: string | boolean; // Permission to check
  permissions?: string[]; // Optional custom permissions array
  fallback?: React.ReactNode; // Content to render when access denied
  children: React.ReactNode; // Content to render when access granted
}
```

**Examples:**

```tsx
// Using auth permissions (default)
<Can permission="users.create">
  <CreateButton />
</Can>

// Using custom permissions array
<Can
  permission="admin.access"
  permissions={['admin.access', 'super.user']}
>
  <AdminPanel />
</Can>

// With fallback
<Can
  permission="posts.view"
  fallback={<div>No access</div>}
>
  <PostList />
</Can>
```

### `usePermissions` Hook Interface

```tsx
function usePermissions(permissions?: string[]): {
  hasPermission: (permission: string | boolean) => boolean;
  permissions: string[];
};
```

**Parameters:**

- `permissions` (optional): Array of permissions to use instead of auth permissions

**Returns:**

- `hasPermission`: Function to check if user has a specific permission
- `permissions`: Current permissions array being used

**Examples:**

```tsx
// Using auth permissions
const { hasPermission, permissions } = usePermissions();

// Using custom permissions
const { hasPermission } = usePermissions(['custom.perm', 'another.perm']);

// Check permissions
const canEdit = hasPermission('posts.edit');
const hasAny = hasPermission('admin.* || moderator.*');
```

### `withPermission` HOC Interface

```tsx
function withPermission<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  requiredPermission: string | boolean,
  fallback?: React.ReactNode,
  permissions?: string[]
): React.ComponentType<T>;
```

**Parameters:**

- `WrappedComponent`: Component to wrap
- `requiredPermission`: Permission required to render component
- `fallback` (optional): What to render when access denied
- `permissions` (optional): Custom permissions array

**Examples:**

```tsx
// Basic HOC usage
const ProtectedUserList = withPermission(UserList, 'users.view', <div>No access to users</div>);

// With custom permissions
const ProtectedFeature = withPermission(
  FeatureComponent,
  'feature.beta',
  <div>Feature not available</div>,
  ['feature.beta', 'admin.override']
);
```

## 🔍 Pattern Matching

### Wildcards (`*`)

```tsx
<Can permission="users.*">        {/* users.create, users.edit, users.delete */}
<Can permission="admin.*">        {/* admin.users, admin.settings, admin.logs */}
<Can permission="*.create">       {/* users.create, posts.create, etc. */}
```

### Single Characters (`?`)

```tsx
<Can permission="user?.edit">     {/* user1.edit, user2.edit, userA.edit */}
<Can permission="level?.access">  {/* level1.access, level2.access, etc. */}
```

### Boolean Logic

```tsx
<Can permission="users.edit || posts.edit">           {/* OR logic */}
<Can permission="admin.access && users.manage">       {/* AND logic */}
<Can permission="(users.* || posts.*) && active">     {/* Grouped expressions */}
<Can permission="true">                               {/* Always allow */}
<Can permission="false">                              {/* Always deny */}
```

## 🎨 Advanced Examples

### Dynamic Permissions from API

```tsx
function TenantDashboard() {
  const [tenantPermissions, setTenantPermissions] = useState([]);

  useEffect(() => {
    fetchTenantPermissions().then(setTenantPermissions);
  }, []);

  return (
    <Can permission="tenant.admin || tenant.manager" permissions={tenantPermissions}>
      <TenantControls />
    </Can>
  );
}
```

### Feature Flags

```tsx
const featureFlags = ['feature.newUi', 'feature.advancedSearch'];

<Can permission="feature.newUi" permissions={featureFlags}>
  <NewUserInterface />
</Can>;
```

### Complex Business Logic

```tsx
<Can permission="(department.hr && level.manager) || admin.override">
  <SensitiveEmployeeData />
</Can>
```

## 📚 Documentation

- [Changelog](./CHANGELOG.md) - Version history and updates

## 🔧 TypeScript Support

Full TypeScript support with proper type definitions:

```tsx
import type { CanProps, UsePermissionsReturn } from '@devwizard/laravel-react-permissions';

const MyComponent: React.FC<CanProps> = ({ permission, children }) => {
  const { hasPermission }: UsePermissionsReturn = usePermissions();
  return <Can permission={permission}>{children}</Can>;
};
```

## 📊 Performance & Bundle Size

### Bundle Analysis

- **📦 Package Size**: 17.7kB (minified)
- **🗜️ Gzipped**: ~5.2kB
- **🌳 Tree Shakeable**: ✅ Import only what you use
- **📱 Runtime**: Zero dependencies, React peer only
- **⚡ Performance**: Memoized pattern matching, optimized algorithms

### Bundle Impact

```bash
# Only import what you need - tree shaking works perfectly
import { Can } from '@devwizard/laravel-react-permissions';           # ~3kB
import { usePermissions } from '@devwizard/laravel-react-permissions'; # ~2kB
import { withPermission } from '@devwizard/laravel-react-permissions'; # ~1kB
```

### Browser Support

- ✅ **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- ✅ **ES Modules**: Native ESM support
- ✅ **CommonJS**: Node.js compatibility
- ✅ **TypeScript**: 5.x+ with strict mode

## 🧪 Compatibility

- **React**: 18.x, 19.x
- **Inertia.js**: 1.x, 2.x
- **TypeScript**: 5.x+
- **Node.js**: 16.x+
- **Package Managers**: npm 7+, yarn 1.22+, pnpm 6+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**IQBAL HASAN**

- GitHub: [@devwizardHq](https://github.com/devwizardHq)
- Organization: [DevWizard](https://github.com/devwizardHq)

## 🙏 Acknowledgments

- Laravel team for the excellent `@can` directive inspiration
- Spatie for the Laravel Permission package
- Inertia.js team for the seamless React-Laravel integration

## 📊 Stats

- Zero runtime dependencies
- Tree-shakeable
- TypeScript native
- React 18/19 compatible
- Laravel convention compliant

---

Made with ❤️ by [DevWizard](https://github.com/devwizardHq)
