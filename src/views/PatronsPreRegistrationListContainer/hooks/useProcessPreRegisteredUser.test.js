import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { useHistory } from 'react-router-dom';
import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy, useCallout } from '@folio/stripes/core';
import preRegistrationRecords from 'fixtures/preRegistrationRecords';

import { PATRON_PREREGISTRATIONS_API } from '../../../constants';
import useProcessPreRegisteredUser from './useProcessPreRegisteredUser';

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
}));
jest.mock('@folio/stripes/core', () => ({
  useOkapiKy: jest.fn(),
  useCallout: jest.fn(),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const stagingUser = preRegistrationRecords[0];
const putPath = `${PATRON_PREREGISTRATIONS_API}/${stagingUser.id}/mergeOrCreateUser`;

describe('useProcessPreRegisteredUser', () => {
  let kyMock;
  let mockHistoryPush;
  const sendCallout = jest.fn();

  beforeEach(() => {
    kyMock = {
      put: jest.fn().mockReturnValue({
        json: jest.fn().mockResolvedValue({ userId: '1234' }),
      }),
      post: jest.fn(),
    };
    useOkapiKy.mockReturnValue(kyMock);
    mockHistoryPush = jest.fn();
    useHistory.mockReturnValue({ push: mockHistoryPush });
    sendCallout.mockClear();
    useCallout.mockClear().mockReturnValue({ sendCallout });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call create user', async () => {
    const { result } = renderHook(() => useProcessPreRegisteredUser(), { wrapper });
    await result.current.handlePreRegisteredUser(stagingUser);

    expect(kyMock.put).toHaveBeenCalledWith(putPath);
  });

  it('should create permission user after creating user record', async () => {
    const { result } = renderHook(() => useProcessPreRegisteredUser(), { wrapper });
    await result.current.handlePreRegisteredUser(stagingUser);

    expect(kyMock.put).toHaveBeenCalledWith(putPath);
    expect(kyMock.post).toHaveBeenCalled();
  });

  it('should display success callout on creating a new FOLIO user from staging user', async () => {
    const { result } = renderHook(() => useProcessPreRegisteredUser(), { wrapper });
    await result.current.handlePreRegisteredUser(stagingUser);

    expect(kyMock.put).toHaveBeenCalledWith(putPath);
    expect(kyMock.post).toHaveBeenCalled();
    expect(sendCallout).toHaveBeenCalled();
  });

  it('should route to new created user detail page', async () => {
    const { result } = renderHook(() => useProcessPreRegisteredUser(), { wrapper });
    await result.current.handlePreRegisteredUser(stagingUser);

    expect(kyMock.put).toHaveBeenCalledWith(putPath);
    expect(kyMock.post).toHaveBeenCalled();
    expect(mockHistoryPush).toHaveBeenCalled();
  });

  it('should display error callout', async () => {
    kyMock = {
      put: jest.fn().mockReturnValue({
        json: jest.fn().mockRejectedValueOnce(new Error('error'))
      }),
      post: jest.fn(),
    };
    useOkapiKy.mockReturnValue(kyMock);
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useProcessPreRegisteredUser(), { wrapper });
    await result.current.handlePreRegisteredUser(stagingUser);

    await waitFor(() => {
      expect(sendCallout).toHaveBeenCalled();
      expect(consoleErrorMock).toHaveBeenCalled();
    });
  });
});
