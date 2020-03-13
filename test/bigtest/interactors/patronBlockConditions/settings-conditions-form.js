import {
  interactor,
  isPresent,
  text,
  scoped,
  property
} from '@bigtest/interactor';

import CheckboxInteractor from '@folio/stripes-components/lib/Checkbox/tests/interactor';

@interactor class SettingsConditionsForm {
  form = isPresent('[data-test-conditions-form]');
  formHeader = text('[class*=paneTitleLabel]');
  blockBorrowing = property('[data-test-block-borrowing]', 'checked');
  blockRenewals = property('[data-test-block-renewals]', 'checked');
  blockRequests = property('[data-test-block-requests]', 'checked');
  message = scoped('[data-test-block-message]', CheckboxInteractor);
}

export default new SettingsConditionsForm('[class*=conditionsWrapper]');
