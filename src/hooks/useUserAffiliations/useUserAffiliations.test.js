import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import { useOkapiKy } from '@folio/stripes/core';

import affiliations from '../../../test/jest/fixtures/affiliations';
import consortia from '../../../test/jest/fixtures/consortia';
import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
} from '../../constants';
import useUserAffiliations from './useUserAffiliations';

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const [consortium] = consortia;
const response = {
  consortia,
  userTenants: affiliations,
  totalRecords: affiliations.length,
};

describe('useUserAffiliations', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(response),
  }));

  beforeEach(() => {
    mockGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue({ get: mockGet });
  });

  it('should fetch system consortia', async () => {
    const userId = 'usedId';
    const { result, waitFor } = renderHook(() => useUserAffiliations({ userId }), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet).toHaveBeenCalledWith(CONSORTIA_API);
  });

  it('should fetch user\'s consortium affiliations by user\'s id when there is consortium', async () => {
    const userId = 'usedId';
    const { result, waitFor } = renderHook(() => useUserAffiliations({ userId }), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet.mock.calls.length).toBe(2);
    expect(mockGet).toHaveBeenCalledWith(
      `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
      expect.objectContaining({ searchParams: { userId } }),
    );
    expect(result.current.affiliations).toEqual(affiliations);
  });

  it('should not fetch user\'s consortium affiliations by user\'s id when there is not consortium', async () => {
    const getMock = jest.fn().mockReturnValue(Promise.resolve());

    useOkapiKy.mockClear().mockReturnValue({ get: getMock });

    const userId = 'usedId';
    const { result, waitFor } = renderHook(() => useUserAffiliations({ userId }), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(getMock.mock.calls.length).toBe(1);
  });
});
