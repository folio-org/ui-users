import { memo } from 'react';
import PropTypes from 'prop-types';

import {
  Accordion,
  FilterAccordionHeader,
} from '@folio/stripes/components';
import {
  MultiSelectionFilter,
  CheckboxFilter,
} from '@folio/stripes/smart-components';

// Map custom field types to specific filters
const customFieldTypeToFilterMap = {
  MULTI_SELECT_DROPDOWN: MultiSelectionFilter,
  RADIO_BUTTON: CheckboxFilter,
  SINGLE_SELECT_DROPDOWN: MultiSelectionFilter,
  SINGLE_CHECKBOX: CheckboxFilter,
};

const CustomFieldsFilter = ({
  customField,
  clearGroup,
  onChange,
  activeFilters,
}) => {
  const FilterComponent = customFieldTypeToFilterMap[customField.type];

  if (!FilterComponent) {
    return null;
  }

  const {
    refId,
    name,
    selectField,
  } = customField;


  const values = selectField?.options?.values ?? [{ id: 'true', value: name }];
  const filterName = `customFields-${refId}`;
  const selectedValues = activeFilters[filterName];
  const dataOptions = values.map(({ id: value, value: label }) => ({ label, value }));

  return (
    <Accordion
      displayClearButton
      id={`users-filter-accordion-custom-field-${refId}`}
      header={FilterAccordionHeader}
      label={name}
      separator={false}
      onClearFilter={() => clearGroup(filterName)}
    >
      <FilterComponent
        dataOptions={dataOptions}
        name={filterName}
        selectedValues={selectedValues}
        onChange={onChange}
        aria-labelledby={`users-filter-accordion-custom-field-${refId}`}
      />
    </Accordion>
  );
};

CustomFieldsFilter.propTypes = {
  customField: PropTypes.shape({}),
  clearGroup: PropTypes.func,
  onChange: PropTypes.func,
  activeFilters: PropTypes.shape({}),
};

export default memo(CustomFieldsFilter);
