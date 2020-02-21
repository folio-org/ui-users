import {
  interactor,
  scoped,
} from '@bigtest/interactor';

import SearchForm from './search-form-section';
import PermissionsList from './permissions-list-section';

@interactor class PermissionsModal {
  static defaultScope = '#permissions-modal';

  modalHeader = scoped('[class^="modalHeader--"]');
  saveButton = scoped('[data-test-permissions-modal-save]');
  cancelButton = scoped('[data-test-permissions-modal-cancel]');
  permissionsList = new PermissionsList();
  searchForm = new SearchForm();
}

export default PermissionsModal;
