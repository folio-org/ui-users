import {
  interactor,
  scoped,
} from '@bigtest/interactor';

import KeyValue from './KeyValue';

@interactor class LoanActionsHistory {
  static defaultScope = '[data-test-loan-actions-history]';

  requests = scoped('[data-test-loan-actions-history-requests] div', KeyValue);
}

export default new LoanActionsHistory();
