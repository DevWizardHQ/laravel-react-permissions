import { renderHook } from '@testing-library/react';
import { usePermissions } from '../hooks/use-permissions';

// Mock @inertiajs/react
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

import { usePage } from '@inertiajs/react';
const mockUsePage = usePage as jest.MockedFunction<typeof usePage>;

describe('Verify User Case: properties.view-all||properties.view-own', () => {
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

  it('should work with the exact user case: properties.view-all||properties.view-own', () => {
    // Test case 1: User has both permissions
    mockPageProps(['properties.view-all', 'properties.view-own']);
    let { result } = renderHook(() => usePermissions());

    console.log('\n=== Test Case 1: User has BOTH permissions ===');
    console.log('User permissions:', [
      'properties.view-all',
      'properties.view-own',
    ]);
    console.log('Expression: "properties.view-all||properties.view-own"');

    const result1 = result.current.hasPermission(
      'properties.view-all||properties.view-own'
    );
    console.log('Result:', result1);
    expect(result1).toBe(true);
    console.log('✅ PASS: Should return true when user has both permissions');

    // Test case 2: User has only first permission
    mockPageProps(['properties.view-all']);
    result = renderHook(() => usePermissions()).result;

    console.log('\n=== Test Case 2: User has FIRST permission only ===');
    console.log('User permissions:', ['properties.view-all']);
    console.log('Expression: "properties.view-all||properties.view-own"');

    const result2 = result.current.hasPermission(
      'properties.view-all||properties.view-own'
    );
    console.log('Result:', result2);
    expect(result2).toBe(true);
    console.log('✅ PASS: Should return true when user has first permission');

    // Test case 3: User has only second permission
    mockPageProps(['properties.view-own']);
    result = renderHook(() => usePermissions()).result;

    console.log('\n=== Test Case 3: User has SECOND permission only ===');
    console.log('User permissions:', ['properties.view-own']);
    console.log('Expression: "properties.view-all||properties.view-own"');

    const result3 = result.current.hasPermission(
      'properties.view-all||properties.view-own'
    );
    console.log('Result:', result3);
    expect(result3).toBe(true);
    console.log('✅ PASS: Should return true when user has second permission');

    // Test case 4: User has neither permission
    mockPageProps([]);
    result = renderHook(() => usePermissions()).result;

    console.log('\n=== Test Case 4: User has NO permissions ===');
    console.log('User permissions:', []);
    console.log('Expression: "properties.view-all||properties.view-own"');

    const result4 = result.current.hasPermission(
      'properties.view-all||properties.view-own'
    );
    console.log('Result:', result4);
    expect(result4).toBe(false);
    console.log('✅ PASS: Should return false when user has no permissions');
  });

  it('should work with different permission combinations', () => {
    // Test with different permission names to ensure the fix is general
    mockPageProps(['users.create', 'posts.view']);

    const { result } = renderHook(() => usePermissions());

    console.log('\n=== Test with different permissions ===');
    console.log('User permissions:', ['users.create', 'posts.view']);

    // Test OR expression
    const orResult = result.current.hasPermission('users.create||posts.view');
    console.log('users.create||posts.view:', orResult);
    expect(orResult).toBe(true);

    // Test AND expression
    const andResult = result.current.hasPermission('users.create&&posts.view');
    console.log('users.create&&posts.view:', andResult);
    expect(andResult).toBe(true);

    // Test with one missing permission
    const missingResult = result.current.hasPermission(
      'users.create||posts.delete'
    );
    console.log('users.create||posts.delete:', missingResult);
    expect(missingResult).toBe(true);

    // Test with both missing permissions
    const bothMissingResult = result.current.hasPermission(
      'users.delete||posts.delete'
    );
    console.log('users.delete||posts.delete:', bothMissingResult);
    expect(bothMissingResult).toBe(false);

    console.log(
      '✅ PASS: All different permission combinations work correctly'
    );
  });

  it('should work with hyphenated permission names', () => {
    // Test specifically with hyphenated permissions like the user's case
    mockPageProps([
      'user-profile.edit',
      'api-access.read',
      'system-config.update',
    ]);

    const { result } = renderHook(() => usePermissions());

    console.log('\n=== Test with hyphenated permissions ===');
    console.log('User permissions:', [
      'user-profile.edit',
      'api-access.read',
      'system-config.update',
    ]);

    // Test OR with hyphens
    const orResult = result.current.hasPermission(
      'user-profile.edit||api-access.read'
    );
    console.log('user-profile.edit||api-access.read:', orResult);
    expect(orResult).toBe(true);

    // Test AND with hyphens
    const andResult = result.current.hasPermission(
      'user-profile.edit&&api-access.read'
    );
    console.log('user-profile.edit&&api-access.read:', andResult);
    expect(andResult).toBe(true);

    // Test complex expression with hyphens
    const complexResult = result.current.hasPermission(
      '(user-profile.edit||api-access.read)&&system-config.update'
    );
    console.log(
      '(user-profile.edit||api-access.read)&&system-config.update:',
      complexResult
    );
    expect(complexResult).toBe(true);

    console.log('✅ PASS: Hyphenated permission names work correctly');
  });

  it('should debug the evaluation process step by step', () => {
    mockPageProps(['properties.view-all', 'properties.view-own']);

    const { result } = renderHook(() => usePermissions());

    console.log('\n=== Step-by-step debugging ===');
    console.log('User permissions:', [
      'properties.view-all',
      'properties.view-own',
    ]);

    const expression = 'properties.view-all||properties.view-own';
    console.log('Original expression:', expression);

    // Let's manually trace through the normalization process
    let jsExpression = expression;

    // Step 1: Replace double operators with markers
    jsExpression = jsExpression
      .replace(/\|\|/g, ' DOUBLE_PIPE ')
      .replace(/&&/g, ' DOUBLE_AMP ');
    console.log('After double operator replacement:', jsExpression);

    // Step 2: Replace single operators
    jsExpression = jsExpression.replace(/\|/g, ' || ').replace(/&/g, ' && ');
    console.log('After single operator replacement:', jsExpression);

    // Step 3: Replace markers with proper operators
    jsExpression = jsExpression
      .replace(/DOUBLE_PIPE/g, ' || ')
      .replace(/DOUBLE_AMP/g, ' && ');
    console.log('After marker replacement:', jsExpression);

    // Step 4: Clean up spaces
    jsExpression = jsExpression.replace(/\s+/g, ' ').trim();
    console.log('Final normalized expression:', jsExpression);

    // Test the actual function
    const actualResult = result.current.hasPermission(expression);
    console.log('Actual function result:', actualResult);

    expect(actualResult).toBe(true);
    console.log('✅ PASS: Step-by-step debugging shows correct evaluation');
  });
});
