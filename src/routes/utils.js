import {
  parseFilters,
} from '@folio/stripes/smart-components';

// Generates a filter config in a dynamic fashion for currently
// registerd custom fields.
// This function loops through all currently applied filters
// and it looks for filters which contain 'customFields` name.
// It then generates a custom config for each of them
// replacing the name "customFields-fieldName"
// with "customFields.fieldName" for CQL representation.
export function buildFilterConfig(filters) {
  const customFilterConfig = [];
  const parsedFilters = parseFilters(filters);

  Object.keys(parsedFilters).forEach(name => {
    if (name.match('customFields')) {
      customFilterConfig.push(
        {
          name,
          cql: name.split('-').join('.'),
          values: [],
          operator: '=',
        },
      );
    }
  });

  return customFilterConfig;
}
