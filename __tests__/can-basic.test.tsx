import React from 'react';
import { render, screen } from '@testing-library/react';
import { Can } from '../components/can';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

import { usePage } from '@inertiajs/react';
const mockUsePage = usePage as jest.MockedFunction<typeof usePage>;

describe('Can Component - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPageProps = (
    permissions: string[] = [],
    authenticated: boolean = true
  ) => {
    mockUsePage.mockReturnValue({
      props: {
        auth: authenticated
          ? {
              user: {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                permissions,
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
  });
});
