import { InertiaLinkProps } from '@inertiajs/react';
import { ReactNode, ComponentType } from 'react';

export interface Auth {
  user: User & {
    permissions: string[];
  };
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  sidebarOpen: boolean;
  [key: string]: unknown;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface NavItem {
  title: string;
  href: NonNullable<InertiaLinkProps['href']>;
  icon?: ComponentType<Record<string, unknown>> | null;
  isActive?: boolean;
  /** Permission required to show this nav item */
  permission?: string;
  /** Multiple permissions - user needs ANY of these */
  anyPermissions?: string[];
  /** Multiple permissions - user needs ALL of these */
  allPermissions?: string[];
  /** Permission pattern with wildcard support */
  pattern?: string;
}

export interface PermissionProps {
  /** Single permission to check */
  permission?: string;
  /** Multiple permissions - user needs ANY of these */
  anyPermissions?: string[];
  /** Multiple permissions - user needs ALL of these */
  allPermissions?: string[];
  /** Permission pattern with wildcard support */
  pattern?: string;
  /** Custom permissions array - if provided, uses this instead of auth permissions */
  permissions?: string[];
  /** What to render when user doesn't have permission */
  fallback?: ReactNode;
  /** Require authentication (default: true) */
  requireAuth?: boolean;
}

export interface CanProps extends PermissionProps {
  /** Content to render when user has permission */
  children: ReactNode;
  /** Complex boolean expression with logical operators */
  expression?: string;
  /** Multiple patterns - user needs ANY pattern match */
  anyPatterns?: string[];
  /** Multiple patterns - user needs ALL pattern matches */
  allPatterns?: string[];
}

export interface UsePermissionsReturn {
  /** Array of user permissions */
  userPermissions: string[];
  /** Check if user has a specific permission */
  hasPermission: (permission: string | boolean) => boolean;
  /** Check if user has any of the specified permissions */
  hasAnyPermission: (permissions: string[]) => boolean;
  /** Check if user has all of the specified permissions */
  hasAllPermissions: (permissions: string[]) => boolean;
  /** Check permissions with pattern matching */
  hasPermissionPattern: (pattern: string) => boolean;
  /** Check if user has any permissions matching multiple patterns */
  hasAnyPattern: (patterns: string[]) => boolean;
  /** Check if user has permissions matching all patterns */
  hasAllPatterns: (patterns: string[]) => boolean;
  /** Get all permissions that match a pattern */
  getMatchingPermissions: (pattern: string) => string[];
  /** Check complex boolean expressions */
  checkExpression: (expression: string) => boolean;
  /** Validate if a permission expression is syntactically correct */
  isValidExpression: (expression: string) => boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

export interface WithPermissionOptions extends PermissionProps {
  /** Complex boolean expression with logical operators */
  expression?: string;
  /** Multiple patterns - user needs ANY pattern match */
  anyPatterns?: string[];
  /** Multiple patterns - user needs ALL pattern matches */
  allPatterns?: string[];
}
