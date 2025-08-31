import { type ComponentType, type ReactNode } from 'react';
import { Can } from './can';

interface WithPermissionOptions {
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
  /** What to render when user doesn't have permission */
  fallback?: ReactNode;
  /** Require authentication (default: true) */
  requireAuth?: boolean;
}

/**
 * Higher-order component that wraps a component with permission checking
 * Similar to Laravel's middleware concept for components
 *
 * @example
 * // Basic permission check
 * const ProtectedButton = withPermission(Button, { permission: 'users.create' });
 *
 * @example
 * // Boolean permission
 * const AlwaysVisible = withPermission(Component, { permission: 'true' });
 *
 * @example
 * // Logical operators in permission prop
 * const FlexibleComponent = withPermission(Panel, {
 *   permission: 'users.* || posts.*'
 * });
 *
 * @example
 * // Complex boolean expression
 * const AdminComponent = withPermission(AdminPanel, {
 *   expression: '(users.* || posts.*) && admin.access',
 *   fallback: <div>Admin access required</div>
 * });
 *
 * @example
 * // Advanced pattern with logical operators
 * const ManagerComponent = withPermission(ManagerPanel, {
 *   permission: 'admin.* && (manager.access || supervisor.roles)',
 *   fallback: <div>Manager permissions required</div>
 * });
 *
 * @example
 * // Custom permissions from static file
 * const StaticPermissionComponent = withPermission(SecurePanel, {
 *   permission: 'users.create',
 *   permissions: ['users.create', 'users.edit', 'posts.view'],
 *   fallback: <div>Access denied</div>
 * });
 *
 * @example
 * // No permissions (empty array)
 * const NoPermissionComponent = withPermission(PublicComponent, {
 *   permission: 'admin.access',
 *   permissions: [], // No permissions available
 *   fallback: <div>No permissions</div>
 * });
 */
export function withPermission<P extends object>(
  Component: ComponentType<P>,
  options: WithPermissionOptions
) {
  const WrappedComponent = (props: P) => {
    return (
      <Can {...options}>
        <Component {...props} />
      </Can>
    );
  };

  WrappedComponent.displayName = `withPermission(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
