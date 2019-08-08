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
}

@interactor class Permission {
  checkBox = scoped('[data-test-select-item] input');
  name = scoped('[data-test-permission-name]');
  status = scoped('[data-test-permission-status]');
}

@interactor class PermissionsList {
  static defaultScope = '[data-test-permissions-list]';

  permissions = collection('[class^="mclRow--"]', Permission);
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
