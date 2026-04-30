import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { AuditLogPane } from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import useUserAuditDataQuery from '../../../../hooks/useUserAuditDataQuery';
import useUserVersionHistory from '../../../../hooks/useUserVersionHistory';
import useUserVersionHistoryFormatters from './useUserVersionHistoryFormatters';

const renderSource = (version, canViewUser) => {
  if (!version.userName) return null;
  if (!version.performedByUserId || !canViewUser) return version.userName;

  return <Link to={`/users/preview/${version.performedByUserId}`}>{version.userName}</Link>;
};

const UserVersionHistory = ({ userId, onClose }) => {
  const stripes = useStripes();
  const canViewUser = stripes.hasPerm('users.item.get');

  const {
    data,
    totalRecords,
    isLoading: isAuditLoading,
    isLoadingMore,
    fetchNextPage,
    hasNextPage,
  } = useUserAuditDataQuery(userId);

  const { versions, isLoading: isUsersLookupLoading } = useUserVersionHistory(data);
  const isInitialLoading = isAuditLoading || isUsersLookupLoading;

  const versionsWithSource = useMemo(
    () => versions.map(version => ({ ...version, source: renderSource(version, canViewUser) })),
    [versions, canViewUser],
  );

  const {
    actionsMap,
    fieldLabelsMap,
    fieldFormatter,
    itemFormatter,
  } = useUserVersionHistoryFormatters();

  return (
    <AuditLogPane
      versions={versionsWithSource}
      onClose={onClose}
      isLoadMoreVisible={hasNextPage}
      handleLoadMore={fetchNextPage}
      isLoading={isLoadingMore}
      isInitialLoading={isInitialLoading}
      fieldLabelsMap={fieldLabelsMap}
      fieldFormatter={fieldFormatter}
      actionsMap={actionsMap}
      totalVersions={totalRecords}
      itemFormatter={itemFormatter}
    />
  );
};

UserVersionHistory.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserVersionHistory;
