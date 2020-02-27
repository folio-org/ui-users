import {
  interactor,
  Interactor,
  property
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

@interactor class ClaimReturnedDialog {
  static defaultScope = '#claim-returned-modal';

  additionalInfoTextArea = new Interactor('[data-test-claim-returned-additional-info-textarea]');
  confirmButton = new ButtonInteractor('[data-test-claim-returned-dialog-confirm-button]');
  cancelButton = new ButtonInteractor('[data-test-claim-returned-dialog-cancel-button]');
  isConfirmButtonDisabled = property('[data-test-claim-returned-dialog-confirm-button]', 'disabled');
}

export default ClaimReturnedDialog;
