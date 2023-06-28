import { useCustomFields } from '@folio/stripes/smart-components';

import CustomFieldsFilter from './CustomFieldsFilter';

const CustomFieldsFilters = props => {
  const [customFields] = useCustomFields('users', 'user');

  if (!customFields) return null;

  return customFields.map(customField => (
    <CustomFieldsFilter
      key={`custom-field-${customField.id}`}
      customField={customField}
      {...props}
    />));
};

export default CustomFieldsFilters;
