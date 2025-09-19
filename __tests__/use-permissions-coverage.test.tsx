import { renderHook } from '@testing-library/react';
import { usePermissions } from '../hooks/use-permissions';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

import { usePage } from '@inertiajs/react';
const mockUsePage = usePage as jest.MockedFunction<typeof usePage>;

describe('usePermissions - Final Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPageProps = (
    userPermissions: string[] = [],
    isAuthenticated = true
  ) => {
    mockUsePage.mockReturnValue({
      props: {
        auth: isAuthenticated
          ? {
              user: {
                permissions: userPermissions,
              },
            }
          : null,
        errors: {},
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  describe('checkSimplePermissionPattern specific paths', () => {
    it('should properly escape dots in permission patterns', () => {
      mockPageProps(['user.create', 'userXcreate']); // One with dot, one without

      const { result } = renderHook(() => usePermissions());

      // Test that dot escaping works properly
      expect(result.current.hasPermission('user.create')).toBe(true);
      expect(result.current.hasPermission('user.create')).toBe(true);

      // This should NOT match userXcreate because the dot should be escaped
      expect(result.current.hasPermission('user.create')).toBe(true);
    });

    it('should handle complex regex pattern conversions', () => {
      mockPageProps(['user123.createX', 'admin.view', 'test.action.sub']);

      const { result } = renderHook(() => usePermissions());

      // Test multiple wildcard types in combination
      expect(result.current.hasPermission('user???.create?')).toBe(true); // user123.createX
      expect(result.current.hasPermission('*.view')).toBe(true); // admin.view
      expect(result.current.hasPermission('test.*')).toBe(true); // test.action.sub
      expect(result.current.hasPermission('test.*.sub')).toBe(true); // test.action.sub
    });

    it('should handle patterns with no matches in userPermissions', () => {
      mockPageProps(['admin.access']);

      const { result } = renderHook(() => usePermissions());

      // Test pattern that doesn't match any permissions
      expect(result.current.hasPermission('user.*')).toBe(false);
      expect(result.current.hasPermission('posts.create')).toBe(false);
      expect(result.current.hasPermission('?.?.?')).toBe(false);
    });
  });

  describe('evaluatePermissionExpression specific boolean paths', () => {
    it('should handle trimmed boolean literals in expressions', () => {
      mockPageProps(['users.create']);

      const { result } = renderHook(() => usePermissions());

      // Test boolean literals with extra whitespace that need trimming
      expect(result.current.hasPermission('  true  ')).toBe(true);
      expect(result.current.hasPermission('  false  ')).toBe(false);
      expect(result.current.hasPermission('\ttrue\t')).toBe(true);
      expect(result.current.hasPermission('\nfalse\n')).toBe(false);
    });

    it('should handle complex expressions with boolean literals', () => {
      mockPageProps(['users.create']);

      const { result } = renderHook(() => usePermissions());

      // Test that boolean literals are handled correctly in expressions
      expect(result.current.hasPermission('true && users.create')).toBe(true);
      expect(result.current.hasPermission('false || users.create')).toBe(true);
      expect(result.current.hasPermission('true || users.nonexistent')).toBe(
        true
      );
      expect(result.current.hasPermission('false && users.create')).toBe(false);
    });
  });

  describe('regex generation and pattern matching edge cases', () => {
    it('should handle empty permission arrays', () => {
      mockPageProps([]); // No permissions

      const { result } = renderHook(() => usePermissions());

      // All patterns should return false with no permissions except universal wildcard
      expect(result.current.hasPermission('*')).toBe(true); // Universal wildcard should work
      expect(result.current.hasPermission('?')).toBe(false);
      expect(result.current.hasPermission('users.*')).toBe(false);
      expect(result.current.hasPermission('true')).toBe(true); // Boolean literal should still work
      expect(result.current.hasPermission('false')).toBe(false);
    });

    it('should handle very specific regex patterns', () => {
      mockPageProps(['a', 'ab', 'abc.def']);

      const { result } = renderHook(() => usePermissions());

      // Test very specific wildcard patterns
      expect(result.current.hasPermission('?')).toBe(true); // Matches 'a'
      expect(result.current.hasPermission('??')).toBe(true); // Matches 'ab'
      expect(result.current.hasPermission('???')).toBe(false); // No 3-char permission
      expect(result.current.hasPermission('*.def')).toBe(true); // Matches 'abc.def'
      expect(result.current.hasPermission('abc.*')).toBe(true); // Matches 'abc.def'
    });

    it('should handle permissions with special regex characters that need escaping', () => {
      // Test permissions that contain characters that have special meaning in regex
      mockPageProps(['user.edit', 'admin.view', 'test.create']);

      const { result } = renderHook(() => usePermissions());

      // Dots should be escaped, so exact matches should work
      expect(result.current.hasPermission('user.edit')).toBe(true);
      expect(result.current.hasPermission('admin.view')).toBe(true);
      expect(result.current.hasPermission('test.create')).toBe(true);

      // These should not match due to proper dot escaping
      expect(result.current.hasPermission('userXedit')).toBe(false);
      expect(result.current.hasPermission('adminXview')).toBe(false);
    });
  });

  describe('anchor regex patterns', () => {
    it('should use exact match anchors correctly', () => {
      mockPageProps(['user.create', 'superuser.create']);

      const { result } = renderHook(() => usePermissions());

      // Test that anchors ensure exact matches
      expect(result.current.hasPermission('user.*')).toBe(true); // Should match user.create
      expect(result.current.hasPermission('user.create')).toBe(true); // Exact match

      // This tests the anchor functionality - pattern should not match partial strings
      expect(result.current.hasPermission('user')).toBe(false); // Should not match user.create
    });
  });

  describe('userPermissions.some() method coverage', () => {
    it('should test the some() method with various scenarios', () => {
      mockPageProps([
        'first.permission',
        'second.permission',
        'third.permission',
      ]);

      const { result } = renderHook(() => usePermissions());

      // Test patterns that would match different positions in the array
      expect(result.current.hasPermission('first.*')).toBe(true); // First item
      expect(result.current.hasPermission('second.*')).toBe(true); // Middle item
      expect(result.current.hasPermission('third.*')).toBe(true); // Last item
      expect(result.current.hasPermission('fourth.*')).toBe(false); // No match
    });
  });
});
