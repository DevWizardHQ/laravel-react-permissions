import { renderHook } from '@testing-library/react';
import { usePermissions } from '../hooks/use-permissions';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

import { usePage } from '@inertiajs/react';
const mockUsePage = usePage as jest.MockedFunction<typeof usePage>;

describe('usePermissions - Wildcard Permissions with Empty Arrays', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('Wildcard (*) permissions with empty permissions array', () => {
    it('should allow access with * pattern when user has no permissions from auth', () => {
      mockPageProps([]); // Empty auth permissions
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission('*')).toBe(true);
      expect(result.current.userPermissions).toEqual([]);
    });

    it('should allow access with * pattern when custom permissions are empty array', () => {
      mockPageProps(['users.create', 'posts.view']); // Auth has permissions
      const { result } = renderHook(() => usePermissions([])); // But we pass empty array
      
      expect(result.current.hasPermission('*')).toBe(true);
      expect(result.current.userPermissions).toEqual([]);
    });

    it('should allow access with * pattern when permissions are undefined', () => {
      mockPageProps([]); // Empty auth permissions
      const { result } = renderHook(() => usePermissions(undefined)); // Undefined permissions
      
      expect(result.current.hasPermission('*')).toBe(true);
      expect(result.current.userPermissions).toEqual([]);
    });

    it('should still work with * pattern when user has some permissions', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission('*')).toBe(true);
      expect(result.current.userPermissions).toEqual(['users.create', 'posts.view']);
    });

    it('should handle * pattern with whitespace', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission(' * ')).toBe(true);
      expect(result.current.hasPermission('  *  ')).toBe(true);
    });
  });

  describe('Other wildcard patterns with empty permissions', () => {
    it('should return false for specific wildcard patterns with empty permissions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission('users.*')).toBe(false);
      expect(result.current.hasPermission('posts.*')).toBe(false);
      expect(result.current.hasPermission('admin.*')).toBe(false);
      expect(result.current.hasPermission('*.create')).toBe(false);
    });

    it('should return false for question mark patterns with empty permissions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission('user?.edit')).toBe(false);
      expect(result.current.hasPermission('?')).toBe(false);
      expect(result.current.hasPermission('user?')).toBe(false);
    });
  });

  describe('Complex expressions with * and empty permissions', () => {
    it('should handle * in OR expressions with empty permissions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission('* || users.create')).toBe(true);
      expect(result.current.hasPermission('users.create || *')).toBe(true);
      expect(result.current.hasPermission('* | users.create')).toBe(true);
    });

    it('should handle * in AND expressions with empty permissions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission('* && users.create')).toBe(false);
      expect(result.current.hasPermission('users.create && *')).toBe(false);
      expect(result.current.hasPermission('* & users.create')).toBe(false);
    });

    it('should handle * in complex grouped expressions with empty permissions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission('(* || users.create) && false')).toBe(false);
      expect(result.current.hasPermission('(* || users.create) && true')).toBe(true);
      expect(result.current.hasPermission('* && (users.create || true)')).toBe(true);
    });
  });

  describe('hasPermissionPattern with * and empty permissions', () => {
    it('should handle hasPermissionPattern with * for empty permissions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermissionPattern('*')).toBe(true);
      expect(result.current.hasPermissionPattern('users.*')).toBe(false);
    });
  });

  describe('hasAnyPattern and hasAllPatterns with * and empty permissions', () => {
    it('should handle hasAnyPattern with * for empty permissions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasAnyPattern(['*'])).toBe(true);
      expect(result.current.hasAnyPattern(['*', 'users.*'])).toBe(true);
      expect(result.current.hasAnyPattern(['users.*', '*'])).toBe(true);
      expect(result.current.hasAnyPattern(['users.*', 'posts.*'])).toBe(false);
    });

    it('should handle hasAllPatterns with * for empty permissions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasAllPatterns(['*'])).toBe(true);
      expect(result.current.hasAllPatterns(['*', 'users.*'])).toBe(false);
      expect(result.current.hasAllPatterns(['*', '*'])).toBe(true);
    });
  });

  describe('Edge cases for universal access patterns', () => {
    it('should maintain existing functionality for non-empty permissions with *', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission('*')).toBe(true);
      expect(result.current.hasPermission('users.*')).toBe(true);
      expect(result.current.hasPermission('posts.*')).toBe(true);
      expect(result.current.hasPermission('admin.*')).toBe(false);
    });

    it('should handle boolean literals correctly with empty permissions', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.hasPermission('true')).toBe(true);
      expect(result.current.hasPermission('false')).toBe(false);
      expect(result.current.hasPermission('true || *')).toBe(true);
      expect(result.current.hasPermission('false && *')).toBe(false);
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should work for dashboard visibility with empty permissions', () => {
      mockPageProps([]); // User with no permissions
      const { result } = renderHook(() => usePermissions());
      
      // Dashboard should be visible to all users
      expect(result.current.hasPermission('*')).toBe(true);
    });

    it('should work for public content with custom empty permissions', () => {
      mockPageProps(['admin.access']); // Auth has admin permissions
      const { result } = renderHook(() => usePermissions([])); // But we override with empty
      
      // Public content should still be accessible
      expect(result.current.hasPermission('*')).toBe(true);
      // But admin content should not be
      expect(result.current.hasPermission('admin.*')).toBe(false);
    });

    it('should handle navigation menu scenarios', () => {
      mockPageProps([]);
      const { result } = renderHook(() => usePermissions());
      
      // Public navigation items
      expect(result.current.hasPermission('*')).toBe(true); // Home, About, Contact
      
      // Private navigation items
      expect(result.current.hasPermission('dashboard.*')).toBe(false); // User dashboard
      expect(result.current.hasPermission('admin.*')).toBe(false); // Admin panel
    });
  });
});