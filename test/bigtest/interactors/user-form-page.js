import {
  interactor,
  clickable,
  text,
  isPresent,
  fillable,
  blurrable,
  triggerable,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

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
  usernameField = new InputFieldInteractor('#adduser_username');
  feedbackError = text('[class^="feedbackError---"]');
  cancelButton = new ButtonInteractor('[data-test-user-form-cancel-button]');
  submitButton = new ButtonInteractor('[data-test-user-form-submit-button]');
}

export default new UserFormPage('[data-test-form-page]');
