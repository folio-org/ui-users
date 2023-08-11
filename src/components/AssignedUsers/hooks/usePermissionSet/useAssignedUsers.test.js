import { renderHook } from '@folio/jest-config-stripes/testing-library/react-hooks';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import usePermissionSet from './usePermissionSet';

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

const mockPermissionSet = {
  id: '1',
  displayName: 'test',
  grantedTo: ['1', '2'],
};

describe('usePermissionSet', () => {
  const tenantId = 'diku';
  const permissionSetId = '1';

  const defaultProps = {
    permissionSetId,
    tenantId,
  };

  const setHeaderMock = jest.fn();
  const kyMock = jest.fn(() => ({
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        get: () => ({ json: () => Promise.resolve(mockPermissionSet) }),
      };
    }),
  }));

  beforeEach(() => {
    kyMock.mockClear();
    useStripes.mockClear().mockReturnValue({ okapi: { tenant: tenantId } });
    useOkapiKy.mockImplementation(kyMock);
  });

  it('should return permissionSet data', async () => {
    const { result } = renderHook(() => usePermissionSet(defaultProps, {}), { wrapper });

    expect(result.current).toHaveProperty('grantedTo');
  });
});
