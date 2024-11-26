import { QueryClient, QueryClientProvider } from 'react-query';
import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { act } from 'react';
import {
  useChunkedCQLFetch,
  useOkapiKy,
} from '@folio/stripes/core';

import useUserTenantRoles, { chunkedRolesReducer } from './useUserTenantRoles';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const userRoleData = {
  'userRoles': [
    {
      'userId': 'cchase',
      'roleId': 'amigo',
    },
    {
      'userId': 'cchase',
      'roleId': 'clark',
    },
  ],
  'totalRecords': 2
};

const roleData = {
  'roles': [
    {
      'id': 'clark',
      'name': 'Clark Griswold',
      'description': 'Father of the year',
    },
    {
      'id': 'amigo',
      'name': 'Bandit',
      'description': 'A very thirsty man',
    }
  ],
  'totalRecords': 2,
  'resultInfo': {
    'totalRecords': 2
  }
};

describe('useUserTenantRoles', () => {
  const mockUsersTenantRolesGet = jest.fn(() => ({
    json: () => Promise.resolve(userRoleData),
  }));
  const mockRolesGet = jest.fn(() => ({
    items: roleData,
    isLoading: false,
  }));

  beforeEach(() => {
    queryClient.clear();
    mockUsersTenantRolesGet.mockClear();
    mockRolesGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue({
      extend: () => ({
        get: mockUsersTenantRolesGet,
      })
    });
    useChunkedCQLFetch.mockClear().mockReturnValue({
      items: roleData,
      isLoading: false,
    });
  });

  it('fetches roles assigned to a user', async () => {
    const props = { userId: 'u', tenantId: 't' };
    const { result } = renderHook(() => useUserTenantRoles(props), { wrapper });
    await act(() => !result.current.isFetching);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.userRoles).toEqual(roleData);
    expect(useChunkedCQLFetch).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: props.tenantId,
      ids: expect.any(Array),
      reduceFunction: expect.any(Function),
    }));
  });
});

describe('chunkedRolesReducer', () => {
  it('assembles chunks', () => {
    const list = [
      { data: { roles: [1, 2, 3] } },
      { data: { roles: [4, 5, 6] } },
    ];

    const result = chunkedRolesReducer(list);
    expect(result.length).toBe(6);
  });
});
