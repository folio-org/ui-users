import {
  interactor,
  isPresent,
  text,
  property,
  clickable,
} from '@bigtest/interactor';

import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor';

@interactor class SettingsConditionsForm {
  form = isPresent('[data-test-conditions-form]');
  formHeader = text('[class*=paneTitleLabel]');
  blockBorrowing = property('[data-test-block-borrowing]', 'checked');
  blockRenewals = property('[data-test-block-renewals]', 'checked');
  blockRequests = property('[data-test-block-requests]', 'checked');
  blockRequestsClick = clickable('[data-test-block-requests]');
  message = property('[data-test-block-message]', 'value');
  saveButton = isPresent('[data-test-charged-out-conditions-save-button]');
  saveButtonClick = clickable('[data-test-charged-out-conditions-save-button]');
  isSaveButtonDisabled = property('[data-test-charged-out-conditions-save-button]', 'disabled');
  calloutMessage = new CalloutInteractor();
}

export default new SettingsConditionsForm('[data-test-conditions-wrapper]');
