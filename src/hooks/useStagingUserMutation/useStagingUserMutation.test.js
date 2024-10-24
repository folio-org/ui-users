import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import useStagingUserMutation from './useStagingUserMutation';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useOkapiKy: jest.fn(),
  useStripes: jest.fn(),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useStagingUserMutation', () => {
  const kyMock = {
    put: jest.fn(() => ({ json: () => Promise.resolve({ userId: 'userId' }) })),
  };

  beforeEach(() => {
    useOkapiKy.mockReturnValue(kyMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send PUT request to merge staging user with existing one', async () => {
    const { result } = renderHook(() => useStagingUserMutation(), { wrapper });

    const { userId } = await result.current.mergeOrCreateUser({ stagingUserId: 'stagingUserId', userId: 'existingUserId' });

    expect(kyMock.put).toHaveBeenCalled();
    expect(userId).toBe('userId');
  });
});
