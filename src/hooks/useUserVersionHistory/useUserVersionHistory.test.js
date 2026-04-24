import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import useUsersQuery from '../useUsersQuery';
import useUserVersionHistory from './useUserVersionHistory';
import {
  getChangedFieldsList,
  formatVersions,
} from './userVersionHistoryUtils';

jest.mock('../useUsersQuery', () => jest.fn(() => ({ users: [], isFetched: true })));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const auditData = [
  {
    eventId: 'evt-1',
    performedBy: 'user-performer-1',
    eventDate: '2024-01-01T00:00:00Z',
    eventTs: 1000,
    action: 'CREATED',
    diff: null,
  },
  {
    eventId: 'evt-2',
    performedBy: 'user-performer-1',
    eventDate: '2024-01-02T00:00:00Z',
    eventTs: 2000,
    action: 'UPDATED',
    diff: {
      fieldChanges: [
        {
          fieldName: 'username',
          changeType: 'MODIFIED',
          newValue: 'newUser',
          oldValue: 'oldUser',
        },
      ],
    },
  },
];

describe('getChangedFieldsList', () => {
  it('should return empty array when no changes', () => {
    expect(getChangedFieldsList({})).toEqual([]);
  });

  it('should process fieldChanges', () => {
    const diff = {
      fieldChanges: [{
        fieldName: 'username',
        changeType: 'MODIFIED',
        newValue: 'newUser',
        oldValue: 'oldUser',
      }],
    };

    expect(getChangedFieldsList(diff)).toEqual([{
      fieldName: 'username',
      changeType: 'MODIFIED',
      newValue: 'newUser',
      oldValue: 'oldUser',
    }]);
  });

  it('should process collectionChanges', () => {
    const diff = {
      collectionChanges: [{
        collectionName: 'departments',
        itemChanges: [{
          changeType: 'ADDED',
          newValue: 'dept-1',
          oldValue: null,
        }],
      }],
    };

    expect(getChangedFieldsList(diff)).toEqual([{
      fieldName: 'departments',
      changeType: 'ADDED',
      newValue: 'dept-1',
      oldValue: null,
    }]);
  });

  it('should merge and sort by changeType', () => {
    const diff = {
      fieldChanges: [{
        fieldName: 'username',
        changeType: 'MODIFIED',
        newValue: 'new',
        oldValue: 'old',
      }],
      collectionChanges: [{
        collectionName: 'departments',
        itemChanges: [{
          changeType: 'ADDED',
          newValue: 'dept-1',
          oldValue: null,
        }],
      }],
    };

    const result = getChangedFieldsList(diff);

    expect(result).toHaveLength(2);
    expect(result[0].changeType).toBe('ADDED');
    expect(result[1].changeType).toBe('MODIFIED');
  });

  it('should exclude metadata fields', () => {
    const diff = {
      fieldChanges: [
        { fieldName: 'username', changeType: 'MODIFIED', newValue: 'new', oldValue: 'old' },
        { fieldName: 'updatedDate', changeType: 'MODIFIED', newValue: '2024-01-02', oldValue: '2024-01-01' },
        { fieldName: 'createdDate', changeType: 'ADDED', newValue: '2024-01-01', oldValue: null },
        { fieldName: 'createdByUserId', changeType: 'ADDED', newValue: 'user-1', oldValue: null },
        { fieldName: 'updatedByUserId', changeType: 'MODIFIED', newValue: 'user-2', oldValue: 'user-1' },
        { fieldName: 'metadata.createdDate', changeType: 'ADDED', newValue: '2024-01-01', oldValue: null },
        { fieldName: 'metadata.updatedDate', changeType: 'MODIFIED', newValue: '2024-01-02', oldValue: '2024-01-01' },
        { fieldName: 'metadata.createdByUserId', changeType: 'ADDED', newValue: 'user-1', oldValue: null },
        { fieldName: 'metadata.updatedByUserId', changeType: 'MODIFIED', newValue: 'user-2', oldValue: 'user-1' },
      ],
    };

    const result = getChangedFieldsList(diff);

    expect(result).toHaveLength(1);
    expect(result[0].fieldName).toBe('username');
  });

  it('should return empty array for null input', () => {
    expect(getChangedFieldsList(null)).toEqual([]);
  });

  it('should return empty array for undefined input', () => {
    expect(getChangedFieldsList(undefined)).toEqual([]);
  });
});

