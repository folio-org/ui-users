import { useQueries } from 'react-query';
import { useStripes, useOkapiKy } from '@folio/stripes/core';
import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import useUserAffiliationRoles from './useUserAffiliationRoles';

jest.mock('react-query', () => ({
  useQueries: jest.fn(),
}));

jest.mock('@folio/stripes/core', () => ({
  useStripes: jest.fn(),
  useOkapiKy: jest.fn(),
}));

describe('useUserAffiliationRoles', () => {
  const mockStripes = {
    config: { maxUnpagedResourceCount: 1000 },
    hasPerm: jest.fn().mockReturnValue(true),
    user: { user: { tenants: [{ id: 'tenant1' }, { id: 'tenant2' }] } },
    okapi: { tenant: 'defaultTenant' },
  };

  const mockKy = {
    extend: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(() => {
    useStripes.mockReturnValue(mockStripes);
    useOkapiKy.mockReturnValue(mockKy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user roles for each tenant sorted alphabetically by role name', async () => {
    const userId = 'testUserId';

    useQueries.mockImplementation((queries) => queries.map(({ queryKey }, index) => {
      if (queryKey[0].includes('userTenantRoles')) {
        if (index === 0) {
          return {
            data: { userRoles: [{ roleId: 'userRoleId' }, { roleId: 'adminRoleId' }] },
            isLoading: false,
            isError: false,
          };
        }
        return {
          data: { userRoles: [{ roleId: 'tenant2monkey' }] },
          isLoading: false,
          isError: false,
        };
      }
      if (queryKey[0].includes('tenantRolesAllRecords')) {
        if (index === 0) {
          return {
            data: { roles: [{ id: 'userRoleId', name: 'User' }, { id: 'adminRoleId', name: 'Admin' }] },
            isLoading: false,
            isError: false,
          };
        }
        return {
          data: { roles: [{ id: 'tenant2monkey', name: 'Monkey' }, { id: 'tenant4Monkey', name: 'Excluded' }] },
          isLoading: false,
          isError: false,
        };
      }
      return { data: undefined, isLoading: false, isError: false };
    }));

    const { result } = renderHook(() => useUserAffiliationRoles(userId));

    expect(result.current).toEqual({ tenant1: ['adminRoleId', 'userRoleId'], tenant2: ['tenant2monkey'] });
  });

  it('should return empty arrays if no roles are found', async () => {
    const userId = 'testUserId';

    useQueries.mockImplementation((queries) => queries.map(({ queryKey }) => {
      if (queryKey[0].includes('userTenantRoles')) {
        return { data: { userRoles: [] } };
      }
      if (queryKey[0].includes('tenantRolesAllRecords')) {
        return { data: { roles: [] } };
      }
      return { data: undefined, isLoading: false, isError: false };
    }));

    const { result } = renderHook(() => useUserAffiliationRoles(userId));

    await waitFor(() => expect(result.current).toEqual({
      tenant1: [],
      tenant2: [],
    }));
  });

  it('should handle missing tenants gracefully', async () => {
    const userId = 'testUserId';
    mockStripes.user.user.tenants = null;

    useQueries.mockImplementation((queries) => queries.map(({ queryKey }) => {
      if (queryKey[0].includes('userTenantRoles')) {
        return { data: { userRoles: [] } };
      }
      if (queryKey[0].includes('tenantRolesAllRecords')) {
        return { data: { roles: [] } };
      }
      return { data: undefined, isLoading: false, isError: false };
    }));

    const { result } = renderHook(() => useUserAffiliationRoles(userId));

    await waitFor(() => expect(result.current).toEqual({
      defaultTenant: [],
    }));
  });
});
