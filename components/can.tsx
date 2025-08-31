import { type ReactNode } from 'react';
import { usePermissions } from '../hooks/use-permissions';

interface CanProps {
  /** Single permission to check (supports patterns, boolean values, and logical operators) */
  permission?: string;
  /** Complex boolean expression with logical operators */
  expression?: string;
  /** Multiple permissions - user needs ANY of these (supports patterns) */
  anyPermissions?: string[];
  /** Multiple permissions - user needs ALL of these (supports patterns) */
  allPermissions?: string[];
  /** Permission pattern with wildcard support (legacy - use permission prop for patterns) */
  pattern?: string;
  /** Multiple patterns - user needs ANY pattern match */
  anyPatterns?: string[];
  /** Multiple patterns - user needs ALL pattern matches */
  allPatterns?: string[];
  /** Custom permissions array - if provided, uses this instead of auth permissions. Pass [] for no permissions */
  permissions?: string[];
  /** What to render when user has permission */
  children: ReactNode;
  /** What to render when user doesn't have permission (optional) */
  fallback?: ReactNode;
  /** Require authentication (default: true) */
  requireAuth?: boolean;
}

/**
 * Can component for conditional rendering based on user permissions
 * Similar to Laravel's @can Blade directive
 *
 * @example
 * // Single permission (exact match)
 * <Can permission="users.create">
 *   <button>Create User</button>
 * </Can>
 *
 * @example
 * // Boolean values
 * <Can permission="true">
 *   <div>Always visible to authenticated users</div>
 * </Can>
 *
 * @example
 * // Single permission with wildcard pattern
 * <Can permission="users.*">
 *   <button>Any User Action</button>
 * </Can>
 *
 * @example
 * // Logical operators in permission prop
 * <Can permission="users.* || posts.*">
 *   <button>User or Post Management</button>
 * </Can>
 *
 * @example
 * // Complex logical expressions
 * <Can permission="(users.* || posts.*) && admin.access">
 *   <button>Admin Content Management</button>
 * </Can>
 *
 * @example
 * // Using expression prop for complex boolean logic
 * <Can expression="users.* && posts.create || admin.*">
 *   <div>Complex permission logic</div>
 * </Can>
 *
 * @example
 * // Boolean AND with wildcard
 * <Can permission="users.* && admin.access">
 *   <button>Admin User Management</button>
 * </Can>
 *
 * @example
 * // Any of multiple permissions (supports patterns and expressions)
 * <Can anyPermissions={['users.edit', 'posts.*', 'admin.? || manager.access']}>
 *   <button>Flexible Management Access</button>
 * </Can>
 *
 * @example
 * // Custom permissions array (override auth permissions)
 * <Can
 *   permission="users.create"
 *   permissions={['users.create', 'posts.edit', 'admin.access']}
 * >
 *   <button>Create User</button>
 * </Can>
 *
 * @example
 * // Dynamic permissions from API
 * <Can
 *   permission="special.feature"
 *   permissions={['special.feature', 'beta.access']}
 * >
 *   <div>Special Feature</div>
 * </Can>
 *
 * @example
 * // All permissions required (supports patterns)
 * <Can allPermissions={['users.*', 'posts.create']}>
 *   <button>Need User Permissions AND Post Create</button>
 * </Can>
 *
 * @example
 * // Multiple patterns - user needs ANY pattern match
 * <Can anyPatterns={['users.*', 'posts.*']}>
 *   <div>User or Post related actions</div>
 * </Can>
 *
 * @example
 * // Multiple patterns - user needs ALL pattern matches
 * <Can allPatterns={['admin.*', 'super.*']}>
 *   <div>Super admin area</div>
 * </Can>
 *
 * @example
 * // Advanced patterns with multiple operators
 * <Can permission="user?.manage|admin.*">
 *   <div>User management or admin access</div>
 * </Can>
 *
 * @example
 * // With fallback
 * <Can
 *   permission="admin.access"
 *   fallback={<div>You don't have admin access</div>}
 * >
 *   <AdminPanel />
 * </Can>
 *
 * @example
 * // Custom permissions from static file or API
 * <Can
 *   permission="users.create"
 *   permissions={['users.create', 'users.edit', 'posts.view']}
 * >
 *   <CreateUserButton />
 * </Can>
 *
 * @example
 * // Empty permissions array (no permissions)
 * <Can
 *   permission="admin.access"
 *   permissions={[]}
 *   fallback={<div>No permissions available</div>}
 * >
 *   <AdminContent />
 * </Can>
 *
 * @example
 * // Custom permissions with complex logic
 * <Can
 *   permission="(users.* || posts.*) && admin.access"
 *   permissions={staticPermissions.getUserPermissions()}
 * >
 *   <DynamicContent />
 * </Can>
 */
export function Can({
  permission,
  expression,
  anyPermissions,
  allPermissions,
  pattern,
  anyPatterns,
  allPatterns,
  permissions,
  children,
  fallback = null,
  requireAuth = true,
}: CanProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissionPattern,
    hasAnyPattern,
    hasAllPatterns,
    checkExpression,
    isAuthenticated,
  } = usePermissions(permissions);

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check permissions based on props
  let hasAccess = false;

  if (expression) {
    // Handle complex boolean expressions
    hasAccess = checkExpression(expression);
  } else if (permission) {
    // permission prop now supports patterns and expressions automatically
    hasAccess = hasPermission(permission);
  } else if (anyPermissions && anyPermissions.length > 0) {
    // anyPermissions now supports patterns in individual permissions
    hasAccess = hasAnyPermission(anyPermissions);
  } else if (allPermissions) {
    // allPermissions now supports patterns in individual permissions
    // Empty array should return true (no permissions to check)
    hasAccess = hasAllPermissions(allPermissions);
  } else if (anyPatterns && anyPatterns.length > 0) {
    // Check if user has any of the specified patterns
    hasAccess = hasAnyPattern(anyPatterns);
  } else if (allPatterns && allPatterns.length > 0) {
    // Check if user has all of the specified patterns
    hasAccess = hasAllPatterns(allPatterns);
  } else if (pattern) {
    // Legacy pattern support
    hasAccess = hasPermissionPattern(pattern);
  } else if (!requireAuth) {
    // If no permissions specified and auth not required, allow access
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
