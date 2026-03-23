export const RETENTION_MODES = {
  NEVER: 'never',
  INDEFINITELY: 'indefinitely',
  DURATION: 'duration',
};

export const DURATION_UNITS = [
  { value: 'days', labelId: 'ui-users.settings.versionHistory.duration.unit.days' },
  { value: 'weeks', labelId: 'ui-users.settings.versionHistory.duration.unit.weeks' },
  { value: 'months', labelId: 'ui-users.settings.versionHistory.duration.unit.months' },
  { value: 'years', labelId: 'ui-users.settings.versionHistory.duration.unit.years' },
];

export const UNIT_TO_DAYS = {
  days: 1,
  weeks: 7,
  months: 30,
  years: 365,
};

export const USER_FIELDS = [
  // User information
  { value: 'username', labelId: 'ui-users.information.username' },
  { value: 'barcode', labelId: 'ui-users.information.barcode' },
  { value: 'active', labelId: 'ui-users.information.status' },
  { value: 'type', labelId: 'ui-users.information.userType' },
  { value: 'patronGroup', labelId: 'ui-users.information.patronGroup' },
  { value: 'expirationDate', labelId: 'ui-users.expirationDate' },
  { value: 'externalSystemId', labelId: 'ui-users.extended.externalSystemId' },
  // Personal information
  { value: 'personal.lastName', labelId: 'ui-users.information.lastName' },
  { value: 'personal.firstName', labelId: 'ui-users.information.firstName' },
  { value: 'personal.middleName', labelId: 'ui-users.information.middleName' },
  { value: 'personal.preferredFirstName', labelId: 'ui-users.information.preferredName' },
  { value: 'personal.pronouns', labelId: 'ui-users.information.pronouns' },
  { value: 'personal.dateOfBirth', labelId: 'ui-users.extended.birthDate' },
  { value: 'personal.profilePictureLink', labelId: 'ui-users.information.profilePicture' },
  // Contact information
  { value: 'personal.email', labelId: 'ui-users.contact.email' },
  { value: 'personal.phone', labelId: 'ui-users.contact.phone' },
  { value: 'personal.mobilePhone', labelId: 'ui-users.contact.mobilePhone' },
  { value: 'personal.preferredContactTypeId', labelId: 'ui-users.contact.preferredContact' },
  { value: 'personal.addresses', labelId: 'ui-users.contact.addresses' },
  // Extended information
  { value: 'enrollmentDate', labelId: 'ui-users.extended.dateEnrolled' },
  { value: 'departments', labelId: 'ui-users.versionHistory.field.departments' },
  { value: 'tags', labelId: 'ui-users.versionHistory.field.tags' },
  { value: 'proxyFor', labelId: 'ui-users.versionHistory.field.proxyFor' },
];

export const SETTING_KEYS = {
  ENABLED: 'enabled',
  RETENTION_PERIOD: 'records.retention.period',
  ANONYMIZE: 'anonymize',
  EXCLUDED_FIELDS: 'excluded.fields',
};
