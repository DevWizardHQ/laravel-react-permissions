import React from 'react';
import { render, screen } from '@testing-library/react';
import { Can } from '../components/can';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

import { usePage } from '@inertiajs/react';
const mockUsePage = usePage as jest.MockedFunction<typeof usePage>;

describe('Can Component', () => {
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
      component: 'TestComponent',
      url: '/test',
      version: '1.0.0',
      clearHistory: jest.fn(),
      setError: jest.fn(),
    } as unknown as ReturnType<typeof usePage>);
  };

  describe('basic permission checks', () => {
    it('should render children when user has exact permission', () => {
      mockPageProps(['users.create', 'posts.view']);

      render(
        <Can permission="users.create">
          <div>Create User Button</div>
        </Can>
      );

      expect(screen.getByText('Create User Button')).toBeInTheDocument();
    });

    it('should render fallback when user lacks permission', () => {
      mockPageProps(['posts.view']);

      render(
        <Can permission="users.create" fallback={<div>Access Denied</div>}>
          <div>Create User Button</div>
        </Can>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Create User Button')).not.toBeInTheDocument();
    });

    it('should render nothing when user lacks permission and no fallback', () => {
      mockPageProps(['posts.view']);

      render(
        <Can permission="users.create">
          <div>Create User Button</div>
        </Can>
      );

      expect(screen.queryByText('Create User Button')).not.toBeInTheDocument();
    });
  });

  describe('boolean literals', () => {
    it('should render children for true permission', () => {
      mockPageProps([]);

      render(
        <Can permission="true">
          <div>Always Visible</div>
        </Can>
      );

      expect(screen.getByText('Always Visible')).toBeInTheDocument();
    });

    it('should render fallback for false permission', () => {
      mockPageProps([]);

      render(
        <Can permission="false" fallback={<div>Never Visible</div>}>
          <div>Should Not Show</div>
        </Can>
      );

      expect(screen.getByText('Never Visible')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Show')).not.toBeInTheDocument();
    });
  });

  describe('wildcard patterns', () => {
    it('should render children when user has wildcard permission', () => {
      mockPageProps(['users.create', 'users.edit', 'posts.view']);

      render(
        <Can permission="users.*">
          <div>User Management</div>
        </Can>
      );

      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('should render fallback when user lacks wildcard permission', () => {
      mockPageProps(['posts.view']);

      render(
        <Can permission="users.*" fallback={<div>No User Access</div>}>
          <div>User Management</div>
        </Can>
      );

      expect(screen.getByText('No User Access')).toBeInTheDocument();
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
    });
  });

  describe('logical expressions', () => {
    it('should render children for OR expressions when one condition is true', () => {
      mockPageProps(['users.create']);

      render(
        <Can permission="users.create || posts.create">
          <div>Content Management</div>
        </Can>
      );

      expect(screen.getByText('Content Management')).toBeInTheDocument();
    });

    it('should render children for AND expressions when both conditions are true', () => {
      mockPageProps(['users.create', 'admin.access']);

      render(
        <Can permission="users.create && admin.access">
          <div>Admin User Management</div>
        </Can>
      );

      expect(screen.getByText('Admin User Management')).toBeInTheDocument();
    });

    it('should render fallback for AND expressions when one condition is false', () => {
      mockPageProps(['users.create']);

      render(
        <Can
          permission="users.create && admin.access"
          fallback={<div>Need Admin Access</div>}
        >
          <div>Admin User Management</div>
        </Can>
      );

      expect(screen.getByText('Need Admin Access')).toBeInTheDocument();
      expect(
        screen.queryByText('Admin User Management')
      ).not.toBeInTheDocument();
    });

    it('should handle complex expressions with parentheses', () => {
      mockPageProps(['users.create', 'admin.access']);

      render(
        <Can permission="(users.create || posts.create) && admin.access">
          <div>Admin Content Management</div>
        </Can>
      );

      expect(screen.getByText('Admin Content Management')).toBeInTheDocument();
    });
  });

  describe('expression prop', () => {
    it('should handle complex boolean expressions via expression prop', () => {
      mockPageProps(['users.create', 'posts.view', 'admin.access']);

      render(
        <Can expression="users.create && posts.view || admin.access">
          <div>Complex Logic Access</div>
        </Can>
      );

      expect(screen.getByText('Complex Logic Access')).toBeInTheDocument();
    });

    it('should prioritize expression prop over permission prop', () => {
      mockPageProps(['users.create']);

      render(
        <Can
          permission="users.delete"
          expression="users.create"
          fallback={<div>No Access</div>}
        >
          <div>Should Show</div>
        </Can>
      );

      expect(screen.getByText('Should Show')).toBeInTheDocument();
      expect(screen.queryByText('No Access')).not.toBeInTheDocument();
    });
  });

  describe('anyPermissions prop', () => {
    it('should render children when user has any of the specified permissions', () => {
      mockPageProps(['posts.view']);

      render(
        <Can anyPermissions={['users.create', 'posts.view', 'admin.access']}>
          <div>Multiple Options Access</div>
        </Can>
      );

      expect(screen.getByText('Multiple Options Access')).toBeInTheDocument();
    });

    it('should render fallback when user has none of the specified permissions', () => {
      mockPageProps(['comments.view']);

      render(
        <Can
          anyPermissions={['users.create', 'posts.view', 'admin.access']}
          fallback={<div>No Required Permissions</div>}
        >
          <div>Multiple Options Access</div>
        </Can>
      );

      expect(screen.getByText('No Required Permissions')).toBeInTheDocument();
      expect(
        screen.queryByText('Multiple Options Access')
      ).not.toBeInTheDocument();
    });
  });

  describe('allPermissions prop', () => {
    it('should render children when user has all specified permissions', () => {
      mockPageProps(['users.create', 'posts.view', 'admin.access']);

      render(
        <Can allPermissions={['users.create', 'posts.view']}>
          <div>All Required Access</div>
        </Can>
      );

      expect(screen.getByText('All Required Access')).toBeInTheDocument();
    });

    it('should render fallback when user is missing some permissions', () => {
      mockPageProps(['users.create']);

      render(
        <Can
          allPermissions={['users.create', 'posts.view', 'admin.access']}
          fallback={<div>Missing Some Permissions</div>}
        >
          <div>All Required Access</div>
        </Can>
      );

      expect(screen.getByText('Missing Some Permissions')).toBeInTheDocument();
      expect(screen.queryByText('All Required Access')).not.toBeInTheDocument();
    });
  });

  describe('pattern prop (legacy)', () => {
    it('should render children when pattern matches', () => {
      mockPageProps(['users.create', 'users.edit']);

      render(
        <Can pattern="users.*">
          <div>User Pattern Access</div>
        </Can>
      );

      expect(screen.getByText('User Pattern Access')).toBeInTheDocument();
    });
  });

  describe('anyPatterns prop', () => {
    it('should render children when any pattern matches', () => {
      mockPageProps(['users.create', 'comments.view']);

      render(
        <Can anyPatterns={['users.*', 'posts.*']}>
          <div>Pattern Options Access</div>
        </Can>
      );

      expect(screen.getByText('Pattern Options Access')).toBeInTheDocument();
    });

    it('should render fallback when no patterns match', () => {
      mockPageProps(['comments.view']);

      render(
        <Can
          anyPatterns={['users.*', 'posts.*']}
          fallback={<div>No Pattern Match</div>}
        >
          <div>Pattern Options Access</div>
        </Can>
      );

      expect(screen.getByText('No Pattern Match')).toBeInTheDocument();
      expect(
        screen.queryByText('Pattern Options Access')
      ).not.toBeInTheDocument();
    });
  });

  describe('allPatterns prop', () => {
    it('should render children when all patterns match', () => {
      mockPageProps([
        'users.create',
        'users.edit',
        'posts.view',
        'posts.create',
      ]);

      render(
        <Can allPatterns={['users.*', 'posts.*']}>
          <div>All Patterns Access</div>
        </Can>
      );

      expect(screen.getByText('All Patterns Access')).toBeInTheDocument();
    });

    it('should render fallback when some patterns do not match', () => {
      mockPageProps(['users.create', 'users.edit']);

      render(
        <Can
          allPatterns={['users.*', 'posts.*']}
          fallback={<div>Missing Pattern Access</div>}
        >
          <div>All Patterns Access</div>
        </Can>
      );

      expect(screen.getByText('Missing Pattern Access')).toBeInTheDocument();
      expect(screen.queryByText('All Patterns Access')).not.toBeInTheDocument();
    });
  });

  describe('custom permissions', () => {
    it('should use custom permissions when provided', () => {
      mockPageProps(['users.create', 'posts.view']); // Auth permissions
      const customPermissions = ['admin.access', 'super.admin'];

      render(
        <Can permission="admin.access" permissions={customPermissions}>
          <div>Custom Permission Access</div>
        </Can>
      );

      expect(screen.getByText('Custom Permission Access')).toBeInTheDocument();
    });

    it('should not have access to auth permissions when custom permissions provided', () => {
      mockPageProps(['users.create', 'posts.view']); // Auth permissions
      const customPermissions = ['admin.access'];

      render(
        <Can
          permission="users.create"
          permissions={customPermissions}
          fallback={<div>No Auth Access</div>}
        >
          <div>Should Not Show</div>
        </Can>
      );

      expect(screen.getByText('No Auth Access')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Show')).not.toBeInTheDocument();
    });

    it('should work with empty custom permissions array', () => {
      mockPageProps(['users.create', 'posts.view']);

      render(
        <Can
          permission="users.create"
          permissions={[]}
          fallback={<div>No Permissions</div>}
        >
          <div>Should Not Show</div>
        </Can>
      );

      expect(screen.getByText('No Permissions')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Show')).not.toBeInTheDocument();
    });
  });

  describe('authentication requirements', () => {
    it('should render fallback when not authenticated and requireAuth is true (default)', () => {
      mockPageProps([], false); // Not authenticated

      render(
        <Can permission="users.create" fallback={<div>Please Login</div>}>
          <div>User Management</div>
        </Can>
      );

      expect(screen.getByText('Please Login')).toBeInTheDocument();
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
    });

    it('should render children when not authenticated but requireAuth is false', () => {
      mockPageProps([], false); // Not authenticated

      render(
        <Can permission="true" requireAuth={false}>
          <div>Public Content</div>
        </Can>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });

    it('should allow access when no permissions specified and requireAuth is false', () => {
      mockPageProps([], false); // Not authenticated

      render(
        <Can requireAuth={false}>
          <div>Always Accessible</div>
        </Can>
      );

      expect(screen.getByText('Always Accessible')).toBeInTheDocument();
    });
  });

  describe('prop precedence', () => {
    it('should prioritize expression over other props', () => {
      mockPageProps(['admin.access']);

      render(
        <Can
          permission="users.create"
          expression="admin.access"
          anyPermissions={['posts.view']}
        >
          <div>Expression Wins</div>
        </Can>
      );

      expect(screen.getByText('Expression Wins')).toBeInTheDocument();
    });

    it('should prioritize permission over array-based props', () => {
      mockPageProps(['users.create']);

      render(
        <Can
          permission="users.create"
          anyPermissions={['posts.view']}
          allPermissions={['admin.access']}
        >
          <div>Permission Wins</div>
        </Can>
      );

      expect(screen.getByText('Permission Wins')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle missing auth object gracefully', () => {
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

      render(
        <Can permission="users.create" fallback={<div>No Auth</div>}>
          <div>Should Not Show</div>
        </Can>
      );

      expect(screen.getByText('No Auth')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Show')).not.toBeInTheDocument();
    });

    it('should handle empty anyPermissions array', () => {
      mockPageProps(['users.create']);

      render(
        <Can anyPermissions={[]} fallback={<div>Empty Array</div>}>
          <div>Should Not Show</div>
        </Can>
      );

      expect(screen.getByText('Empty Array')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Show')).not.toBeInTheDocument();
    });

    it('should handle empty allPermissions array', () => {
      mockPageProps(['users.create']);

      render(
        <Can allPermissions={[]}>
          <div>Should Show</div>
        </Can>
      );

      expect(screen.getByText('Should Show')).toBeInTheDocument();
    });

    it('should render multiple children correctly', () => {
      mockPageProps(['users.create']);

      render(
        <Can permission="users.create">
          <div>First Child</div>
          <div>Second Child</div>
          <span>Third Child</span>
        </Can>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });
  });
});
