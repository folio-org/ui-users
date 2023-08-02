import { renderHook } from '@folio/jest-config-stripes/testing-library/react-hooks';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import useAssignedUsersMutation from './useAssignedUsersMutation';



jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: jest.fn(() => ['test']),
  useOkapiKy: jest.fn(),
  useStripes: jest.fn(),
}));
const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const userRecords = [
  {
    id: '1',
    userId: '1',
    permissions: ['perm1', 'perm2'],
  },
];

describe('useAssignedUsersMutation', () => {
  const setGrantedToIds = jest.fn();
  const tenantId = 'diku';
  const permissionName = 'user.assign-permissions';

  const defaultProps = {
    tenantId,
    permissionName,
    setGrantedToIds,
  };

  const setHeaderMock = jest.fn();
  const kyMock = jest.fn(() => ({
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        delete: jest.fn(() => 'ok'),
        get: () => ({ json: () => Promise.resolve({ permissionUsers: userRecords }) }),
        put: () => ({ json: () => Promise.all(['ok']) }),
      };
    }),
  }));

  beforeEach(() => {
    kyMock.mockClear();
    useStripes.mockClear().mockReturnValue({ okapi: { tenant: tenantId } });
    useOkapiKy.mockImplementation(kyMock);
  });

  it('should have assignUser, unassignUsers mutations', async () => {
    const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });

    expect(result.current).toHaveProperty('assignUsers');
    expect(result.current).toHaveProperty('unassignUsers');
  });

  it('should call assignUser, unassignUsers mutations', async () => {
    const { result } = renderHook(() => useAssignedUsersMutation({ ...defaultProps, tenantId: '' }, {}), { wrapper });

    await result.current.assignUsers(['1', '2']);
    await result.current.unassignUsers(['1']);

    expect(setGrantedToIds).toHaveBeenCalledTimes(2);
  });
});
