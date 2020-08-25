import {
  interactor,
  scoped,
  collection,
} from '@bigtest/interactor';

import PermissionsModal from './permissions-modal';

@interactor class PermissionSetForm {
  static defaultScope = '#form-permission-set';

  addPermissionButton = scoped('#clickable-add-permission');
  permissionsModal = new PermissionsModal();
  permissions = collection('[data-permission-name]');

  whenLoaded() {
    return this.when(() => this.isLoaded);
  }
}

export default new PermissionSetForm();
