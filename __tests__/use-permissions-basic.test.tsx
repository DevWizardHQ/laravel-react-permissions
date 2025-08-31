import { renderHook } from '@testing-library/react';
import { usePermissions } from '../hooks/use-permissions';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

import { usePage } from '@inertiajs/react';
const mockUsePage = usePage as jest.MockedFunction<typeof usePage>;

describe('usePermissions - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('basic permission checks', () => {
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
    });
  });

  describe('wildcard patterns', () => {
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
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all specified permissions', () => {
      mockPageProps(['users.create', 'users.edit', 'posts.view']);
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(['users.create', 'users.edit'])
      ).toBe(true);
      expect(result.current.hasAllPermissions(['users.create'])).toBe(true);
      expect(result.current.hasAllPermissions([])).toBe(true);
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
  });

  describe('custom permissions', () => {
    it('should use custom permissions when provided', () => {
      mockPageProps(['users.create', 'posts.view']);
      const customPermissions = ['admin.access', 'super.admin'];
      const { result } = renderHook(() => usePermissions(customPermissions));

      expect(result.current.hasPermission('admin.access')).toBe(true);
      expect(result.current.hasPermission('super.admin')).toBe(true);
      expect(result.current.hasPermission('users.create')).toBe(false);
    });

    it('should use empty permissions when provided as empty array', () => {
      mockPageProps(['users.create', 'posts.view']);
      const { result } = renderHook(() => usePermissions([]));

      expect(result.current.hasPermission('users.create')).toBe(false);
      expect(result.current.hasPermission('posts.view')).toBe(false);
      expect(result.current.userPermissions).toEqual([]);
    });
  });
});
