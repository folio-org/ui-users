import { QueryClient, QueryClientProvider } from 'react-query';
import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react';

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
    const { result } = renderHook(() => useUserTenantRoles({ userId: 'u', tenantId: 't' }), { wrapper });
    await act(() => !result.current.isFetching);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.userRoles).toEqual(roleData);
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



// import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
// import {
//   QueryClient,
//   QueryClientProvider,
// } from 'react-query';

// import { useOkapiKy, useStripes } from '@folio/stripes/core';

// import roles from 'fixtures/roles';
// import useUserTenantRoles from './useUserTenantRoles';

// const queryClient = new QueryClient();

// // eslint-disable-next-line react/prop-types
// const wrapper = ({ children }) => (
//   <QueryClientProvider client={queryClient}>
//     {children}
//   </QueryClientProvider>
// );

// const response = {
//   roles,
//   totalRecords: roles.length,
// };

// describe('useUserTenantRoles', () => {
//   const getMock = jest.fn(() => ({
//     json: () => Promise.resolve(response),
//   }));
//   const setHeaderMock = jest.fn();
//   const kyMock = {
//     extend: jest.fn(({ hooks: { beforeRequest } }) => {
//       beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

//       return {
//         get: getMock,
//       };
//     }),
//   };

//   beforeEach(() => {
//     getMock.mockClear();

//     useStripes.mockClear().mockReturnValue({
//       okapi: {},
//       config: {
//         maxUnpagedResourceCount: 1000,
//       }
//     });
//     useOkapiKy.mockClear().mockReturnValue(kyMock);
//   });

//   it('should fetch user roles for specified tenant', async () => {
//     const options = {
//       userId: 'userId',
//       tenantId: 'tenantId',
//     };
//     const { result } = renderHook(() => useUserTenantRoles(options), { wrapper });

//     await waitFor(() => !result.current.isLoading);

//     expect(setHeaderMock).toHaveBeenCalledWith('X-Okapi-Tenant', options.tenantId);
//     expect(getMock).toHaveBeenCalledWith('roles/users', expect.objectContaining({}));
//   });
// });
