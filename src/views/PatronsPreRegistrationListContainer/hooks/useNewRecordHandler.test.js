import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

import {
  act,
  renderHook,
} from '@folio/jest-config-stripes/testing-library/react';

import useNewRecordHandler from './useNewRecordHandler';
import useUserDuplicatesCheck from './useUserDuplicatesCheck';
import useCreateNewUser from './useCreateNewUser';

jest.mock('react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
}));

jest.mock('./useUserDuplicatesCheck', () => jest.fn());
jest.mock('./useCreateNewUser', () => jest.fn());

describe('useNewRecordHandler', () => {
  let mockHistoryPush;
  let mockCheckDuplicates;
  let mockCreateUser;

  beforeEach(() => {
    mockHistoryPush = jest.fn();
    mockCheckDuplicates = jest.fn();
    mockCreateUser = jest.fn();

    useHistory.mockReturnValue({ push: mockHistoryPush });
    useUserDuplicatesCheck.mockReturnValue({ checkDuplicates: mockCheckDuplicates });
    useCreateNewUser.mockReturnValue({ createUser: mockCreateUser });

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
    });
  });

  it('should create new user record when duplicates are not found', async () => {
    mockCheckDuplicates.mockResolvedValue(false);
    const { result } = renderHook(() => useNewRecordHandler());

    await act(async () => {
      await result.current.handle({ contactInfo: { email: 'test@example.com' } });
    });

    expect(mockCreateUser).toHaveBeenCalled();
  });
});
