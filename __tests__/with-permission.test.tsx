import React from 'react';
import { render, screen } from '@testing-library/react';
import { withPermission } from '../components/with-permission';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

import { usePage } from '@inertiajs/react';
const mockUsePage = usePage as jest.MockedFunction<typeof usePage>;

describe('withPermission HOC', () => {
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

  // Simple test component
  const TestComponent = ({ title }: { title: string }) => (
    <div data-testid="test-component">{title}</div>
  );

  describe('basic functionality', () => {
    it('should render wrapped component when user has permission', () => {
      mockPageProps(['users.create']);

      const WrappedComponent = withPermission(TestComponent, {
        permission: 'users.create',
      });

      render(<WrappedComponent title="Test Title" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should not render wrapped component when user lacks permission', () => {
      mockPageProps(['posts.view']);

      const WrappedComponent = withPermission(TestComponent, {
        permission: 'users.create',
      });

      render(<WrappedComponent title="Test Title" />);

      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should render fallback when user lacks permission', () => {
      mockPageProps(['posts.view']);

      const WrappedComponent = withPermission(TestComponent, {
        permission: 'users.create',
        fallback: <div data-testid="fallback">Access Denied</div>,
      });

      render(<WrappedComponent title="Test Title" />);

      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('component display name', () => {
    it('should set displayName for named component', () => {
      const NamedComponent = ({ text }: { text: string }) => <div>{text}</div>;
      NamedComponent.displayName = 'NamedComponent';

      const WrappedComponent = withPermission(NamedComponent, {
        permission: 'users.create',
      });

      expect(WrappedComponent.displayName).toBe(
        'withPermission(NamedComponent)'
      );
    });

    it('should set displayName using component name when displayName is not set', () => {
      function MyComponent({ text }: { text: string }) {
        return <div>{text}</div>;
      }

      const WrappedComponent = withPermission(MyComponent, {
        permission: 'users.create',
      });

      expect(WrappedComponent.displayName).toBe('withPermission(MyComponent)');
    });

    it('should handle anonymous components', () => {
      const AnonymousComponent = ({ text }: { text: string }) => (
        <div>{text}</div>
      );

      const WrappedComponent = withPermission(AnonymousComponent, {
        permission: 'users.create',
      });

      expect(WrappedComponent.displayName).toBe(
        'withPermission(AnonymousComponent)'
      );
    });
  });

  describe('all permission options', () => {
    it('should work with expression prop', () => {
      mockPageProps(['users.create', 'admin.access']);

      const WrappedComponent = withPermission(TestComponent, {
        expression: 'users.create && admin.access',
      });

      render(<WrappedComponent title="Expression Test" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should work with anyPermissions prop', () => {
      mockPageProps(['posts.view']);

      const WrappedComponent = withPermission(TestComponent, {
        anyPermissions: ['users.create', 'posts.view'],
      });

      render(<WrappedComponent title="Any Permissions Test" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should work with allPermissions prop', () => {
      mockPageProps(['users.create', 'users.edit']);

      const WrappedComponent = withPermission(TestComponent, {
        allPermissions: ['users.create', 'users.edit'],
      });

      render(<WrappedComponent title="All Permissions Test" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should work with pattern prop', () => {
      mockPageProps(['users.create', 'users.edit']);

      const WrappedComponent = withPermission(TestComponent, {
        pattern: 'users.*',
      });

      render(<WrappedComponent title="Pattern Test" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should work with anyPatterns prop', () => {
      mockPageProps(['users.create']);

      const WrappedComponent = withPermission(TestComponent, {
        anyPatterns: ['users.*', 'posts.*'],
      });

      render(<WrappedComponent title="Any Patterns Test" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should work with allPatterns prop', () => {
      mockPageProps(['users.create', 'posts.view']);

      const WrappedComponent = withPermission(TestComponent, {
        allPatterns: ['users.*', 'posts.*'],
      });

      render(<WrappedComponent title="All Patterns Test" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should work with custom permissions array', () => {
      mockPageProps(['users.create']); // This will be ignored

      const WrappedComponent = withPermission(TestComponent, {
        permission: 'admin.access',
        permissions: ['admin.access', 'super.admin'],
      });

      render(<WrappedComponent title="Custom Permissions Test" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should work with requireAuth set to false', () => {
      mockPageProps([], false); // Not authenticated

      const WrappedComponent = withPermission(TestComponent, {
        permission: 'true',
        requireAuth: false,
      });

      render(<WrappedComponent title="No Auth Required Test" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('props forwarding', () => {
    it('should forward all props to wrapped component', () => {
      mockPageProps(['users.create']);

      interface TestProps {
        title: string;
        count: number;
        isActive: boolean;
        onClick: () => void;
      }

      const PropsTestComponent = ({
        title,
        count,
        isActive,
        onClick,
      }: TestProps) => (
        <div data-testid="props-component">
          <span data-testid="title">{title}</span>
          <span data-testid="count">{count}</span>
          <span data-testid="active">{isActive.toString()}</span>
          <button onClick={onClick} data-testid="button">
            Click
          </button>
        </div>
      );

      const WrappedComponent = withPermission(PropsTestComponent, {
        permission: 'users.create',
      });

      const mockClick = jest.fn();

      render(
        <WrappedComponent
          title="Forwarded Title"
          count={42}
          isActive={true}
          onClick={mockClick}
        />
      );

      expect(screen.getByTestId('props-component')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toHaveTextContent('Forwarded Title');
      expect(screen.getByTestId('count')).toHaveTextContent('42');
      expect(screen.getByTestId('active')).toHaveTextContent('true');

      screen.getByTestId('button').click();
      expect(mockClick).toHaveBeenCalled();
    });
  });
});
