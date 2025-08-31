import { renderHook } from '@testing-library/react';
import { usePermissions } from '../hooks/use-permissions';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

import { usePage } from '@inertiajs/react';
const mockUsePage = usePage as jest.MockedFunction<typeof usePage>;

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.warn mock
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockPageProps = (userPermissions: string[] = []) => {
    mockUsePage.mockReturnValue({
      props: {
        auth: {
          user: {
            permissions: userPermissions,
          },
        },
        errors: {},
      },
      component: 'TestComponent',
      url: '/test',
      version: '1.0.0',
      clearHistory: jest.fn(),
      setError: jest.fn(),
    } as unknown as ReturnType<typeof usePage>);
  };

  describe('hasPermission', () => {
    it('should return true for exact permission match', () => {
      mockPageProps(['users.create', 'users.edit', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('users.create')).toBe(true);
      expect(result.current.hasPermission('users.edit')).toBe(true);
      expect(result.current.hasPermission('posts.view')).toBe(true);
    });

    it('should return false for non-existent permission', () => {
      mockPageProps(['users.create', 'users.edit']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('users.delete')).toBe(false);
      expect(result.current.hasPermission('posts.create')).toBe(false);
    });

    it('should handle boolean literals', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('true')).toBe(true);
      expect(result.current.hasPermission('false')).toBe(false);
      expect(result.current.hasPermission(' true ')).toBe(true);
      expect(result.current.hasPermission(' false ')).toBe(false);
    });

    it('should handle wildcard patterns', () => {
      mockPageProps([
        'users.create',
        'users.edit',
        'users.delete',
        'posts.view',
      ]);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('users.*')).toBe(true);
      expect(result.current.hasPermission('posts.*')).toBe(true);
      expect(result.current.hasPermission('admin.*')).toBe(false);
    });

    it('should handle single character patterns', () => {
      mockPageProps(['user1.edit', 'user2.edit', 'user3.view']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('user?.edit')).toBe(true);
      expect(result.current.hasPermission('user?.view')).toBe(true);
      expect(result.current.hasPermission('user?.delete')).toBe(false);
    });

    it('should handle logical OR expressions', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('users.create || posts.create')).toBe(
        true
      );
      expect(result.current.hasPermission('users.delete || posts.view')).toBe(
        true
      );
      expect(result.current.hasPermission('users.delete || posts.delete')).toBe(
        false
      );
    });

    it('should handle logical AND expressions', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('users.create && posts.view')).toBe(
        true
      );
      expect(result.current.hasPermission('users.create && posts.delete')).toBe(
        false
      );
      expect(result.current.hasPermission('users.delete && posts.view')).toBe(
        false
      );
    });

    it('should handle complex expressions with parentheses', () => {
      mockPageProps(['users.create', 'posts.view', 'admin.access']);
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasPermission(
          '(users.create || posts.create) && admin.access'
        )
      ).toBe(true);
      expect(
        result.current.hasPermission(
          '(users.delete || posts.delete) && admin.access'
        )
      ).toBe(false);
      expect(
        result.current.hasPermission(
          '(users.create || posts.view) && admin.delete'
        )
      ).toBe(false);
    });

    it('should handle single pipe and ampersand operators', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('users.create | posts.create')).toBe(
        true
      );
      expect(result.current.hasPermission('users.create & posts.view')).toBe(
        true
      );
      expect(result.current.hasPermission('users.delete | posts.delete')).toBe(
        false
      );
      expect(result.current.hasPermission('users.create & posts.delete')).toBe(
        false
      );
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the specified permissions', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(['users.create', 'users.delete'])
      ).toBe(true);
      expect(
        result.current.hasAnyPermission(['posts.view', 'posts.edit'])
      ).toBe(true);
      expect(
        result.current.hasAnyPermission(['users.delete', 'posts.edit'])
      ).toBe(false);
    });

    it('should return false if user has none of the specified permissions', () => {
      mockPageProps(['users.view']);
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(['users.create', 'users.delete'])
      ).toBe(false);
      expect(
        result.current.hasAnyPermission(['posts.view', 'posts.edit'])
      ).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all specified permissions', () => {
      mockPageProps(['users.create', 'users.edit', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(['users.create', 'users.edit'])
      ).toBe(true);
      expect(result.current.hasAllPermissions(['users.create'])).toBe(true);
      expect(result.current.hasAllPermissions([])).toBe(true); // Empty array should return true
    });

    it('should return false if user is missing any specified permission', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(['users.create', 'users.edit'])
      ).toBe(false);
      expect(
        result.current.hasAllPermissions([
          'users.create',
          'posts.view',
          'admin.access',
        ])
      ).toBe(false);
    });
  });

  describe('hasPermissionPattern', () => {
    it('should handle wildcard patterns correctly', () => {
      mockPageProps([
        'users.create',
        'users.edit',
        'users.delete',
        'posts.view',
      ]);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermissionPattern('users.*')).toBe(true);
      expect(result.current.hasPermissionPattern('posts.*')).toBe(true);
      expect(result.current.hasPermissionPattern('admin.*')).toBe(false);
    });

    it('should handle question mark patterns correctly', () => {
      mockPageProps(['user1.edit', 'user2.edit', 'user3.view']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermissionPattern('user?.edit')).toBe(true);
      expect(result.current.hasPermissionPattern('user?.view')).toBe(true);
      expect(result.current.hasPermissionPattern('user?.delete')).toBe(false);
    });

    it('should handle exact matches', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermissionPattern('users.create')).toBe(true);
      expect(result.current.hasPermissionPattern('users.edit')).toBe(false);
    });
  });

  describe('hasAnyPattern', () => {
    it('should return true if any pattern matches', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAnyPattern(['users.*', 'admin.*'])).toBe(true);
      expect(result.current.hasAnyPattern(['posts.*', 'admin.*'])).toBe(true);
      expect(result.current.hasAnyPattern(['admin.*', 'moderator.*'])).toBe(
        false
      );
    });
  });

  describe('hasAllPatterns', () => {
    it('should return true if all patterns match', () => {
      mockPageProps(['users.create', 'users.edit', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAllPatterns(['users.*', 'posts.*'])).toBe(true);
      expect(result.current.hasAllPatterns(['users.*'])).toBe(true);
      expect(result.current.hasAllPatterns(['users.*', 'admin.*'])).toBe(false);
    });
  });

  describe('getMatchingPermissions', () => {
    it('should return all permissions matching a pattern', () => {
      mockPageProps([
        'users.create',
        'users.edit',
        'users.delete',
        'posts.view',
      ]);
      const { result } = renderHook(() => usePermissions());

      const userPermissions = result.current.getMatchingPermissions('users.*');
      expect(userPermissions).toEqual([
        'users.create',
        'users.edit',
        'users.delete',
      ]);

      const postPermissions = result.current.getMatchingPermissions('posts.*');
      expect(postPermissions).toEqual(['posts.view']);

      const adminPermissions = result.current.getMatchingPermissions('admin.*');
      expect(adminPermissions).toEqual([]);
    });

    it('should handle exact matches', () => {
      mockPageProps(['users.create', 'users.edit']);
      const { result } = renderHook(() => usePermissions());

      const exactMatch = result.current.getMatchingPermissions('users.create');
      expect(exactMatch).toEqual(['users.create']);

      const noMatch = result.current.getMatchingPermissions('users.delete');
      expect(noMatch).toEqual([]);
    });
  });

  describe('checkExpression', () => {
    it('should evaluate complex boolean expressions', () => {
      mockPageProps(['users.create', 'posts.view', 'admin.access']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.checkExpression('users.create && posts.view')).toBe(
        true
      );
      expect(
        result.current.checkExpression('users.create || admin.delete')
      ).toBe(true);
      expect(
        result.current.checkExpression(
          '(users.create || posts.create) && admin.access'
        )
      ).toBe(true);
      expect(result.current.checkExpression('users.delete && posts.view')).toBe(
        false
      );
    });

    it('should handle invalid expressions gracefully', () => {
      mockPageProps(['users.create']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.checkExpression('users.create &&')).toBe(false);
      expect(result.current.checkExpression('|| users.create')).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('isValidExpression', () => {
    it('should validate correct expressions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.isValidExpression('users.create && posts.view')
      ).toBe(true);
      expect(
        result.current.isValidExpression('users.create || posts.view')
      ).toBe(true);
      expect(
        result.current.isValidExpression(
          '(users.create || posts.view) && admin.access'
        )
      ).toBe(true);
      expect(result.current.isValidExpression('true')).toBe(true);
      expect(result.current.isValidExpression('false')).toBe(true);
    });

    it('should invalidate incorrect expressions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isValidExpression('users.create &&')).toBe(false);
      expect(result.current.isValidExpression('|| users.create')).toBe(false);
      expect(result.current.isValidExpression('users.create ||')).toBe(false);
      expect(result.current.isValidExpression('(')).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user exists', () => {
      mockPageProps(['users.create']);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return false when user does not exist', () => {
      mockUsePage.mockReturnValue({
        props: {
          auth: null,
          errors: {},
        },
        component: 'TestComponent',
        url: '/test',
        version: '1.0.0',
        clearHistory: jest.fn(),
        setError: jest.fn(),
      } as unknown as ReturnType<typeof usePage>);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return false when auth is undefined', () => {
      mockUsePage.mockReturnValue({
        props: {
          errors: {},
        },
        component: 'TestComponent',
        url: '/test',
        version: '1.0.0',
        clearHistory: jest.fn(),
        setError: jest.fn(),
      } as unknown as ReturnType<typeof usePage>);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('custom permissions parameter', () => {
    it('should use custom permissions when provided', () => {
      mockPageProps(['users.create', 'posts.view']);
      const customPermissions = ['admin.access', 'super.admin'];
      const { result } = renderHook(() => usePermissions(customPermissions));

      expect(result.current.hasPermission('admin.access')).toBe(true);
      expect(result.current.hasPermission('super.admin')).toBe(true);
      expect(result.current.hasPermission('users.create')).toBe(false); // Should not have access to auth permissions
    });

    it('should use empty permissions when provided as empty array', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions([]));

      expect(result.current.hasPermission('users.create')).toBe(false);
      expect(result.current.hasPermission('posts.view')).toBe(false);
      expect(result.current.userPermissions).toEqual([]);
    });

    it('should fall back to auth permissions when custom permissions is undefined', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions(undefined));

      expect(result.current.hasPermission('users.create')).toBe(true);
      expect(result.current.hasPermission('posts.view')).toBe(true);
      expect(result.current.userPermissions).toEqual([
        'users.create',
        'posts.view',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle missing auth object', () => {
      mockUsePage.mockReturnValue({
        props: {
          errors: {},
        },
        component: 'TestComponent',
        url: '/test',
        version: '1.0.0',
        clearHistory: jest.fn(),
        setError: jest.fn(),
      } as unknown as ReturnType<typeof usePage>);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.userPermissions).toEqual([]);
      expect(result.current.hasPermission('users.create')).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle missing user object', () => {
      mockUsePage.mockReturnValue({
        props: {
          auth: {},
          errors: {},
        },
        component: 'TestComponent',
        url: '/test',
        version: '1.0.0',
        clearHistory: jest.fn(),
        setError: jest.fn(),
      } as unknown as ReturnType<typeof usePage>);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.userPermissions).toEqual([]);
      expect(result.current.hasPermission('users.create')).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle missing permissions array', () => {
      mockUsePage.mockReturnValue({
        props: {
          auth: {
            user: {},
          },
          errors: {},
        },
        component: 'TestComponent',
        url: '/test',
        version: '1.0.0',
        clearHistory: jest.fn(),
        setError: jest.fn(),
      } as unknown as ReturnType<typeof usePage>);
      const { result } = renderHook(() => usePermissions());

      expect(result.current.userPermissions).toEqual([]);
      expect(result.current.hasPermission('users.create')).toBe(false);
    });
  });
});
