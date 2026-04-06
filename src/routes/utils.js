import {
  parseFilters,
} from '@folio/stripes/smart-components';

/**
 * Extracts patron group UUIDs from a comma-separated Stripes filter string.
 * Patron group filter entries have the format "pg.<uuid>".
 */
export function extractPatronGroupIds(filters) {
  if (!filters) return [];
  return filters.split(',')
    .filter(f => f.startsWith('pg.'))
    .map(f => f.slice(3));
}

/**
 * Returns a filters string with all patron group entries removed.
 * Returns undefined when no entries remain so callers can detect "no filter".
 */
export function stripPatronGroupFilters(filters) {
  if (!filters) return undefined;
  const remaining = filters.split(',').filter(f => !f.startsWith('pg.')).join(',');
  return remaining || undefined;
}

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
