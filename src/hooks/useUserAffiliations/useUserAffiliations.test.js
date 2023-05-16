import { renderHook } from '@folio/jest-config-stripes/testing-library/react-hooks';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import orderBy from 'lodash/orderBy';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import affiliations from '../../../test/jest/fixtures/affiliations';
import consortia from '../../../test/jest/fixtures/consortia';
import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
  MAX_RECORDS,
} from '../../constants';
import useUserAffiliations from './useUserAffiliations';

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

const response = {
  userTenants: affiliations,
  totalRecords: affiliations.length,
};

const consortium = {
  ...consortia[0],
  centralTenantId: 'mobius',
};

describe('useUserAffiliations', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(response),
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
    useStripes.mockClear().mockReturnValue({
      user: {
        user: { consortium },
      }
    });
  });

  it('should fetch user\'s consortium affiliations by user\'s id when there is consortium', async () => {
    const userId = 'usedId';
    const { result, waitFor } = renderHook(() => useUserAffiliations({ userId }), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet.mock.calls.length).toBe(1);
    expect(mockGet).toHaveBeenCalledWith(
      `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
      expect.objectContaining({ searchParams: { userId, limit: MAX_RECORDS } }),
    );
    expect(result.current.affiliations).toEqual(orderBy(affiliations, 'tenantName'));
  });

  it('should not fetch user\'s consortium affiliations by user\'s id when there is not consortium', async () => {
    useStripes.mockClear().mockReturnValue({ a: 1 });

    const userId = 'usedId';
    const { result, waitFor } = renderHook(() => useUserAffiliations({ userId }, { assignedToCurrentUser: false }), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet.mock.calls.length).toBe(0);
  });
});
