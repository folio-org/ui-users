import { renderHook } from '@folio/jest-config-stripes/testing-library/react-hooks';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';
import { batchRequest } from '@folio/stripes-acq-components';

import useAssignedUsers from './useAssignedUsers';


const mockGrantedToIds = ['userId1', 'userId2'];
const mockTenantId = 'tenantId';
const mockData = {
  data: [{
    id: '1',
    patronGroup: 'pg1',
    personal: {
      firstName: 'firstName1',
      lastName: 'lastName1',
    }
  }, {
    id: '2',
    patronGroup: 'pg2',
    personal: {
      firstName: 'firstName2',
      lastName: 'lastName2',
    }
  }],
  isLoading: false,
};

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: jest.fn(() => ['test']),
  useOkapiKy: jest.fn(),
}));

jest.mock('@folio/stripes-acq-components', () => ({
  batchRequest: jest.fn(() => mockData),
}));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useAssignedUsers', () => {
  const mockGet = jest.fn(() => ({
    json: () => mockData,
  }));
  const setHeaderMock = jest.fn();
  const kyMock = {
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        get: mockGet,
      };
    }),
  };

  beforeEach(() => {
    mockGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue(kyMock);
  });

  it('should call useOkapiKy with the correct headers', () => {
    const grantedToIds = [1, 2, 3];
    const tenantId = 'tenant-123';
    renderHook(() => useAssignedUsers({ grantedToIds, tenantId }));

    expect(useOkapiKy).toHaveBeenCalled();
    expect(kyMock.extend).toHaveBeenCalledWith({
      hooks: {
        beforeRequest: [expect.any(Function)],
      },
    });

    const [beforeRequestHook] = kyMock.extend.mock.calls[0][0].hooks.beforeRequest;
    const requestHeaders = {
      set: jest.fn(),
    };
    const requestMock = {
      headers: requestHeaders,
    };

    beforeRequestHook(requestMock);

    expect(requestHeaders.set).toHaveBeenCalledWith('X-Okapi-Tenant', tenantId);
  });

  it('should fetch assigned users', async () => {
    batchRequest.mockClear()
      .mockImplementationOnce(() => mockGrantedToIds)
      .mockImplementationOnce(() => mockData.data)
      .mockReturnValueOnce([{ userId: '1' }, { userId: '2' }])
      .mockReturnValueOnce([{ id: '1', patronGroup: 'pg1', personal: { firstName: 'firstName1', lastName: 'lastName1' } }, { id: '2', patronGroup: 'pg2', personal: { firstName: 'firstName2', lastName: 'lastName2' } }])
      .mockReturnValueOnce([{ id: 'pg1', group: 'group1' }, { id: 'pg2', group: 'group2' }]);

    const { result, waitFor } = renderHook(() => useAssignedUsers({ grantedToIds: mockGrantedToIds, tenantId: mockTenantId }), { wrapper });

    await waitFor(() => !result.current.isLoading);
    console.log('result', result.current);
    expect(result.current.users).toHaveLength(2);
  });

  it('should return empty assigned users', async () => {
    const { result, waitFor } = renderHook(() => useAssignedUsers({ grantedToIds: [], tenantId: mockTenantId }), { wrapper });

    await waitFor(() => !result.current.isLoading);
    expect(result.current.users).toHaveLength(0);
  });
});
