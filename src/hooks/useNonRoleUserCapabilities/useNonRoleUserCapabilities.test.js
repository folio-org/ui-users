import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { useChunkedCQLFetch, useOkapiKy } from '@folio/stripes/core';

import useUserTenantRoles from '../useUserTenantRoles';
import useNonRoleUserCapabilities from './useNonRoleUserCapabilities';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: jest.fn(() => ['test']),
  useOkapiKy: jest.fn(),
  useChunkedCQLFetch: jest.fn(),
}));
jest.mock('../useUserTenantRoles', () => jest.fn());

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const userCapabilitiesData = {
  totalRecords: 2,
  capabilities: [
    {
      id: 'user-only-capability-id',
      resource: 'Users',
      action: 'view',
      applicationId: 'app-platform-minimal-0.0.4',
      type: 'data',
    },
    {
      id: 'shared-with-role-capability-id',
      resource: 'Roles',
      action: 'view',
      applicationId: 'app-platform-minimal-0.0.4',
      type: 'data',
    },
  ],
};

const roleCapability = {
  id: 'shared-with-role-capability-id',
  resource: 'Roles',
  action: 'view',
  applicationId: 'app-platform-minimal-0.0.4',
  type: 'data',
};

describe('useNonRoleUserCapabilities', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(userCapabilitiesData),
  }));

  beforeEach(() => {
    queryClient.clear();
    mockGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue({
      get: mockGet,
    });
    useUserTenantRoles.mockClear().mockReturnValue({
      userRoles: [{ id: 'role-id' }],
      isFetching: false,
    });
    useChunkedCQLFetch.mockClear().mockReturnValue({
      items: [roleCapability],
      isLoading: false,
    });
  });

  it('fetches role capabilities via the chunked "role" CQL query rather than one request per role', async () => {
    renderHook(() => useNonRoleUserCapabilities('user-id', 'tenant-id'), { wrapper });

    expect(useChunkedCQLFetch).toHaveBeenCalledWith(expect.objectContaining({
      endpoint: 'capabilities',
      idName: 'role',
      ids: ['role-id'],
      tenantId: 'tenant-id',
    }));
  });

  it('excludes capabilities also granted by one of the user\'s roles', async () => {
    const { result } = renderHook(() => useNonRoleUserCapabilities('user-id', 'tenant-id'), { wrapper });

    await waitFor(() => {
      if (result.current.isLoading) {
        throw new Error('still loading');
      }
    });

    expect(result.current.capabilitiesTotalCount).toBe(1);
    expect(result.current.groupedNonRoleUserCapabilitiesByType.data).toHaveLength(1);
    expect(result.current.groupedNonRoleUserCapabilitiesByType.data[0].id).toBe('user-only-capability-id');
  });

  it('keeps all user capabilities when the user has no assigned roles', async () => {
    useUserTenantRoles.mockReturnValue({ userRoles: [], isFetching: false });
    useChunkedCQLFetch.mockReturnValue({ items: [], isLoading: false });

    const { result } = renderHook(() => useNonRoleUserCapabilities('user-id', 'tenant-id'), { wrapper });

    await waitFor(() => {
      if (result.current.isLoading) {
        throw new Error('still loading');
      }
    });

    expect(result.current.capabilitiesTotalCount).toBe(2);
  });

  it('stops loading and falls back to an empty count when the user capabilities request fails', async () => {
    mockGet.mockReturnValue({ json: () => Promise.reject(new Error('boom')) });

    const { result } = renderHook(() => useNonRoleUserCapabilities('user-id', 'tenant-id'), { wrapper });

    await waitFor(() => {
      if (result.current.isLoading) {
        throw new Error('still loading');
      }
    });

    expect(result.current.capabilitiesTotalCount).toBe(0);
  });
});
