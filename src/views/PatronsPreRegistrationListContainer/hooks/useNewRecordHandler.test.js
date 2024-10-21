import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

import {
  act,
  renderHook,
} from '@folio/jest-config-stripes/testing-library/react';

import useNewRecordHandler from './useNewRecordHandler';
import useUserDuplicatesCheck from './useUserDuplicatesCheck';

jest.mock('react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
  useLocation: jest.fn(() => ({ search: '' })),
}));

jest.mock('./useUserDuplicatesCheck', () => jest.fn());

describe('useNewRecordHandler', () => {
  let mockHistoryPush;
  let mockCheckDuplicates;

  beforeEach(() => {
    mockHistoryPush = jest.fn();
    mockCheckDuplicates = jest.fn();

    useHistory.mockReturnValue({ push: mockHistoryPush });
    useUserDuplicatesCheck.mockReturnValue({ checkDuplicates: mockCheckDuplicates });

    useMutation.mockImplementation(({ mutationFn, onSuccess }) => ({
      mutateAsync: async (user) => {
        const hasDuplicates = await mutationFn(user);
        onSuccess(hasDuplicates, user);
      },
      isLoading: false,
    }));
  });

  it('should redirect to duplicates page if duplicates are found', async () => {
    mockCheckDuplicates.mockResolvedValue(true);
    const { result } = renderHook(() => useNewRecordHandler());

    await act(async () => {
      await result.current.handle({ contactInfo: { email: 'test@example.com' } });
    });

    expect(mockHistoryPush).toHaveBeenCalledWith({
      pathname: '/users/pre-registration-records/duplicates',
      search: '?email=test@example.com',
      state: { search: '' },
    });
  });
});
