import {
  interactor,
  scoped,
  ButtonInteractor,
  property
} from '@bigtest/interactor';

import KeyValue from './KeyValue';

@interactor class LoanActionsHistory {
  static defaultScope = '[data-test-loan-actions-history]';

  requests = scoped('[data-test-loan-actions-history-requests] div', KeyValue);
  lostDate = scoped('[data-test-loan-actions-history-lost] div', KeyValue);
  itemStatus = scoped('[data-test-loan-actions-history-item-status] div', KeyValue);
  feeFines = scoped('[data-test-loan-fees-fines] [data-test-kv-value]', KeyValue);
  closeButton = scoped('button[icon=times]', ButtonInteractor);
  declareLostButton = scoped('[data-test-declare-lost-button]', ButtonInteractor);
  isDeclareLostButtonDisabled = property('[data-test-declare-lost-button]', 'disabled');
}

export default new LoanActionsHistory();
