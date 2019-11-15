import {
  interactor,
  scoped,
  collection,
} from '@bigtest/interactor';

import PermissionsModal from './permissions-modal';

@interactor class PermissionSetForm {
  addPermissionButton = scoped('#clickable-add-permission');
  permissionsModal = new PermissionsModal();
  permissions = collection('[data-permission-name]');

  whenLoaded() {
    return this.when(() => this.isLoaded);
  }
}

export default new PermissionSetForm({
  scope: '#form-permission-set',
  timeout: 5000,
});
