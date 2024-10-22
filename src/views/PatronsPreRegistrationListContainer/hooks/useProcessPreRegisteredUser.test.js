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
    expect(sendCallout).toHaveBeenCalled();
    expect(mockHistoryPush).toHaveBeenCalledWith({ 'pathname': '/users/view/1234' });
  });

  describe('when create user fails', () => {
    let consoleErrorMock;
    beforeEach(() => {
      kyMock = {
        put: jest.fn().mockReturnValue({
          json: jest.fn().mockRejectedValueOnce(new Error('error'))
        }),
        post: jest.fn(),
      };
      useOkapiKy.mockReturnValue(kyMock);
      consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should display error callout', async () => {
      const { result } = renderHook(() => useProcessPreRegisteredUser(), { wrapper });
      await result.current.handlePreRegisteredUser(stagingUser);

      await waitFor(() => {
        expect(sendCallout).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
        expect(consoleErrorMock).toHaveBeenCalled();
      });
    });

    it('should not re-route to user detail view', async () => {
      const { result } = renderHook(() => useProcessPreRegisteredUser(), { wrapper });
      await result.current.handlePreRegisteredUser(stagingUser);

      await waitFor(() => {
        expect(sendCallout).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
        expect(consoleErrorMock).toHaveBeenCalled();
        expect(mockHistoryPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('when create permission user fails', () => {
    let consoleErrorMock;
    beforeEach(() => {
      kyMock = {
        post: jest.fn().mockReturnValue({
          json: jest.fn().mockRejectedValueOnce(new Error('error'))
        }),
        put: jest.fn().mockReturnValue({
          json: jest.fn().mockResolvedValue({ userId: '1234' }),
        }),
      };
      useOkapiKy.mockReturnValue(kyMock);
      consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should display error callout', async () => {
      const { result } = renderHook(() => useProcessPreRegisteredUser(), { wrapper });
      await result.current.handlePreRegisteredUser(stagingUser);

      await waitFor(() => {
        expect(sendCallout).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
        expect(consoleErrorMock).toHaveBeenCalled();
      });
    });

    it('should re-route to user detail view', async () => {
      const { result } = renderHook(() => useProcessPreRegisteredUser(), { wrapper });
      await result.current.handlePreRegisteredUser(stagingUser);

      await waitFor(() => {
        expect(sendCallout).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
        expect(consoleErrorMock).toHaveBeenCalled();
        expect(mockHistoryPush).toHaveBeenCalled();
      });
    });
  });
});
