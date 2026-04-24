import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { NoValue } from '@folio/stripes/components';
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import useDepartmentsQuery from '../../../../hooks/useDepartmentsQuery';
import usePatronGroups from '../../../../hooks/usePatronGroups';
import contactTypes from '../../../../components/data/static/contactTypes';
import {
  AUDIT_CHANGE_TYPE,
  CUSTOM_FIELDS_ENTITY_TYPE,
  MODULE_NAME,
} from '../../../../constants';
import { renderDateTime } from '../../../../utils';

const toBool = value => value === true || value === 'true';
const valueOrNoValue = value => value || <NoValue />;

const buildChangeTypeLabels = formatMessage => ({
  [AUDIT_CHANGE_TYPE.ADDED]: formatMessage({ id: 'ui-users.versionHistory.action.added' }),
  [AUDIT_CHANGE_TYPE.MODIFIED]: formatMessage({ id: 'ui-users.versionHistory.action.edited' }),
  [AUDIT_CHANGE_TYPE.REMOVED]: formatMessage({ id: 'ui-users.versionHistory.action.removed' }),
});

const buildFieldLabelsMap = (formatMessage, customFields) => ({
  username: formatMessage({ id: 'ui-users.information.username' }),
  barcode: formatMessage({ id: 'ui-users.information.barcode' }),
  active: formatMessage({ id: 'ui-users.information.status' }),
  type: formatMessage({ id: 'ui-users.information.userType' }),
  patronGroup: formatMessage({ id: 'ui-users.information.patronGroup' }),
  expirationDate: formatMessage({ id: 'ui-users.expirationDate' }),
  externalSystemId: formatMessage({ id: 'ui-users.extended.externalSystemId' }),
  lastName: formatMessage({ id: 'ui-users.information.lastName' }),
  firstName: formatMessage({ id: 'ui-users.information.firstName' }),
  middleName: formatMessage({ id: 'ui-users.information.middleName' }),
  preferredFirstName: formatMessage({ id: 'ui-users.information.preferredName' }),
  pronouns: formatMessage({ id: 'ui-users.information.pronouns' }),
  email: formatMessage({ id: 'ui-users.contact.email' }),
  phone: formatMessage({ id: 'ui-users.contact.phone' }),
  mobilePhone: formatMessage({ id: 'ui-users.contact.mobilePhone' }),
  dateOfBirth: formatMessage({ id: 'ui-users.extended.birthDate' }),
  preferredContactTypeId: formatMessage({ id: 'ui-users.contact.preferredContact' }),
  addresses: formatMessage({ id: 'ui-users.contact.addresses' }),
  enrollmentDate: formatMessage({ id: 'ui-users.extended.dateEnrolled' }),
  departments: formatMessage({ id: 'ui-users.versionHistory.field.departments' }),
  profilePictureLink: formatMessage({ id: 'ui-users.information.profilePicture' }),
  tags: formatMessage({ id: 'ui-users.versionHistory.field.tags' }),
  proxyFor: formatMessage({ id: 'ui-users.versionHistory.field.proxyFor' }),
  ...Object.fromEntries((customFields || []).map(cf => [cf.refId, cf.name])),
});

const buildCustomFieldFormatters = (customFields, formatMessage) => {
  if (!customFields?.length) return {};

  return customFields.reduce((acc, cf) => {
    const optionValues = cf.selectField?.options?.values;

    if (optionValues) {
      const optionsMap = Object.fromEntries(optionValues.map(opt => [opt.id, opt.value]));

      acc[cf.refId] = value => {
        if (!value) return <NoValue />;
        return optionsMap[value] || value;
      };
    } else if (cf.type === 'SINGLE_CHECKBOX') {
      acc[cf.refId] = value => {
        if (value == null) return <NoValue />;
        return toBool(value)
          ? formatMessage({ id: 'ui-users.yes' })
          : formatMessage({ id: 'ui-users.no' });
      };
    } else if (cf.type === 'DATE_PICKER') {
      acc[cf.refId] = renderDateTime;
    }

    return acc;
  }, {});
};

const useUserVersionHistoryFormatters = (tenantId) => {
  const { formatMessage } = useIntl();

  const { patronGroups } = usePatronGroups({ tenantId });
  const { departments } = useDepartmentsQuery(tenantId);

  const { customFields } = useCustomFieldsQuery({
    moduleName: MODULE_NAME,
    entityType: CUSTOM_FIELDS_ENTITY_TYPE,
  });

  const actionsMap = useMemo(() => buildChangeTypeLabels(formatMessage), [formatMessage]);

  const patronGroupsMap = useMemo(
    () => Object.fromEntries(patronGroups.map(group => [group.id, group.group])),
    [patronGroups],
  );

  const departmentsMap = useMemo(
    () => Object.fromEntries(departments.map(dept => [dept.id, dept.name])),
    [departments],
  );

  const contactTypesMap = useMemo(
    () => Object.fromEntries(contactTypes.map(type => [type.id, formatMessage({ id: type.desc })])),
    [formatMessage],
  );

  const fieldLabelsMap = useMemo(
    () => buildFieldLabelsMap(formatMessage, customFields),
    [formatMessage, customFields],
  );

  const customFieldFormatters = useMemo(
    () => buildCustomFieldFormatters(customFields, formatMessage),
    [customFields, formatMessage],
  );

  const fieldFormatter = useMemo(() => ({
    active: value => (toBool(value)
      ? formatMessage({ id: 'ui-users.active' })
      : formatMessage({ id: 'ui-users.inactive' })),
    patronGroup: value => patronGroupsMap[value] || value,
    preferredContactTypeId: value => contactTypesMap[value] || value,
    expirationDate: renderDateTime,
    dateOfBirth: renderDateTime,
    enrollmentDate: renderDateTime,
    departments: value => departmentsMap[value] || value,
    type: valueOrNoValue,
    pronouns: valueOrNoValue,
    profilePictureLink: valueOrNoValue,
    ...customFieldFormatters,
  }), [formatMessage, patronGroupsMap, contactTypesMap, departmentsMap, customFieldFormatters]);

  const itemFormatter = useMemo(
    () => ({ name, value }) => {
      if (value == null || value === '') return null;

      const label = fieldLabelsMap[name] || name;

      return `${label}: ${value}`;
    },
    [fieldLabelsMap],
  );

  return {
    actionsMap,
    fieldLabelsMap,
    fieldFormatter,
    itemFormatter,
  };
};

export default useUserVersionHistoryFormatters;
