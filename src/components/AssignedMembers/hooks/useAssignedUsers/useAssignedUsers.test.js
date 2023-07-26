import { renderHook } from '@folio/jest-config-stripes/testing-library/react-hooks';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

import { GROUPS_API, PERMISSIONS_API, USERS_API } from '../../constants';
import { batchRequest } from './utils';
import useAssignedUsers from './useAssignedUsers';

const mockGrantedToIds = ['userId1', 'userId2'];
const mockTenantId = 'tenantId';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: jest.fn(() => ['test']),
  useOkapiKy: jest.fn(),
  useStripes: jest.fn(() => ({
    okapi: {
      tenant: mockTenantId,
    },
  })),
}));

jest.mock('./utils', () => ({
  batchRequest: jest.fn(),
  buildQueryByIds: jest.fn(),
}));

const queryClient = new QueryClient();

const kyResponseMap = {
  [USERS_API]: { users: [
    { id: '1', patronGroup: 'pg1', personal: { firstName: 'firstName1', lastName: 'lastName1' } },
    { id: '2', patronGroup: 'pg2', personal: { firstName: 'firstName2', lastName: 'lastName2' } }] },
  [GROUPS_API]: { usergroups: [{ id: 'pg1', group: 'group1' }, { id: 'pg2', group: 'group2' }] },
  [PERMISSIONS_API]: { permissionUsers: [{ userId: '1' }, { userId: '2' }] },
};

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useAssignedUsers', () => {
  const setHeaderMock = jest.fn();
  const kyMock = jest.fn(() => ({
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        get: (path) => ({
          json: () => Promise.resolve(kyResponseMap[path]),
        })
      };
    }),
  }));

  beforeEach(() => {
    kyMock.mockClear();
    useOkapiKy.mockImplementation(kyMock);
  });

  it('should return empty assigned users', async () => {
    const { result, waitFor } = renderHook(() => useAssignedUsers({
      grantedToIds: [],
      permissionSetId: mockTenantId,
      tenantId: mockTenantId,
    }), { wrapper });

    await waitFor(() => !result.current.isLoading);
    expect(result.current.users).toHaveLength(0);
  });

  it('should fetch assigned users', async () => {
    batchRequest.mockClear()
      .mockResolvedValueOnce(kyResponseMap[PERMISSIONS_API].permissionUsers)
      .mockResolvedValueOnce(kyResponseMap[USERS_API].users);

    const { result, waitFor } = renderHook(() => useAssignedUsers({
      grantedToIds: mockGrantedToIds,
      permissionSetId: mockTenantId,
      tenantId: mockTenantId,
    }), { wrapper });

    await waitFor(() => !result.current.isLoading);
    expect(result.current.users).toHaveLength(2);
  });
});
