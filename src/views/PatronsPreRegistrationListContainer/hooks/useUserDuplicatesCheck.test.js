import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import {
  USER_TYPES,
  USERS_API,
} from '../../../constants';
import useUserDuplicatesCheck from './useUserDuplicatesCheck';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useUserDuplicatesCheck', () => {
  let kyMock;

  beforeEach(() => {
    kyMock = {
      get: jest.fn().mockReturnValue({
        json: jest.fn().mockResolvedValue({ totalRecords: 0 }),
      }),
    };
    useOkapiKy.mockReturnValue(kyMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return false if email is not provided', async () => {
    const { result } = renderHook(() => useUserDuplicatesCheck(), { wrapper });
    const isDuplicate = await result.current.checkDuplicates({});

    expect(isDuplicate).toBe(false);
  });

  it('should return false if no duplicates are found', async () => {
    const email = 'test@example.com';

    const { result } = renderHook(() => useUserDuplicatesCheck(), { wrapper });
    const isDuplicate = await result.current.checkDuplicates({ contactInfo: { email } });

    expect(kyMock.get).toHaveBeenCalledWith(USERS_API, {
      searchParams: {
        query: `personal.email=="${email}" and type=="${USER_TYPES.PATRON}"`,
        limit: 1,
      },
    });
    expect(isDuplicate).toBe(false);
  });

  it('should return true if duplicates are found', async () => {
    const email = 'test@example.com';

    kyMock.get.mockReturnValueOnce({
      json: jest.fn().mockResolvedValue({ totalRecords: 2 }),
    });

    const { result } = renderHook(() => useUserDuplicatesCheck(), { wrapper });
    const isDuplicate = await result.current.checkDuplicates({ contactInfo: { email } });

    expect(kyMock.get).toHaveBeenCalledWith(USERS_API, {
      searchParams: {
        query: `personal.email=="${email}" and type=="${USER_TYPES.PATRON}"`,
        limit: 1,
      },
    });
    expect(isDuplicate).toBe(true);
  });
});
