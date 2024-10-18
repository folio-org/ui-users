import { FormattedMessage } from 'react-intl';

export const VISIBLE_COLUMNS = ['fullName', 'groupName'];
export const MAX_RECORDS = 1000;

export const COLUMN_MAPPING = {
  fullName: <FormattedMessage id="ui-users.permissions.assignedUsers.name" />,
  groupName: <FormattedMessage id="ui-users.permissions.assignedUsers.patronGroup" />,
};

export const COLUMN_WIDTH = {
  fullName: '50%',
  groupName: '50%',
};

export const PERMISSIONS_API = 'perms/users';

export const CHUNK_SIZE = 25;
