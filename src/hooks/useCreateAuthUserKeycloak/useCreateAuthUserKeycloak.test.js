import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { renderHook, act, cleanup } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import useCreateAuthUserKeycloak from './useCreateAuthUserKeycloak';

const queryClient = new QueryClient();

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useOkapiKy: jest.fn(),
  useStripes: jest.fn(() => ({
    logger: { log: jest.fn() }
  })),
}));


const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useCreateRoleMutation', () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  it('should make post request with provided capabilities list ids', async () => {
    const postMock = jest.fn().mockReturnValue({ json: () => Promise.resolve({}) });

    useOkapiKy.mockClear().mockReturnValue({
      post: postMock,
    });

    const { result } = renderHook(
      () => useCreateAuthUserKeycloak(() => {
      }, { tenantId: 1 }),
      { wrapper },
    );

    await act(async () => {
      result.current.mutateAsync(':userId');
    });

    expect(postMock).toHaveBeenCalledWith('users-keycloak/auth-users/:userId');
  });
});
