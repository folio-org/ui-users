export const AFFILIATIONS_COLUMN_NAMES = {
  selected: 'selected',
  name: 'name',
  status: 'status',
};

export const AFFILIATIONS_VISIBLE_COLUMNS = [
  AFFILIATIONS_COLUMN_NAMES.selected,
  AFFILIATIONS_COLUMN_NAMES.name,
  AFFILIATIONS_COLUMN_NAMES.status,
];

export const AFFILIATIONS_COLUMN_WIDTHS = {
  [AFFILIATIONS_COLUMN_NAMES.selected]: '35px',
  [AFFILIATIONS_COLUMN_NAMES.name]: '50%',
};

export const SEARCH_FIELD_NAME = 'query';

export const AFFILIATIONS_FILTERS_ACTION_TYPES = {
  clearAll: 'clearAll',
  clearFilter: 'clearFilter',
  updateFilters: 'updateFilters',
};
