import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import CustomFieldsFilter from './CustomFieldsFilter';
import {
  MODULE_NAME,
  CUSTOM_FIELDS_ENTITY_TYPE,
} from '../../constants';

const CustomFieldsFilters = props => {
  const { customFields } = useCustomFieldsQuery({
    moduleName: MODULE_NAME,
    entityType: CUSTOM_FIELDS_ENTITY_TYPE,
  });

  if (!customFields) return null;

  return customFields.map(customField => (
    <CustomFieldsFilter
      key={`custom-field-${customField.id}`}
      customField={customField}
      {...props}
    />));
};

export default CustomFieldsFilters;
