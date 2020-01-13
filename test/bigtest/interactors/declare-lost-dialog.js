import {
  interactor,
  Interactor,
  property
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

@interactor class DeclareLostDialog {
  static defaultScope = '#declare-lost-modal';

  additionalInfoTextArea = new Interactor('[data-test-declare-lost-additional-info-textarea]');
  confirmButton = new ButtonInteractor('[data-test-declare-lost-dialog-confirm-button]');
  cancelButton = new ButtonInteractor('[data-test-declare-lost-dialog-cancel-button]');
  isConfirmButtonDisabled = property('[data-test-declare-lost-dialog-confirm-button]', 'disabled');
}

export default DeclareLostDialog;
