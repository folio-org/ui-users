import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { AuditLogPane } from '@folio/stripes/components';

import useUserAuditDataQuery from '../../../../hooks/useUserAuditDataQuery';
import useUserVersionHistory from '../../../../hooks/useUserVersionHistory';
import useUserVersionHistoryFormatters from './useUserVersionHistoryFormatters';

const renderSource = (version) => {
  if (!version.userName) return null;
  if (!version.performedByUserId) return version.userName;

  return <Link to={`/users/preview/${version.performedByUserId}`}>{version.userName}</Link>;
};

const UserVersionHistory = ({ userId, onClose }) => {
  const {
    data,
    isLoading: isAuditLoading,
    isLoadingMore,
    fetchNextPage,
    hasNextPage,
  } = useUserAuditDataQuery(userId);

  const { versions, isLoading: isUsersLookupLoading } = useUserVersionHistory(data);
  const isInitialLoading = isAuditLoading || isUsersLookupLoading;

  const versionsWithSource = useMemo(
    () => versions.map(version => ({ ...version, source: renderSource(version) })),
    [versions],
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
      totalVersions={versionsWithSource.length}
      itemFormatter={itemFormatter}
    />
  );
};

UserVersionHistory.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserVersionHistory;
