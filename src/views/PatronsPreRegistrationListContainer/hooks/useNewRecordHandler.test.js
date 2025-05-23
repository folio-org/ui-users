import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

import {
  act,
  renderHook,
} from '@folio/jest-config-stripes/testing-library/react';

import useNewRecordHandler from './useNewRecordHandler';
import useUserDuplicatesCheck from './useUserDuplicatesCheck';
import useProcessPreRegisteredUser from './useProcessPreRegisteredUser';

jest.mock('react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
  useLocation: jest.fn(() => ({ search: '' })),
}));

jest.mock('./useUserDuplicatesCheck', () => jest.fn());
jest.mock('./useProcessPreRegisteredUser', () => jest.fn());

describe('useNewRecordHandler', () => {
  let mockHistoryPush;
  let mockCheckDuplicates;
  let mockHandlePreRegisteredUser;

  beforeEach(() => {
    mockHistoryPush = jest.fn();
    mockCheckDuplicates = jest.fn();
    mockHandlePreRegisteredUser = jest.fn();

    useHistory.mockReturnValue({ push: mockHistoryPush });
    useUserDuplicatesCheck.mockReturnValue({ checkDuplicates: mockCheckDuplicates });
    useProcessPreRegisteredUser.mockReturnValue({ handlePreRegisteredUser: mockHandlePreRegisteredUser });

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
      await result.current.handle({
        id: 'userId',
        contactInfo: { email: 'test@example.com' },
      });
    });

    expect(mockHistoryPush).toHaveBeenCalledWith({
      pathname: '/users/pre-registration-records/duplicates/userId',
      state: { search: '' },
    });
  });

  it('should create new user record when duplicates are not found', async () => {
    mockCheckDuplicates.mockResolvedValue(false);
    const { result } = renderHook(() => useNewRecordHandler());

    await act(async () => {
      await result.current.handle({ contactInfo: { email: 'test@example.com' } });
    });

    expect(mockHandlePreRegisteredUser).toHaveBeenCalled();
  });
});
