import { FormattedMessage } from 'react-intl';

export const COLUMNS_NAME = {
  ACTION: 'ACTION',
  FIRST_NAME: 'generalInfo.firstName',
  LAST_NAME: 'generalInfo.lastName',
  MIDDLE_NAME: 'generalInfo.middleName',
  PREFERRED_FIRST_NAME: 'generalInfo.preferredFirstName',
  EMAIL: 'contactInfo.email',
  PHONE_NUMBER: 'contactInfo.phone',
  MOBILE_NUMBER: 'contactInfo.mobilePhone',
  ADDRESS: 'addressInfo.addressLine0',
  EMAIL_COMMUNICATION_PREFERENCES: 'preferredEmailCommunication',
  SUBMISSION_DATE: 'metadata.updatedDate', // 'submissionDate',
  EMAIL_VERIFICATION: 'isEmailVerified',
  MINOR: 'minor',
};

export const visibleColumns = [
  COLUMNS_NAME.ACTION,
  COLUMNS_NAME.FIRST_NAME,
  COLUMNS_NAME.LAST_NAME,
  COLUMNS_NAME.MIDDLE_NAME,
  COLUMNS_NAME.PREFERRED_FIRST_NAME,
  COLUMNS_NAME.EMAIL,
  COLUMNS_NAME.PHONE_NUMBER,
  COLUMNS_NAME.MOBILE_NUMBER,
  COLUMNS_NAME.ADDRESS,
  COLUMNS_NAME.EMAIL_COMMUNICATION_PREFERENCES,
  COLUMNS_NAME.SUBMISSION_DATE,
  COLUMNS_NAME.EMAIL_VERIFICATION,
  COLUMNS_NAME.MINOR,
];

export const columnMapping = {
  [COLUMNS_NAME.ACTION]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.action" />,
  [COLUMNS_NAME.FIRST_NAME]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.firstName" />,
  [COLUMNS_NAME.LAST_NAME]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.lastName" />,
  [COLUMNS_NAME.MIDDLE_NAME]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.middleName" />,
  [COLUMNS_NAME.PREFERRED_FIRST_NAME]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.preferredFirstName" />,
  [COLUMNS_NAME.EMAIL]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.email" />,
  [COLUMNS_NAME.PHONE_NUMBER]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.phoneNumber" />,
  [COLUMNS_NAME.MOBILE_NUMBER]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.mobileNumber" />,
  [COLUMNS_NAME.ADDRESS]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.address" />,
  [COLUMNS_NAME.EMAIL_COMMUNICATION_PREFERENCES]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.emailCommunicationPreferences" />,
  [COLUMNS_NAME.SUBMISSION_DATE]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.submissionDate" />,
  [COLUMNS_NAME.EMAIL_VERIFICATION]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.emailVerification" />,
  [COLUMNS_NAME.MINOR]: <FormattedMessage id="ui-users.stagingRecords.list.columnNames.minor" />,
};
