import {
  interactor,
  scoped,
  collection,
} from '@bigtest/interactor';

import Permission from './permission-section';

@interactor class PermissionsList {
  static defaultScope = '[data-test-permissions-list]';

  permissions = collection('[class^="mclRow--"]', Permission);
  selectAllPermissions = scoped('[data-test-select-all-permissions] input');
  sortByStatusButton = scoped('#clickable-list-column-status');
  sortByTypeButton = scoped('#clickable-list-column-type');
}

export default PermissionsList;
