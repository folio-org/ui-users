import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import affiliations from '../../../test/jest/fixtures/affiliations';
import consortia from '../../../test/jest/fixtures/consortia';
import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
} from '../../constants';
import useUserAffiliationsMutation from './useUserAffiliationsMutation';
import { getResponseErrors } from '../../components/UserDetailSections/UserAffiliations/util';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useOkapiKy: jest.fn(),
  useStripes: jest.fn(),
}));

jest.mock('../../components/UserDetailSections/UserAffiliations/util', () => ({
  getResponseErrors: jest.fn(() => []),
}));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const userId = 'userId';
const consortium = {
  ...consortia[0],
  centralTenantId: 'mobius',
};

describe('useUserAffiliationsMutation', () => {
  const postMock = jest.fn(() => ({ json: () => Promise.resolve() }));
  const deleteMock = jest.fn(() => ({ json: () => Promise.resolve() }));
  const setHeaderMock = jest.fn();
  const kyMock = {
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        post: postMock,
        delete: deleteMock,
      };
    }),
  };

  beforeEach(() => {
    deleteMock.mockClear();
    postMock.mockClear();
    useOkapiKy.mockClear().mockReturnValue(kyMock);
    useStripes.mockClear().mockReturnValue({
      user: {
        user: { consortium },
      }
    });
  });

  it('should send POST request to add user-affiliation record', async () => {
    const { result } = renderHook(() => useUserAffiliationsMutation(), { wrapper });

    const json = {
      tenantId: affiliations[0].tenantId,
      userId,
    };

    await result.current.assignAffiliation(json);

    expect(postMock).toHaveBeenCalledWith(
      `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
      expect.objectContaining({ json }),
    );
  });

  it('should send DELETE request to delete user-affiliation record', async () => {
    const { result } = renderHook(() => useUserAffiliationsMutation(), { wrapper });

    const searchParams = {
      tenantId: affiliations[0].tenantId,
      userId,
    };

    await result.current.unassignAffiliation(searchParams);

    expect(deleteMock).toHaveBeenCalledWith(
      `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
      expect.objectContaining({ searchParams }),
    );
  });

  it('should handle user\'s affiliation assignment updates', async () => {
    const { result } = renderHook(() => useUserAffiliationsMutation(), { wrapper });

    const payload = {
      added: affiliations.slice(0, 3).map(({ tenantId }) => ({ tenantId, userId })),
      removed: affiliations.slice(3, 5).map(({ tenantId }) => ({ tenantId, userId })),
    };

    const { success, errors } = await result.current.handleAssignment(payload);

    expect(postMock).toHaveBeenCalledTimes(3);
    expect(deleteMock).toHaveBeenCalledTimes(2);
    expect(success).toBe(true);
    expect(errors).toEqual([]);
  });

  it('should return errors on update', async () => {
    getResponseErrors.mockClear().mockReturnValue([{
      'message': 'User with id [0c50701e-45ff-4a2e-bff0-11bd5610378d] has primary affiliation with tenant [mobius]. Primary Affiliation cannot be deleted',
      'type': '-1',
      'code': 'HAS_PRIMARY_AFFILIATION_ERROR'
    },
    {
      'message': 'Some error message',
      'type': '-1',
      'code': 'GENERIC_ERROR'
    },
    {
      'message': 'Some error message',
      'type': '-1',
      'code': 'GENERIC_ERROR'
    }]);
    const { result } = renderHook(() => useUserAffiliationsMutation(), { wrapper });

    const payload = {
      added: affiliations.slice(0, 3).map(({ tenantId }) => ({ tenantId, userId })),
      removed: affiliations.slice(3, 5).map(({ tenantId }) => ({ tenantId, userId })),
    };

    const { success, errors } = await result.current.handleAssignment(payload);

    expect(success).toBe(false);
    expect(errors.length).toBe(2); // 1 error is filtered out due to uniqueness
  });
});