describe('formatVersions', () => {
  const baseContext = {
    usersMap: {},
    isUsersLoaded: true,
    formatMessage: jest.fn(({ id }) => id),
    formatDate: jest.fn(() => '1/1/2024'),
  };

  it('should format audit data entries', () => {
    const result = formatVersions(auditData, baseContext);

    expect(result).toHaveLength(2);
    expect(result[0].isOriginal).toBe(true);
    expect(result[1].isOriginal).toBe(false);
  });

  it('should preserve performedByUserId while the users lookup is pending', () => {
    const result = formatVersions(auditData, { ...baseContext, isUsersLoaded: false });

    expect(result[0].performedByUserId).toBe('user-performer-1');
    expect(result[0].userName).toBeNull();
  });
});

describe('useUserVersionHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();

    useUsersQuery.mockReturnValue({ users: [], isFetched: true });
  });

  it('should return versions mapped from audit data', () => {
    const { result } = renderHook(
      () => useUserVersionHistory(auditData),
      { wrapper },
    );

    expect(result.current.versions).toHaveLength(2);
    expect(result.current.versions[0].isOriginal).toBe(true);
    expect(result.current.versions[0].eventId).toBe('evt-1');
    expect(result.current.versions[1].isOriginal).toBe(false);
    expect(result.current.versions[1].fieldChanges).toHaveLength(1);
  });

  it('should show anonymized label when performedBy is null', () => {
    const dataWithAnonymous = [{
      eventId: 'evt-3',
      performedBy: null,
      eventDate: '2024-01-03T00:00:00Z',
      eventTs: 3000,
      action: 'UPDATED',
      diff: {
        fieldChanges: [
          {
            fieldName: 'username',
            changeType: 'MODIFIED',
            newValue: 'newUser',
            oldValue: 'oldUser',
          },
        ],
      },
    }];

    const { result } = renderHook(
      () => useUserVersionHistory(dataWithAnonymous),
      { wrapper },
    );

    expect(result.current.versions[0].userName).toBe('ui-users.versionHistory.anonymousUser');
  });

  it('should return empty versions when data is undefined', () => {
    const { result } = renderHook(
      () => useUserVersionHistory(undefined),
      { wrapper },
    );

    expect(result.current.versions).toEqual([]);
  });

  it('should resolve performer name when matching user is fetched', async () => {
    useUsersQuery.mockReturnValue({
      users: [{
        id: 'user-performer-1',
        personal: { lastName: 'Smith', firstName: 'John' },
      }],
      isFetched: true,
    });

    const { result } = renderHook(
      () => useUserVersionHistory(auditData),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.versions[0].userName).toBe('Smith, John');
    });
  });

  it('should mark the performer as deleted when no matching user is fetched', () => {
    useUsersQuery.mockReturnValue({ users: [], isFetched: true });

    const { result } = renderHook(
      () => useUserVersionHistory(auditData),
      { wrapper },
    );

    expect(result.current.versions[0].userName).toBeNull();
    expect(result.current.versions[0].performedByUserId).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should report loading and keep performedByUserId while the users lookup is pending', () => {
    useUsersQuery.mockReturnValue({ users: [], isFetched: false });

    const { result } = renderHook(
      () => useUserVersionHistory(auditData),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.versions[0].performedByUserId).toBe('user-performer-1');
  });

  it('should not report loading when there are no performers to look up', () => {
    useUsersQuery.mockReturnValue({ users: [], isFetched: false });

    const dataWithoutPerformers = [{
      eventId: 'evt-3',
      performedBy: null,
      eventDate: '2024-01-03T00:00:00Z',
      eventTs: 3000,
      action: 'CREATED',
      diff: null,
    }];

    const { result } = renderHook(
      () => useUserVersionHistory(dataWithoutPerformers),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
  });
});

