/* Developed collaboratively using AI (GitHub Copilot) */

import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import {
  MAX_RECORDS,
  USERS_API,
} from '../../constants';
import useUsersQuery from './useUsersQuery';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useUsersQuery', () => {
  const mockKy = {
    get: jest.fn(() => ({
      json: jest.fn(() => Promise.resolve({
        users: [{ id: '1', name: 'Test User' }],
        totalRecords: 1,
      })),
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useOkapiKy.mockReturnValue(mockKy);
  });

  it('should fetch users with default parameters', async () => {
    const { result } = renderHook(() => useUsersQuery(), { wrapper });

    await waitFor(() => expect(result.current.isFetching).toBeFalsy());

    expect(mockKy.get).toHaveBeenCalledWith(USERS_API, expect.objectContaining({
      searchParams: {
        query: 'cql.allRecords=1',
        limit: MAX_RECORDS,
        offset: 0,
      },
    }));

    expect(result.current.users).toEqual([{ id: '1', name: 'Test User' }]);
    expect(result.current.totalRecords).toBe(1);
  });

  it('should fetch users with custom parameters', async () => {
    const params = {
      limit: 10,
      offset: 5,
      query: 'username="test"',
    };
    const { result } = renderHook(() => useUsersQuery(params), { wrapper });

    await waitFor(() => expect(result.current.isFetching).toBeFalsy());

    expect(mockKy.get).toHaveBeenCalledWith(USERS_API, expect.objectContaining({
      searchParams: {
        query: 'username="test"',
        limit: 10,
        offset: 5,
      },
    }));

    expect(result.current.users).toEqual([{ id: '1', name: 'Test User' }]);
    expect(result.current.totalRecords).toBe(1);
  });
});
