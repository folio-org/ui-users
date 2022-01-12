import useCustomFields from './useCustomFilters';
import CustomFieldsFilter from './CustomFieldsFilter';

const CustomFieldsFilters = props => {
  const customFields = useCustomFields();

  if (!customFields) return null;

  return customFields.map(customField => (
    <CustomFieldsFilter
      key={`custom-field-${customField.id}`}
      customField={customField}
      {...props}
    />));
};

export default CustomFieldsFilters;
