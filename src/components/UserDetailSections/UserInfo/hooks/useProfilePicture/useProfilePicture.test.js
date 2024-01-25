import profilePicture from 'fixtures/profilePicture';
import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

import useProfilePicture from './useProfilePicture';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: jest.fn(() => ['test']),
  useOkapiKy: jest.fn(),
}));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useProfilePicture', () => {
  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue({
      get: () => ({ json: () => Promise.resolve(profilePicture) }),
    });
  });

  it('should return null', async () => {
    const { result } = renderHook(() => useProfilePicture({
      profilePictureId: undefined,
    }), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(result.current).toEqual(expect.objectContaining({
      'isFetching': false,
      'isLoading': false,
      'profilePictureData': undefined,
    }));
  });

  it('should return profile picture data', async () => {
    const { result } = renderHook(() => useProfilePicture({
      profilePictureId: profilePicture.id,
    }, {}), { wrapper });

    await waitFor(() => expect(result.current.isFetching).toBeFalsy());

    expect(result.current).toEqual(expect.objectContaining({
      'isFetching': false,
      'isLoading': false,
      'profilePictureData': profilePicture.profile_picture_blob
    }));
  });
});
