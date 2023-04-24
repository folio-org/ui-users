import { renderHook } from '@testing-library/react-hooks';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import orderBy from 'lodash/orderBy';

import { useOkapiKy } from '@folio/stripes/core';

import affiliations from '../../../test/jest/fixtures/affiliations';
import consortia from '../../../test/jest/fixtures/consortia';
import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
  MAX_RECORDS,
} from '../../constants';
import useConsortium from '../useConsortium';
import useUserAffiliations from './useUserAffiliations';

jest.mock('../useConsortium', () => jest.fn(() => ({
  consortium: null,
  isLoading: false,
})));

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

describe('useUserAffiliations', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(response),
  }));

  beforeEach(() => {
    mockGet.mockClear();
    useConsortium.mockClear().mockReturnValue({ consortium, isLoading: false });
    useOkapiKy.mockClear().mockReturnValue({ get: mockGet });
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
    const getMock = jest.fn(() => ({
      json: () => Promise.resolve({}),
    }));

    useOkapiKy.mockClear().mockReturnValue({ get: getMock });
    useConsortium.mockReturnValue({ isLoading: false, consortium: undefined });

    const userId = 'usedId';
    const { result, waitFor } = renderHook(() => useUserAffiliations({ userId }), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(getMock.mock.calls.length).toBe(0);
  });
});
