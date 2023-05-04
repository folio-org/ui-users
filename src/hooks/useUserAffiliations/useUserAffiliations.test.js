import { renderHook } from '@testing-library/react-hooks';
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

const [consortium] = consortia;
const response = {
  userTenants: affiliations,
  totalRecords: affiliations.length,
};

const stripes = {
  consortium: { ...consortium, centralTenant: affiliations[0].id },
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
    useStripes.mockClear().mockReturnValue(stripes);
    useOkapiKy.mockClear().mockReturnValue(kyMock);
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
    useStripes.mockClear().mockReturnValue({ consortium: {} });

    const userId = 'usedId';
    const { result, waitFor } = renderHook(() => useUserAffiliations({ userId }), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet.mock.calls.length).toBe(0);
  });
});
