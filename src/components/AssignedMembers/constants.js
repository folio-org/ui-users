import { FormattedMessage } from 'react-intl';

export const VISIBLE_COLUMNS = ['fullName', 'patronGroup'];

export const COLUMN_MAPPING = {
  fullName: <FormattedMessage id="ui-acquisition-units.unit.membership.name" />,
  patronGroup: <FormattedMessage id="ui-acquisition-units.unit.membership.patronGroup" />,
};

export const COLUMN_WIDTH = {
  fullName: '50%',
  patronGroup: '50%',
};

export const USERS_API = 'users';
export const GROUPS_API = 'groups';
export const PERMISSIONS_API = 'perms/users';
