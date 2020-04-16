import {
  interactor,
  Interactor,
  property
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

@interactor class MarkAsMissingDialog {
  static defaultScope = '#mark-as-missing-modal';

  additionalInfoTextArea = new Interactor('[data-test-mark-as-missing-additional-info-textarea]');
  confirmButton = new ButtonInteractor('[data-test-mark-as-missing-dialog-confirm-button]');
  cancelButton = new ButtonInteractor('[data-test-mark-as-missing-dialog-cancel-button]');
  isConfirmButtonDisabled = property('[data-test-mark-as-missing-dialog-confirm-button]', 'disabled');
}

export default MarkAsMissingDialog;
