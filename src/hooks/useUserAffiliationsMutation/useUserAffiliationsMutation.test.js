import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import { useOkapiKy } from '@folio/stripes/core';

import affiliations from '../../../test/jest/fixtures/affiliations';
import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
} from '../../constants';
import useUserAffiliationsMutation from './useUserAffiliationsMutation';

jest.mock('../useConsortium', () => jest.fn(() => ({
  consortium: { id: 'id', name: 'MOBIUS' },
  isLoading: false,
})));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const userId = 'userId';

describe('useUserAffiliationsMutation', () => {
  const kyMock = {
    post: jest.fn(() => ({ json: () => Promise.resolve() })),
    delete: jest.fn(() => ({ json: () => Promise.resolve() })),
  };

  beforeEach(() => {
    kyMock.delete.mockClear();
    kyMock.post.mockClear();
    useOkapiKy.mockClear().mockReturnValue(kyMock);
  });

  it('should send POST request to add user-affiliation record', async () => {
    const { result } = renderHook(() => useUserAffiliationsMutation(), { wrapper });

    const json = {
      tenantId: affiliations[0].tenantId,
      userId,
    };

    await result.current.assignAffiliation(json);

    expect(kyMock.post).toHaveBeenCalledWith(
      `${CONSORTIA_API}/id/${CONSORTIA_USER_TENANTS_API}`,
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

    expect(kyMock.delete).toHaveBeenCalledWith(
      `${CONSORTIA_API}/id/${CONSORTIA_USER_TENANTS_API}`,
      expect.objectContaining({ searchParams }),
    );
  });

  it('should handle user\'s affiliation assignment updates', async () => {
    const { result } = renderHook(() => useUserAffiliationsMutation(), { wrapper });

    const payload = {
      added: affiliations.slice(0, 3).map(({ tenantId }) => ({ tenantId, userId })),
      removed: affiliations.slice(3, 5).map(({ tenantId }) => ({ tenantId, userId })),
    };

    await result.current.handleAssignment(payload);

    expect(kyMock.post).toHaveBeenCalledTimes(3);
    expect(kyMock.delete).toHaveBeenCalledTimes(2);
  });
});