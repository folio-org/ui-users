import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  keyBy,
  uniq,
} from 'lodash';

import { buildQueryByIds } from '../../utils';
import useUsersQuery from '../useUsersQuery';
import { formatVersions } from './userVersionHistoryUtils';

const useUserVersionHistory = (data, { tenantId } = {}) => {
  const { formatMessage, formatDate } = useIntl();

  const userIds = useMemo(
    () => data?.length ? uniq(data.map(entry => entry.performedBy).filter(Boolean)) : [],
    [data],
  );

  const { users, isFetched } = useUsersQuery(
    { query: userIds.length ? buildQueryByIds(userIds) : undefined },
    { enabled: Boolean(userIds.length), tenantId, keepPreviousData: true },
  );

  const usersMap = useMemo(() => keyBy(users, 'id'), [users]);
  const isUsersLoaded = userIds.length === 0 || isFetched;

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
