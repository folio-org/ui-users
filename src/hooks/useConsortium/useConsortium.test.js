import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import { useOkapiKy } from '@folio/stripes/core';

import consortia from '../../../test/jest/fixtures/consortia';
import { CONSORTIA_API } from '../../constants';
import useConsortium from './useConsortium';

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useConsortium', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve({ consortia }),
  }));

  beforeEach(() => {
    mockGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue({ get: mockGet });
  });

  it('should fetch system consortia', async () => {
    const { result, waitFor } = renderHook(() => useConsortium(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet).toHaveBeenCalledWith(CONSORTIA_API);
    expect(result.current.consortium).toEqual(consortia[0]);
  });
});
