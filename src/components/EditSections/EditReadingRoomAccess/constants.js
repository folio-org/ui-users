import { FormattedMessage } from 'react-intl';

export const rraColumns = {
  ACCESS: 'access',
  READING_ROOM_NAME: 'readingRoomName',
  NOTES: 'notes',
};

export const DEFAULT_SORT_ORDER = rraColumns.READING_ROOM_NAME;

export const READING_ROOM_ACCESS_OPTIONS = [
  {
    label: (<FormattedMessage id="ui-users.readingRoom.allowed" />),
    value: 'ALLOWED'
  },
  {
    label: (<FormattedMessage id="ui-users.readingRoom.notAllowed" />),
    value: 'NOT_ALLOWED'
  }
];
