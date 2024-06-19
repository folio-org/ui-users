import { FormattedMessage } from 'react-intl';

/* eslint-disable import/prefer-default-export */
export const preferredEmailCommunicationOptions = [
  {
    label: (<FormattedMessage id="ui-users.contact.preferredEmailCommunication.programs" />),
    value: 'Programs'
  },
  {
    label: (<FormattedMessage id="ui-users.contact.preferredEmailCommunication.services" />),
    value: 'Service'
  },
  {
    label: (<FormattedMessage id="ui-users.contact.preferredEmailCommunication.support" />),
    value: 'Support'
  },
];
