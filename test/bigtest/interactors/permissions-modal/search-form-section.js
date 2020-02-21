import {
  interactor,
  scoped,
  property,
} from '@bigtest/interactor';

@interactor class SearchForm {
  searchField = scoped('[data-test-search-field]');
  submitButton = scoped('[data-test-submit-button]');
  resetAllButton = scoped('[data-test-reset-all-button]');

  assignedCheckbox = scoped('#clickable-filter-status-assigned');
  assignedCheckboxChecked = property('#clickable-filter-status-assigned', 'checked');
  unassignedCheckbox = scoped('#clickable-filter-status-unassigned');
  unassignedCheckboxChecked = property('#clickable-filter-status-unassigned', 'checked');
  permissionSetsCheckbox = scoped('#clickable-filter-permission-type-permission-sets');
  permissionSetsCheckboxChecked = property('#clickable-filter-permission-type-permission-sets', 'checked');
  permissionsCheckbox = scoped('#clickable-filter-permission-type-permissions');
  permissionsCheckboxChecked = property('#clickable-filter-permission-type-permissions', 'checked');
}

export default SearchForm;
