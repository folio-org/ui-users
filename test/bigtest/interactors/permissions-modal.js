import {
  interactor,
  scoped,
  collection, property,
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

@interactor class Permission {
  checkBox = scoped('[data-test-select-item] input');
  assigned = property('[data-test-select-item] input', 'checked');
  name = scoped('[data-test-permission-name]');
  status = scoped('[data-test-permission-status]');
}

@interactor class PermissionsList {
  static defaultScope = '[data-test-permissions-list]';

  permissions = collection('[class^="mclRow--"]', Permission);
  selectAllPermissions = scoped('[data-test-select-all-permissions] input');
  sortByStatusButton = scoped('#clickable-list-column-status')
}

@interactor class PermissionsModal {
  static defaultScope = '#permissions-modal';

  modalHeader = scoped('[class^="modalHeader--"]');
  saveButton = scoped('[data-test-permissions-modal-save]');
  cancelButton = scoped('[data-test-permissions-modal-cancel]');
  permissionsList = new PermissionsList();
  searchForm = new SearchForm();
}

export default PermissionsModal;
