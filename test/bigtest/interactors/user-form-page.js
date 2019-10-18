import {
  interactor,
  clickable,
  text,
  isPresent,
  fillable,
  blurrable,
  triggerable,
  scoped,
  collection,
  selectable,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import PermissionsModal from './permissions-modal';

@interactor class InputFieldInteractor {
  clickInput = clickable();
  fillInput = fillable();
  blurInput = blurrable();

  pressEnter = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
    key: 'Enter',
  });

  fillAndBlur(val) {
    return this
      .clickInput()
      .fillInput(val)
      .pressEnter()
      .blurInput();
  }
}

@interactor class UserFormPage {
  isLoaded = isPresent('[class*=paneTitleLabel---]');

  whenLoaded() {
    return this.when(() => this.isLoaded).timeout(3000);
  }

  title = text('[class*=paneTitleLabel---]');
  barcodeField = new InputFieldInteractor('#adduser_barcode');
  lastNameField = new InputFieldInteractor('#adduser_lastname');
  usernameField = new InputFieldInteractor('#adduser_username');
  passwordField = new InputFieldInteractor('#pw');
  emailField = new InputFieldInteractor('#adduser_email');
  selectPatronGroup = selectable('#adduser_group');
  feedbackError = text('[class^="feedbackError---"]');
  cancelButton = new ButtonInteractor('[data-test-user-form-cancel-button]');
  submitButton = new ButtonInteractor('[data-test-user-form-submit-button]');
  togglePermissionAccordionButton = scoped('#accordion-toggle-button-permissions');
  addPermissionButton = scoped('#clickable-add-permission');
  permissionsModal = new PermissionsModal();
  permissions = collection('[data-permission-name]');
}

export default new UserFormPage('form[data-test-form-page]');
