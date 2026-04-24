import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import useUserAuditDataQuery from './useUserAuditDataQuery';
import { getNextPageParam } from './userAuditDataQueryUtils';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const userAuditItems = [
  {
    eventId: 'evt-1',
    userId: 'user-1',
    eventTs: 1000,
    eventDate: '2024-01-01T00:00:00Z',
    action: 'CREATE',
    diff: null,
  },
];

describe('useUserAuditDataQuery', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve({ userAuditItems, totalRecords: 1 }),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();

    useOkapiKy.mockReturnValue({
      get: mockGet,
    });
  });

  it('should fetch user audit data', async () => {
    const { result } = renderHook(
      () => useUserAuditDataQuery('test-user-id'),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith('audit-data/user/test-user-id', expect.objectContaining({
      searchParams: {},
    }));
    expect(result.current.data).toEqual(userAuditItems);
    expect(result.current.totalRecords).toBe(1);
  });

  it('should not fetch when userId is not provided', () => {
    const { result } = renderHook(
      () => useUserAuditDataQuery(null),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should pass tenantId to useOkapiKy', () => {
    renderHook(
      () => useUserAuditDataQuery('test-user-id', 'central-tenant'),
      { wrapper },
    );

    expect(useOkapiKy).toHaveBeenCalledWith({ tenant: 'central-tenant' });
  });
});

describe('getNextPageParam', () => {
  it('should return undefined when all items have been fetched', () => {
    const lastPage = { totalRecords: 2, userAuditItems: [{ eventId: 'b', eventTs: 200 }] };
    const allPages = [
      { totalRecords: 2, userAuditItems: [{ eventId: 'a', eventTs: 100 }] },
      lastPage,
    ];

    expect(getNextPageParam(lastPage, allPages)).toBeUndefined();
  });

  it('should return the last item eventTs as cursor when more pages exist', () => {
    const lastPage = { totalRecords: 10, userAuditItems: [{ eventId: 'a', eventTs: 500 }, { eventId: 'b', eventTs: 400 }] };
    const allPages = [lastPage];

    expect(getNextPageParam(lastPage, allPages)).toBe(400);
  });

  it('should return undefined when lastPage has no items', () => {
    const lastPage = { totalRecords: 10, userAuditItems: [] };
    const allPages = [lastPage];

    expect(getNextPageParam(lastPage, allPages)).toBeUndefined();
  });

  it('should return undefined when cursor does not advance (same last eventId)', () => {
    const page1 = { totalRecords: 10, userAuditItems: [{ eventId: 'a', eventTs: 100 }, { eventId: 'b', eventTs: 100 }] };
    const page2 = { totalRecords: 10, userAuditItems: [{ eventId: 'b', eventTs: 100 }, { eventId: 'b', eventTs: 100 }] };
    const allPages = [page1, page2];

    expect(getNextPageParam(page2, allPages)).toBeUndefined();
  });

  it('should handle totalRecords of 0 correctly with ?? operator', () => {
    const lastPage = { totalRecords: 0, userAuditItems: [] };
    const allPages = [lastPage];

    expect(getNextPageParam(lastPage, allPages)).toBeUndefined();
  });

  it('should handle null/undefined lastPage gracefully', () => {
    expect(getNextPageParam(null, [null])).toBeUndefined();
    expect(getNextPageParam(undefined, [undefined])).toBeUndefined();
  });
});
