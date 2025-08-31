import * as PermissionsModule from '../index';

describe('Index Exports', () => {
  it('should export all components and hooks', () => {
    expect(PermissionsModule.Can).toBeDefined();
    expect(PermissionsModule.withPermission).toBeDefined();
    expect(PermissionsModule.usePermissions).toBeDefined();
  });

  it('should export components as functions', () => {
    expect(typeof PermissionsModule.Can).toBe('function');
    expect(typeof PermissionsModule.withPermission).toBe('function');
    expect(typeof PermissionsModule.usePermissions).toBe('function');
  });
});
