import { FormattedMessage } from 'react-intl';

const types = [
  { value: '002', name: 'email', label: <FormattedMessage id="ui-users.data.contactTypes.email" /> },
  { value: '001', name: 'mail', label: <FormattedMessage id="ui-users.data.contactTypes.mail" /> },
  { value: '003', name: 'sms', label: <FormattedMessage id="ui-users.data.contactTypes.textMessage" /> },
];

export const contactTypesMap = types.reduce((acc, type) => {
  acc[type.name] = type;
  return acc;
}, {});
export default types;
