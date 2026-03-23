import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import useDepartmentsQuery from './useDepartmentsQuery';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const departments = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Design' },
];

describe('useDepartmentsQuery', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve({ departments }),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();

    useOkapiKy.mockReturnValue({
      get: mockGet,
    });
  });

  it('should fetch departments', async () => {
    const { result } = renderHook(() => useDepartmentsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith('departments', {
      searchParams: { limit: '10000' },
    });
    expect(result.current.departments).toEqual(departments);
  });

  it('should pass tenantId to useOkapiKy', () => {
    renderHook(() => useDepartmentsQuery('central-tenant'), { wrapper });

    expect(useOkapiKy).toHaveBeenCalledWith({ tenant: 'central-tenant' });
  });

  it('should return empty array when response has no departments', async () => {
    useOkapiKy.mockReturnValue({
      get: jest.fn(() => ({
        json: () => Promise.resolve({}),
      })),
    });

    const { result } = renderHook(() => useDepartmentsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.departments).toEqual([]);
  });
});
