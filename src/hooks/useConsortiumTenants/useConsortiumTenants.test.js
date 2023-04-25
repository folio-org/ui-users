import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import { useOkapiKy } from '@folio/stripes/core';

import affiliations from '../../../test/jest/fixtures/affiliations';
import {
  CONSORTIA_API,
  CONSORTIA_TENANTS_API,
  MAX_RECORDS,
} from '../../constants';
import useConsortiumTenants from './useConsortiumTenants';

jest.mock('../useConsortium', () => jest.fn(() => ({
  consortium: { id: 'test', name: 'MOBIUS' },
  isLoading: false,
})));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const response = {
  tenants: affiliations,
  totalRecords: affiliations.length,
};

describe('useConsortiumTenants', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(response),
  }));

  beforeEach(() => {
    mockGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue({ get: mockGet });
  });

  it('should fetch consortium tenants', async () => {
    const { result, waitFor } = renderHook(() => useConsortiumTenants(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet.mock.calls.length).toBe(1);
    expect(mockGet).toHaveBeenCalledWith(
      `${CONSORTIA_API}/test/${CONSORTIA_TENANTS_API}`,
      expect.objectContaining({ searchParams: { limit: MAX_RECORDS } }),
    );
    expect(result.current.tenants).toEqual(affiliations);
  });
});
