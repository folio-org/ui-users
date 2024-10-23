import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import usePatronGroups from './usePatronGroups';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const usergroups = [{ id: 'ug-1' }];

describe('usePatronGroups', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve({ usergroups }),
  }));

  beforeEach(() => {
    jest.clearAllMocks();

    useOkapiKy.mockReturnValue({
      get: mockGet,
    });
  });

  it('should fetch patron groups', async () => {
    const { result } = renderHook(() => usePatronGroups(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.patronGroups).toEqual(usergroups);
  });
});
