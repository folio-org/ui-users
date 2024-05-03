import { QueryClient, QueryClientProvider } from 'react-query';
import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import useAllRolesData from './useAllRolesData';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const data = { roles: [{ id:'1', name: 'role1' }] };

describe('useAllRolesData', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(data),
  }));

  beforeEach(() => {
    queryClient.clear();
    mockGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue({
      get: mockGet,
    });
  });

  it('fetches all roles data', async () => {
    const { result } = renderHook(() => useAllRolesData(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data.roles).toStrictEqual(data.roles);
  });
});
