import { useQueries } from 'react-query';
import { useStripes, useOkapiKy } from '@folio/stripes/core';
import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import useUserAffiliationRoles from './useUserAffiliationRoles';
import useUserAffiliations from '../useUserAffiliations';

jest.mock('react-query', () => ({
  useQueries: jest.fn(),
}));

jest.mock('@folio/stripes/core', () => ({
  useStripes: jest.fn(),
  useOkapiKy: jest.fn(),
}));

jest.mock('../useUserAffiliations', () => jest.fn());

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

  const mockUser = {
    id: 'testUserId',
    consortium: { id: 'consortiumId' },
  };

  beforeEach(() => {
    useStripes.mockReturnValue(mockStripes);
    useOkapiKy.mockReturnValue(mockKy);
    useUserAffiliations.mockReturnValue({
      affiliations: [{ tenantId: 'tenant1' }, { tenantId: 'tenant2' }],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty arrays if no roles are found', async () => {
    const userId = 'testUserId';

    useQueries.mockImplementation((queries) => queries.map(() => ({
      data: { userRoles: [] },
      isLoading: false,
      isError: false,
    })));

    const { result } = renderHook(() => useUserAffiliationRoles(userId, mockUser));

    await waitFor(() => expect(result.current.userRoles).toEqual({
      tenant1: [],
      tenant2: [],
    }));
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle missing tenants gracefully', async () => {
    const userId = 'testUserId';

    useUserAffiliations.mockReturnValue({
      affiliations: [],
    });

    useQueries.mockImplementation(() => []);

    const { result } = renderHook(() => useUserAffiliationRoles(userId, mockUser));

    await waitFor(() => expect(result.current.userRoles).toEqual({}));
    expect(result.current.isLoading).toBe(false);
  });
});
