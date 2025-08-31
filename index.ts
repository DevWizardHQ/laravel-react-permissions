// Main permissions system components
export { Can } from './components/can';
export { withPermission } from './components/with-permission';

// Hooks
export { usePermissions } from './hooks/use-permissions';

// Types
export type {
  Auth,
  SharedData,
  User,
  NavItem,
  PermissionProps,
  CanProps,
  UsePermissionsReturn,
  WithPermissionOptions,
} from './types';

// Re-export everything for convenience
export * from './components/can';
export * from './components/with-permission';
export * from './hooks/use-permissions';
export * from './types';
