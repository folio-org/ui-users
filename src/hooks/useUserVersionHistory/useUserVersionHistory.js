import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  keyBy,
  uniq,
} from 'lodash';

import { useChunkedCQLFetch } from '@folio/stripes/core';

import { USERS_API } from '../../constants';
import { formatVersions } from './userVersionHistoryUtils';

export const chunkedUsersReducer = (list) => (
  list.reduce((acc, cur) => [...acc, ...(cur?.data?.users ?? [])], [])
);

const useUserVersionHistory = (data) => {
  const { formatMessage, formatDate } = useIntl();

  const userIds = useMemo(
    () => (data?.length ? uniq(data.map(entry => entry.performedBy).filter(Boolean)) : []),
    [data],
  );

  const { items: users, isLoading: isUsersLookupLoading } = useChunkedCQLFetch({
    endpoint: USERS_API,
    ids: userIds,
    reduceFunction: chunkedUsersReducer,
  });

  const usersMap = useMemo(() => keyBy(users, 'id'), [users]);
  const isUsersLoaded = userIds.length === 0 || !isUsersLookupLoading;

  const versions = useMemo(
    () => (data ? formatVersions(data, { usersMap, isUsersLoaded, formatMessage, formatDate }) : []),
    [data, usersMap, isUsersLoaded, formatMessage, formatDate],
  );

  return {
    versions,
    isLoading: !isUsersLoaded,
  };
};

export default useUserVersionHistory;
