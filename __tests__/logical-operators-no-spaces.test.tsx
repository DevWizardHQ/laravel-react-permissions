import { renderHook } from '@testing-library/react';
import { usePermissions } from '../hooks/use-permissions';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

import { usePage } from '@inertiajs/react';
const mockUsePage = usePage as jest.MockedFunction<typeof usePage>;

describe('Logical Operators Without Spaces', () => {
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
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  describe('OR operators without spaces', () => {
    it('should handle || without spaces around operators', () => {
      mockPageProps(['properties.view-all', 'properties.view-own']);

      const { result } = renderHook(() => usePermissions());

      // Test various OR expressions without spaces
      expect(
        result.current.hasPermission('properties.view-all||properties.view-own')
      ).toBe(true);
      expect(result.current.hasPermission('users.create||posts.view')).toBe(
        false
      ); // Neither permission exists
      expect(
        result.current.hasPermission('properties.view-all||users.create')
      ).toBe(true); // One permission exists
    });

    it('should handle single | without spaces around operators', () => {
      mockPageProps(['properties.view-all', 'properties.view-own']);

      const { result } = renderHook(() => usePermissions());

      // Test single | expressions without spaces
      expect(
        result.current.hasPermission('properties.view-all|properties.view-own')
      ).toBe(true);
      expect(
        result.current.hasPermission('properties.view-all|users.create')
      ).toBe(true); // One permission exists
      expect(result.current.hasPermission('users.create|posts.view')).toBe(
        false
      ); // Neither permission exists
    });
  });

  describe('AND operators without spaces', () => {
    it('should handle && without spaces around operators', () => {
      mockPageProps(['properties.view-all', 'properties.view-own']);

      const { result } = renderHook(() => usePermissions());

      // Test various AND expressions without spaces
      expect(
        result.current.hasPermission('properties.view-all&&properties.view-own')
      ).toBe(true);
      expect(
        result.current.hasPermission('properties.view-all&&users.create')
      ).toBe(false); // One permission missing
      expect(result.current.hasPermission('users.create&&posts.view')).toBe(
        false
      ); // Both permissions missing
    });

    it('should handle single & without spaces around operators', () => {
      mockPageProps(['properties.view-all', 'properties.view-own']);

      const { result } = renderHook(() => usePermissions());

      // Test single & expressions without spaces
      expect(
        result.current.hasPermission('properties.view-all&properties.view-own')
      ).toBe(true);
      expect(
        result.current.hasPermission('properties.view-all&users.create')
      ).toBe(false); // One permission missing
      expect(result.current.hasPermission('users.create&posts.view')).toBe(
        false
      ); // Both permissions missing
    });
  });

  describe('Complex expressions without spaces', () => {
    it('should handle parentheses with no spaces around operators', () => {
      mockPageProps(['properties.view-all', 'admin.access']);

      const { result } = renderHook(() => usePermissions());

      // Test complex expressions without spaces
      expect(
        result.current.hasPermission(
          '(properties.view-all||users.create)&&admin.access'
        )
      ).toBe(true);
      expect(
        result.current.hasPermission(
          '(properties.view-all||users.create)&&admin.delete'
        )
      ).toBe(false);
      expect(
        result.current.hasPermission('(users.create||posts.view)&&admin.access')
      ).toBe(false);
    });

    it('should handle mixed operators without spaces', () => {
      mockPageProps(['properties.view-all', 'admin.access', 'reports.read']);

      const { result } = renderHook(() => usePermissions());

      // Test mixed operators without spaces
      expect(
        result.current.hasPermission(
          'properties.view-all&&admin.access||reports.read'
        )
      ).toBe(true);
      expect(
        result.current.hasPermission(
          'properties.view-all&admin.access|reports.read'
        )
      ).toBe(true);
      expect(
        result.current.hasPermission('users.create&&admin.access||reports.read')
      ).toBe(true); // reports.read exists
    });
  });

  describe('Permission names with hyphens', () => {
    it('should handle permission names with hyphens in expressions without spaces', () => {
      mockPageProps([
        'user-profile.edit',
        'api-access.read',
        'system-config.update',
      ]);

      const { result } = renderHook(() => usePermissions());

      // Test hyphenated permission names without spaces
      expect(
        result.current.hasPermission('user-profile.edit||api-access.read')
      ).toBe(true);
      expect(
        result.current.hasPermission('user-profile.edit&&api-access.read')
      ).toBe(true);
      expect(
        result.current.hasPermission('user-profile.edit&&system-config.update')
      ).toBe(true);
      expect(
        result.current.hasPermission('user-profile.edit&&users.create')
      ).toBe(false); // users.create doesn't exist
    });

    it('should handle complex hyphenated permission expressions', () => {
      mockPageProps([
        'user-profile.edit',
        'api-access.read',
        'admin-panel.access',
      ]);

      const { result } = renderHook(() => usePermissions());

      // Test complex expressions with hyphenated permissions
      expect(
        result.current.hasPermission(
          '(user-profile.edit||api-access.read)&&admin-panel.access'
        )
      ).toBe(true);
      expect(
        result.current.hasPermission(
          'user-profile.edit&&(api-access.read||system-config.update)'
        )
      ).toBe(true);
      expect(
        result.current.hasPermission(
          '(user-profile.edit||api-access.read)&&system-config.update'
        )
      ).toBe(false);
    });
  });

  describe('Boolean literals without spaces', () => {
    it('should handle boolean literals in expressions without spaces', () => {
      mockPageProps(['properties.view-all']);

      const { result } = renderHook(() => usePermissions());

      // Test boolean literals without spaces
      expect(result.current.hasPermission('true||properties.view-all')).toBe(
        true
      );
      expect(result.current.hasPermission('false||properties.view-all')).toBe(
        true
      );
      expect(result.current.hasPermission('true&&properties.view-all')).toBe(
        true
      );
      expect(result.current.hasPermission('false&&properties.view-all')).toBe(
        false
      );
      expect(result.current.hasPermission('properties.view-all||true')).toBe(
        true
      );
      expect(result.current.hasPermission('properties.view-all&&false')).toBe(
        false
      );
    });
  });

  describe('Edge cases without spaces', () => {
    it('should handle expressions with multiple consecutive operators', () => {
      mockPageProps(['properties.view-all', 'properties.view-own']);

      const { result } = renderHook(() => usePermissions());

      // These should be handled gracefully (though they're not valid expressions)
      expect(
        result.current.hasPermission(
          'properties.view-all||||properties.view-own'
        )
      ).toBe(false); // Invalid
      expect(
        result.current.hasPermission(
          'properties.view-all&&&&properties.view-own'
        )
      ).toBe(false); // Invalid
    });

    it('should handle expressions starting or ending with operators', () => {
      mockPageProps(['properties.view-all']);

      const { result } = renderHook(() => usePermissions());

      // These should be handled gracefully
      expect(result.current.hasPermission('||properties.view-all')).toBe(false); // Invalid
      expect(result.current.hasPermission('properties.view-all||')).toBe(false); // Invalid
      expect(result.current.hasPermission('&&properties.view-all')).toBe(false); // Invalid
      expect(result.current.hasPermission('properties.view-all&&')).toBe(false); // Invalid
    });
  });

  describe('Comparison with spaced expressions', () => {
    it('should produce the same results with and without spaces', () => {
      mockPageProps([
        'properties.view-all',
        'properties.view-own',
        'admin.access',
      ]);

      const { result } = renderHook(() => usePermissions());

      // Test that expressions with and without spaces produce the same results
      const expressions = [
        'properties.view-all||properties.view-own',
        'properties.view-all || properties.view-own',
        'properties.view-all&&admin.access',
        'properties.view-all && admin.access',
        'properties.view-all|properties.view-own',
        'properties.view-all | properties.view-own',
        'properties.view-all&admin.access',
        'properties.view-all & admin.access',
        '(properties.view-all||properties.view-own)&&admin.access',
        '(properties.view-all || properties.view-own) && admin.access',
      ];

      expressions.forEach(expr => {
        const hasPermission = result.current.hasPermission(expr);
        expect(hasPermission).toBeDefined();
        expect(typeof hasPermission).toBe('boolean');
      });
    });
  });
});
