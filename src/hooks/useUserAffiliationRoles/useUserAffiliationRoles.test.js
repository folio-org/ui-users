import { useQuery } from 'react-query';
import { useStripes, useOkapiKy } from '@folio/stripes/core';
import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import useUserAffiliationRoles from './useUserAffiliationRoles';
import useAllRolesData from '../useAllRolesData/useAllRolesData';

jest.mock('react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@folio/stripes/core', () => ({
  useStripes: jest.fn(),
  useOkapiKy: jest.fn(),
  useNamespace: jest.fn(() => ['test-namespace']),
}));

jest.mock('../useAllRolesData/useAllRolesData');

describe('useUserAffiliationRoles', () => {
  const mockStripes = {
    config: { maxUnpagedResourceCount: 1000 },
    hasPerm: jest.fn().mockReturnValue(true),
    hasInterface: jest.fn().mockReturnValue(true),
    user: { user: { tenants: [{ id: 'tenant1' }, { id: 'tenant2' }] } },
    okapi: { tenant: 'defaultTenant' },
  };

  const mockKy = {
    extend: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useStripes.mockReturnValue(mockStripes);
    useOkapiKy.mockReturnValue(mockKy);
  });

  it('should return user roles sorted alphabetically by role name', async () => {
    const userId = 'testUserId';
    const tenantId = 'tenant1';

    useAllRolesData.mockReturnValue({
      isLoading: false,
      isFetching: false,
      allRolesMapStructure: new Map([
        ['userRoleId', { id: 'userRoleId', name: 'User' }],
        ['adminRoleId', { id: 'adminRoleId', name: 'Admin' }],
      ]),
    });

    useQuery.mockReturnValue({
      data: { userRoles: [{ roleId: 'userRoleId' }, { roleId: 'adminRoleId' }] },
      isLoading: false,
      isFetching: false,
    });

    const { result } = renderHook(() => useUserAffiliationRoles(userId, tenantId));

    expect(result.current.userRoleIds).toEqual(['adminRoleId', 'userRoleId']);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });

  it('should return empty array if no roles are found', async () => {
    const userId = 'testUserId';
    const tenantId = 'tenant1';

    useAllRolesData.mockReturnValue({
      isLoading: false,
      isFetching: false,
      allRolesMapStructure: new Map(),
    });

    useQuery.mockReturnValue({
      data: { userRoles: [] },
      isLoading: false,
      isFetching: false,
    });

    const { result } = renderHook(() => useUserAffiliationRoles(userId, tenantId));

    expect(result.current.userRoleIds).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return empty array if user has no assigned roles', async () => {
    const userId = 'testUserId';
    const tenantId = 'tenant1';

    useAllRolesData.mockReturnValue({
      isLoading: false,
      isFetching: false,
      allRolesMapStructure: new Map([
        ['role1', { id: 'role1', name: 'Role 1' }],
        ['role2', { id: 'role2', name: 'Role 2' }],
      ]),
    });

    useQuery.mockReturnValue({
      data: { userRoles: [] },
      isLoading: false,
      isFetching: false,
    });

    const { result } = renderHook(() => useUserAffiliationRoles(userId, tenantId));

    expect(result.current.userRoleIds).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should show loading state when roles are being fetched', () => {
    const userId = 'testUserId';
    const tenantId = 'tenant1';

    useAllRolesData.mockReturnValue({
      isLoading: true,
      isFetching: true,
      allRolesMapStructure: new Map(),
    });

    useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    const { result } = renderHook(() => useUserAffiliationRoles(userId, tenantId));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);
  });

  it('should not fetch data when permission is denied', () => {
    const userId = 'testUserId';
    const tenantId = 'tenant1';

    mockStripes.hasPerm.mockReturnValue(false);

    useAllRolesData.mockReturnValue({
      isLoading: false,
      isFetching: false,
      allRolesMapStructure: new Map(),
    });

    useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    });

    const { result } = renderHook(() => useUserAffiliationRoles(userId, tenantId));

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ enabled: false })
    );
    expect(result.current.userRoleIds).toEqual([]);
  });

  describe('when roleId does not exist in allRolesMapStructure', () => {
    it('should filter out undefined roles', () => {
      const userId = 'testUserId';
      const tenantId = 'tenant1';

      useAllRolesData.mockReturnValue({
        isLoading: false,
        isFetching: false,
        allRolesMapStructure: new Map([
          ['role-id-1', { id: 'role-id-1', name: 'Admin' }],
          ['role-id-2', { id: 'role-id-2', name: 'User' }],
        ]),
      });

      useQuery.mockReturnValue({
        data: {
          userRoles: [
            { roleId: 'role-id-1' },
            { roleId: 'createdRoleId' }, // This role doesn't exist in the map
            { roleId: 'role-id-2' },
          ],
        },
        isLoading: false,
        isFetching: false,
      });

      const { result } = renderHook(() => useUserAffiliationRoles(userId, tenantId));

      expect(result.current.userRoleIds).toEqual(['role-id-1', 'role-id-2']);
    });
  });
});
