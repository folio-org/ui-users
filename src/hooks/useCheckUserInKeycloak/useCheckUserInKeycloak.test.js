import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { KEYCLOAK_USER_EXISTENCE } from '../../constants';
import useCheckUserInKeycloak from './useCheckUserInKeycloak';

describe('useCheckUserInKeycloak', () => {
  const userId = 'test-user-id';
  const tenantId = 'test-tenant';
  let mockGet;
  let mockExtend;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const setupMocks = (getMock) => {
    mockGet = getMock;
    mockExtend = jest.fn(() => ({ get: mockGet }));
    useOkapiKy.mockReturnValue({ extend: mockExtend });
  };

  it('should return "exist" when keycloak user exists', async () => {
    setupMocks(jest.fn(() => Promise.resolve()));

    const { result } = renderHook(() => useCheckUserInKeycloak(userId));
    let status;

    await act(async () => {
      status = await result.current.checkUserInKeycloakForTenant(tenantId);
    });

    expect(status).toBe(KEYCLOAK_USER_EXISTENCE.exist);
    expect(mockExtend).toHaveBeenCalledWith({
      hooks: {
        beforeRequest: [expect.any(Function)],
      },
    });
    expect(mockGet).toHaveBeenCalledWith(`users-keycloak/auth-users/${userId}`);
  });

  it('should return nonExist when keycloak user is not found (404)', async () => {
    setupMocks(jest.fn().mockRejectedValue({ response: { status: 404 } }));

    const { result } = renderHook(() => useCheckUserInKeycloak(userId));
    let status;

    await act(async () => {
      status = await result.current.checkUserInKeycloakForTenant(tenantId);
    });

    expect(status).toBe(KEYCLOAK_USER_EXISTENCE.nonExist);
  });

  it('should return "error" and call handleError for non-404 errors', async () => {
    const error = { response: { status: 500 } };
    setupMocks(jest.fn().mockRejectedValue(error));
    const handleError = jest.fn();

    const { result } = renderHook(() => useCheckUserInKeycloak(userId, handleError));
    let status;

    await act(async () => {
      status = await result.current.checkUserInKeycloakForTenant(tenantId);
    });

    expect(status).toBe(KEYCLOAK_USER_EXISTENCE.error);
    expect(handleError).toHaveBeenCalledWith(error);
  });

  it('should return "error" without crashing when handleError is not provided', async () => {
    const error = { response: { status: 500 } };
    setupMocks(jest.fn().mockRejectedValue(error));

    const { result } = renderHook(() => useCheckUserInKeycloak(userId));
    let status;

    await act(async () => {
      status = await result.current.checkUserInKeycloakForTenant(tenantId);
    });

    expect(status).toBe(KEYCLOAK_USER_EXISTENCE.error);
  });

  it('should set X-Okapi-Tenant header for the target tenant', async () => {
    setupMocks(jest.fn().mockResolvedValue());

    const { result } = renderHook(() => useCheckUserInKeycloak(userId));

    await act(async () => {
      await result.current.checkUserInKeycloakForTenant(tenantId);
    });

    const extendArg = mockExtend.mock.calls[0][0];
    const beforeRequestHook = extendArg.hooks.beforeRequest[0];
    const mockReq = { headers: { set: jest.fn() } };
    beforeRequestHook(mockReq);

    expect(mockReq.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', tenantId);
  });
});
