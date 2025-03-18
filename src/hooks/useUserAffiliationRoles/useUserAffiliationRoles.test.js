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

  it('should return user roles for each tenant', async () => {
    const userId = 'testUserId';
    const mockData = [
      { userRoles: [{ roleId: 'role1' }, { roleId: 'role2' }] },
      { userRoles: [{ roleId: 'role3' }] },
    ];

    useQueries.mockReturnValue([
      { data: mockData[0] },
      { data: mockData[1] },
    ]);

    const { result } = renderHook(() => useUserAffiliationRoles(userId));

    await waitFor(() => expect(result.current).toEqual({
      tenant1: ['role1', 'role2'],
      tenant2: ['role3'],
    }));
  });

  it('should return empty arrays if no roles are found', async () => {
    const userId = 'testUserId';

    useQueries.mockReturnValue([
      { data: { userRoles: [] } },
      { data: { userRoles: [] } },
    ]);

    const { result } = renderHook(() => useUserAffiliationRoles(userId));

    await waitFor(() => expect(result.current).toEqual({
      tenant1: [],
      tenant2: [],
    }));
  });

  it('should handle missing tenants gracefully', async () => {
    const userId = 'testUserId';
    mockStripes.user.user.tenants = null;

    useQueries.mockReturnValue([
      { data: { userRoles: [{ roleId: 'role1' }] } },
    ]);

    const { result } = renderHook(() => useUserAffiliationRoles(userId));

    await waitFor(() => expect(result.current).toEqual({
      defaultTenant: ['role1'],
    }));
  });
});
