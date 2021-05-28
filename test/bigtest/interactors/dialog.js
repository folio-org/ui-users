import {
  interactor,
  Interactor,
  property,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

@interactor class DialogInteractor {
  openRequestsNumber = new Interactor('[class*=modalContent---] a');
  additionalInfoTextArea = new Interactor('[data-test-additional-info-textarea]');
  confirmButton = new ButtonInteractor('[data-test-dialog-confirm-button]');
  cancelButton = new ButtonInteractor('[data-test-dialog-cancel-button]');
  isConfirmButtonDisabled = property('[data-test-dialog-confirm-button]', 'disabled');
}

export default DialogInteractor;
