import {
  interactor,
  scoped,
} from '@bigtest/interactor';

import KeyValue from './KeyValue';

@interactor class LoanActionsHistory {
  static defaultScope = '[data-test-loan-actions-history]';

  requests = scoped('[data-test-loan-actions-history-requests] div', KeyValue);
  feeFines = scoped('[data-test-loan-fees-fines] [data-test-kv-value]', KeyValue);
}

export default new LoanActionsHistory();
