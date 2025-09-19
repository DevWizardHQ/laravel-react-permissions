import { usePage } from '@inertiajs/react';
import { type SharedData } from '../types';

export function usePermissions(permissions?: string[]) {
  const { auth } = usePage<SharedData>().props;

  // If permissions is provided, use it (even if empty array)
  // Otherwise, use auth permissions
  const userPermissions =
    permissions !== undefined ? permissions : auth?.user?.permissions || [];

  /**
   * Check if the user has a specific permission
   * Also supports pattern matching and complex expressions with logical operators
   * Examples:
   * - 'users.create' (exact match)
   * - 'users.*' (wildcard)
   * - 'users.* || posts.*' (logical OR)
   * - 'users.* && admin.access' (logical AND)
   * - '(users.* || posts.*) && admin.access' (grouped expressions)
   * - 'true' or 'false' (boolean literals)
   */
  const hasPermission = (permission: string): boolean => {
    // Handle boolean literals
    if (permission.trim() === 'true') return true;
    if (permission.trim() === 'false') return false;

    // If permission contains wildcards or logical operators, treat as pattern/expression
    if (
      permission.includes('*') ||
      permission.includes('?') ||
      permission.includes('||') ||
      permission.includes('&&') ||
      permission.includes('|') ||
      permission.includes('&')
    ) {
      return hasPermissionPattern(permission);
    }

    return userPermissions.includes(permission);
  };

  /**
   * Check if the user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  /**
   * Check if the user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission =>
      userPermissions.includes(permission)
    );
  };

  /**
   * Check if user has a simple permission pattern (no logical operators)
   */
  const checkSimplePermissionPattern = (pattern: string): boolean => {
    // Handle boolean literals
    if (pattern.trim() === 'true') return true;
    if (pattern.trim() === 'false') return false;

    // Special case: if pattern is just '*', it should match for all users
    // including those with empty permissions (universal access)
    if (pattern.trim() === '*') return true;

    // Convert pattern to regex for simple patterns
    let regexPattern = pattern
      .replace(/\./g, '\\.') // Escape dots
      .replace(/\*/g, '.*') // * becomes .*
      .replace(/\?/g, '.'); // ? becomes .

    // Ensure exact match (anchor start and end)
    regexPattern = `^${regexPattern}$`;

    const regex = new RegExp(regexPattern);
    return userPermissions.some(permission => regex.test(permission));
  };

  /**
   * Evaluate a complex permission expression with logical operators
   * Supports:
   * - Boolean values: true, false
   * - Logical operators: ||, &&, |, &
   * - Wildcards: *, ?
   * - Parentheses for grouping: (users.* || posts.*) && admin.access
   * - Negation: !admin.access
   */
  const evaluatePermissionExpression = (expression: string): boolean => {
    // Handle boolean literals
    if (expression.trim() === 'true') return true;
    if (expression.trim() === 'false') return false;

    // Normalize logical operators to JavaScript equivalents
    // Process single operators first, then ensure double operators are correct
    let jsExpression = expression
      .replace(/\|(?!\|)/g, '||') // Single | becomes ||
      .replace(/&(?!&)/g, '&&'); // Single & becomes &&

    // Now ensure we don't have triple operators from the above replacement
    jsExpression = jsExpression
      .replace(/\|\|\|/g, '||') // Triple | becomes ||
      .replace(/&&&/g, '&&'); // Triple & becomes &&

    // Find all permission patterns in the expression
    // This regex matches permission patterns in the expression.
    // Breakdown of alternation groups:
    //   \*         - matches a standalone '*' wildcard
    //   \?         - matches a standalone '?' wildcard
    //   [a-zA-Z_][a-zA-Z0-9_.*?]*(?:\.[a-zA-Z0-9_.*?]*)*
    //              - matches standard permission strings, e.g. 'users.create', 'posts.*'
    //   true|false - matches boolean literals 'true' or 'false'
    // The (?![|&]) negative lookahead ensures we don't match permission patterns that are immediately followed by a logical operator.
    const permissionRegex =
      /(?:\*|\?|[a-zA-Z_][a-zA-Z0-9_.*?]*(?:\.[a-zA-Z0-9_.*?]*)*|true|false)(?![|&])/g;
    const permissions = jsExpression.match(permissionRegex) || [];

    // Replace each permission with its boolean evaluation
    let evaluatedExpression = jsExpression;

    for (const permission of permissions) {
      // Skip boolean literals and operators
      if (permission === 'true' || permission === 'false') continue;

      // Use simple pattern checking to avoid circular dependency
      const hasPermissionResult = checkSimplePermissionPattern(permission);

      // For wildcard patterns like * or ?, we need special handling since they don't have word boundaries
      if (permission === '*' || permission === '?') {
        // Replace standalone wildcards not part of larger patterns
        const wildcardRegex = new RegExp(
          `\\${permission}(?![a-zA-Z0-9_.])`,
          'g'
        );
        evaluatedExpression = evaluatedExpression.replace(
          wildcardRegex,
          hasPermissionResult.toString()
        );
      } else {
        // For normal permissions, use word boundaries
        const escapedPermission = permission.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );
        const permissionRegex = new RegExp(`\\b${escapedPermission}\\b`, 'g');
        evaluatedExpression = evaluatedExpression.replace(
          permissionRegex,
          hasPermissionResult.toString()
        );
      }
    }

    try {
      // Safely evaluate the boolean expression
      return Function(`"use strict"; return (${evaluatedExpression})`)();
    } catch (error) {
      console.warn('Invalid permission expression:', expression, error);
      return false;
    }
  };

  /**
   * Check if the user has permissions that match a pattern
   * Supports multiple pattern types:
   * - Boolean values: true, false
   * - Logical operators: ||, &&, |, &
   * - Wildcard (*): 'users.*' matches 'users.create', 'users.edit', etc.
   * - Single char (?): 'user?.edit' matches 'user1.edit', 'user2.edit', etc.
   * - Multiple patterns: 'users.* || posts.*' matches users OR posts permissions
   * - Complex expressions: '(users.* || posts.*) && admin.access'
   * - Exact match: 'users.create' matches exactly 'users.create'
   */
  const hasPermissionPattern = (pattern: string): boolean => {
    // Handle complex expressions with logical operators
    if (
      pattern.includes('||') ||
      pattern.includes('&&') ||
      pattern.includes('|') ||
      pattern.includes('&')
    ) {
      return evaluatePermissionExpression(pattern);
    }

    // For simple patterns, use the simple pattern checker
    return checkSimplePermissionPattern(pattern);
  };

  /**
   * Check if user has any permissions matching multiple patterns
   * Example: hasAnyPattern(['users.*', 'posts.*'])
   */
  const hasAnyPattern = (patterns: string[]): boolean => {
    return patterns.some(pattern => hasPermissionPattern(pattern));
  };

  /**
   * Check if user has permissions matching all patterns
   * Example: hasAllPatterns(['users.*', 'posts.create'])
   */
  const hasAllPatterns = (patterns: string[]): boolean => {
    return patterns.every(pattern => hasPermissionPattern(pattern));
  };

  /**
   * Get all permissions that match a pattern
   * Example: getMatchingPermissions('users.*') returns ['users.create', 'users.edit']
   */
  const getMatchingPermissions = (pattern: string): string[] => {
    let regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    regexPattern = `^${regexPattern}$`;
    const regex = new RegExp(regexPattern);

    return userPermissions.filter(permission => regex.test(permission));
  };

  /**
   * Check if user has permissions matching a complex boolean expression
   * Example: checkExpression('(users.* || posts.*) && admin.access')
   */
  const checkExpression = (expression: string): boolean => {
    return evaluatePermissionExpression(expression);
  };

  /**
   * Validate if a permission expression is syntactically correct
   */
  const isValidExpression = (expression: string): boolean => {
    try {
      // Use the same normalization logic as evaluatePermissionExpression
      let testExpression = expression
        .replace(/\|(?!\|)/g, '||') // Single | becomes ||
        .replace(/&(?!&)/g, '&&'); // Single & becomes &&

      // Clean up triple operators
      testExpression = testExpression
        .replace(/\|\|\|/g, '||') // Triple | becomes ||
        .replace(/&&&/g, '&&'); // Triple & becomes &&

      // Replace all permission patterns with 'true' for syntax validation
      testExpression = testExpression.replace(
        /[a-zA-Z_][a-zA-Z0-9_.*?]*(?:\.[a-zA-Z0-9_.*?]*)*(?![|&])/g,
        'true'
      );

      Function(`"use strict"; return (${testExpression})`);
      return true;
    } catch {
      return false;
    }
  };

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissionPattern,
    hasAnyPattern,
    hasAllPatterns,
    getMatchingPermissions,
    checkExpression,
    isValidExpression,
    isAuthenticated: !!auth?.user,
  };
}
