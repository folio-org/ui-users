import {
  interactor,
  scoped,
  attribute,
} from '@bigtest/interactor';
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

import KeyValue from './KeyValue';

@interactor class LoanActionsHistory {
  static defaultScope = '[data-test-loan-actions-history]';

  requests = scoped('[data-test-loan-actions-history-requests] div', KeyValue);
  feeFines = scoped('[data-test-loan-fees-fines] [data-test-kv-value]', KeyValue);
  overduePolicy = scoped('[data-test-overdue-policy] [data-test-kv-value]', KeyValue);
  linkOverduePolicyHref = attribute('[data-test-overdue-policy] [data-test-kv-value] a', 'href');
  lostItemPolicy = scoped('[data-test-lost-item-policy] [data-test-kv-value]', KeyValue);
  linkLostItemPolicyHref = attribute('[data-test-lost-item-policy] [data-test-kv-value] a', 'href');
  closeButton = scoped('button[icon=times]', ButtonInteractor);
}

export default new LoanActionsHistory();
