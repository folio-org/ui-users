import { sortBy } from 'lodash';

import { getFullName } from '../../components/util';
import { AUDIT_ACTION } from '../../constants';
import { formatDateTime } from '../../utils/formatDateTime';

const EXCLUDED_METADATA_FIELDS = new Set([
  'createdDate',
  'updatedDate',
  'createdByUserId',
  'updatedByUserId',
  'metadata.createdDate',
  'metadata.updatedDate',
  'metadata.createdByUserId',
  'metadata.updatedByUserId',
]);

export const getChangedFieldsList = diff => {
  if (!diff) return [];

  const fieldChanges = (diff.fieldChanges ?? [])
    .filter(field => !EXCLUDED_METADATA_FIELDS.has(field.fieldName))
    .map(({ fieldName, changeType, newValue, oldValue }) => ({
      fieldName, changeType, newValue, oldValue,
    }));

  const collectionChanges = (diff.collectionChanges ?? []).flatMap(collection =>
    (collection.itemChanges ?? []).map(field => ({
      fieldName: collection.collectionName,
      changeType: field.changeType,
      newValue: field.newValue,
      oldValue: field.oldValue,
    }))
  );

  return sortBy([...fieldChanges, ...collectionChanges], change => change.changeType);
};

export const formatVersions = (diffArray, { usersMap, isUsersLoaded, formatMessage, formatDate }) => {
  const anonymousUserLabel = formatMessage({ id: 'ui-users.versionHistory.anonymousUser' });

  const getUserName = (userId) => {
    const user = usersMap[userId];

    return getFullName(user) || null;
  };

  return diffArray
    .map(({ action, eventDate, eventTs, performedBy, eventId, diff }) => {
      const resolvedName = getUserName(performedBy);
      const isDeletedUser = isUsersLoaded && performedBy && !resolvedName;

      return {
        isOriginal: action === AUDIT_ACTION.CREATED,
        eventDate: formatDateTime(eventDate, formatDate),
        performedByUserId: isDeletedUser ? null : performedBy,
        userName: resolvedName || (performedBy ? null : anonymousUserLabel),
        fieldChanges: diff ? getChangedFieldsList(diff) : [],
        eventId,
        eventTs,
      };
    })
    // Exclude DELETED events (the record is gone on deletion) and UPDATED events
    // that changed only internal metadata fields (no user-visible change occurred).
    .filter(entry => entry.isOriginal || entry.fieldChanges.length > 0);
};
