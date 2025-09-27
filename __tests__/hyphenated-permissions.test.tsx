import { renderHook } from '@testing-library/react';
import { usePermissions } from '../hooks/use-permissions';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      auth: {
        user: {
          permissions: global.mockUserPermissions || [],
        },
      },
    },
  }),
}));

const mockPageProps = (permissions: string[]) => {
  global.mockUserPermissions = permissions;
};

describe('Hyphenated Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle hyphenated permissions in OR expressions', () => {
    mockPageProps([
      'visitor.request.view-all',
      'visitor.request.view-department',
    ]);

    const { result } = renderHook(() => usePermissions());

    // Test the original failing expression
    const expression =
      'visitor.request.view-all||visitor.request.view-department||visitor.request.view-own';
    const hasPermission = result.current.hasPermission(expression);

    expect(hasPermission).toBe(true);
  });

  it('should handle hyphenated permissions in AND expressions', () => {
    mockPageProps(['user-profile.edit', 'api-access.read']);

    const { result } = renderHook(() => usePermissions());

    const expression = 'user-profile.edit&&api-access.read';
    const hasPermission = result.current.hasPermission(expression);

    expect(hasPermission).toBe(true);
  });

  it('should handle mixed hyphenated and non-hyphenated permissions', () => {
    mockPageProps(['users.create', 'user-profile.edit', 'api-access.read']);

    const { result } = renderHook(() => usePermissions());

    // Test OR with mixed types
    const orExpression = 'users.create||user-profile.edit||api-access.read';
    expect(result.current.hasPermission(orExpression)).toBe(true);

    // Test AND with mixed types
    const andExpression = 'users.create&&user-profile.edit&&api-access.read';
    expect(result.current.hasPermission(andExpression)).toBe(true);
  });

  it('should handle complex nested expressions with hyphens', () => {
    mockPageProps([
      'admin.access',
      'user-profile.edit',
      'system-config.update',
    ]);

    const { result } = renderHook(() => usePermissions());

    const expression =
      '(admin.access||user-profile.edit)&&system-config.update';
    const hasPermission = result.current.hasPermission(expression);

    expect(hasPermission).toBe(true);
  });

  it('should handle multiple hyphens in permission names', () => {
    mockPageProps(['api-v2-endpoint.read', 'user-profile-settings.edit']);

    const { result } = renderHook(() => usePermissions());

    const expression = 'api-v2-endpoint.read||user-profile-settings.edit';
    const hasPermission = result.current.hasPermission(expression);

    expect(hasPermission).toBe(true);
  });

  it('should handle wildcards with hyphenated permissions', () => {
    mockPageProps(['user-profile.edit', 'user-profile.delete', 'admin.access']);

    const { result } = renderHook(() => usePermissions());

    // Test wildcard with hyphenated permissions
    const wildcardExpression = 'user-profile.*';
    expect(result.current.hasPermission(wildcardExpression)).toBe(true);

    // Test wildcard with AND
    const wildcardAndExpression = 'user-profile.*&&admin.access';
    expect(result.current.hasPermission(wildcardAndExpression)).toBe(true);
  });

  it('should handle permissions with numbers and hyphens', () => {
    mockPageProps(['api-v2-endpoint-2024.read', 'user-profile-v1.edit']);

    const { result } = renderHook(() => usePermissions());

    const expression = 'api-v2-endpoint-2024.read||user-profile-v1.edit';
    const hasPermission = result.current.hasPermission(expression);

    expect(hasPermission).toBe(true);
  });

  it('should handle mixed case hyphenated permissions', () => {
    mockPageProps(['API-V2-Endpoint.Read', 'User-Profile-Settings.Edit']);

    const { result } = renderHook(() => usePermissions());

    const expression = 'API-V2-Endpoint.Read||User-Profile-Settings.Edit';
    const hasPermission = result.current.hasPermission(expression);

    expect(hasPermission).toBe(true);
  });

  it('should return false when user has no hyphenated permissions', () => {
    mockPageProps([]);

    const { result } = renderHook(() => usePermissions());

    const expression =
      'visitor.request.view-all||visitor.request.view-department';
    const hasPermission = result.current.hasPermission(expression);

    expect(hasPermission).toBe(false);
  });

  it('should handle very long hyphenated permission names', () => {
    mockPageProps([
      'very-long-permission-name-with-many-hyphens.and-more-hyphens',
    ]);

    const { result } = renderHook(() => usePermissions());

    const expression =
      'very-long-permission-name-with-many-hyphens.and-more-hyphens||short.permission';
    const hasPermission = result.current.hasPermission(expression);

    expect(hasPermission).toBe(true);
  });

  it('should not break with edge cases like consecutive hyphens', () => {
    mockPageProps(['normal.permission']);

    const { result } = renderHook(() => usePermissions());

    // These should not cause errors, even if they're invalid permission names
    const expression1 = 'api--v2--endpoint.read||normal.permission';
    const expression2 = 'invalid.permission-||normal.permission';
    const expression3 = '-invalid.permission||normal.permission';

    expect(result.current.hasPermission(expression1)).toBe(true);
    expect(result.current.hasPermission(expression2)).toBe(true);
    expect(result.current.hasPermission(expression3)).toBe(true);
  });

  it('should work with the Can component for hyphenated permissions', () => {
    mockPageProps(['visitor.request.view-all']);

    const { result } = renderHook(() => usePermissions());

    // Test that the expression validation works
    const expression =
      'visitor.request.view-all||visitor.request.view-department';
    const isValid = result.current.isValidExpression(expression);
    const checkResult = result.current.checkExpression(expression);

    expect(isValid).toBe(true);
    expect(checkResult).toBe(true);
  });
});
