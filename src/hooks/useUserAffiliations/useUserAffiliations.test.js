import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import { useOkapiKy } from '@folio/stripes/core';

import affiliations from '../../../test/jest/fixtures/affiliations';
import { CONSORTIA_USER_TENANTS_API } from '../../constants';
import useUserAffiliations from './useUserAffiliations';

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useUserAffiliations', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve({
      userTenants: affiliations,
      totalRecords: affiliations.length,
    }),
  }));

  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue({ get: mockGet });
  });

  it('should fetch user\'s consortium affiliations by user\'s id', async () => {
    const userId = 'usedId';
    const { result, waitFor } = renderHook(() => useUserAffiliations({ userId }), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet).toHaveBeenCalledWith(
      CONSORTIA_USER_TENANTS_API,
      expect.objectContaining({ searchParams: { userId } }),
    );
    expect(result.current.affiliations).toEqual(affiliations);
  });
});
