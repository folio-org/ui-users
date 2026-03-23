import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import useAuditSettingsQuery from './useAuditSettingsQuery';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useAuditSettingsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should return settings when query succeeds', async () => {
    const mockSettings = [{ key: 'enabled', value: true }];

    useOkapiKy.mockReturnValue({
      get: jest.fn(() => ({
        json: () => Promise.resolve({ settings: mockSettings }),
      })),
    });

    const { result } = renderHook(() => useAuditSettingsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.settings).toEqual(mockSettings);
    expect(result.current.isError).toBe(false);
  });

  it('should return empty settings array when query fails', async () => {
    useOkapiKy.mockReturnValue({
      get: jest.fn(() => ({
        json: () => Promise.reject(new Error('Not found')),
      })),
    });

    const { result } = renderHook(() => useAuditSettingsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.settings).toEqual([]);
    expect(result.current.isError).toBe(true);
  });

  it('should return empty settings array when response has no settings', async () => {
    useOkapiKy.mockReturnValue({
      get: jest.fn(() => ({
        json: () => Promise.resolve({}),
      })),
    });

    const { result } = renderHook(() => useAuditSettingsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.settings).toEqual([]);
  });
});
