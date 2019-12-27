import {
  interactor,
  scoped,
  clickable,
} from '@bigtest/interactor';
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

import KeyValue from './KeyValue';

@interactor class LoanActionsHistory {
  static defaultScope = '[data-test-loan-actions-history]';

  requests = scoped('[data-test-loan-actions-history-requests] div', KeyValue);
  feeFines = scoped('[data-test-loan-fees-fines] [data-test-kv-value]', KeyValue);
  overduePolicy = scoped('[data-test-overdue-policy] [data-test-kv-value]', KeyValue);
  clickLinkOverduePolicy = clickable('[data-test-overdue-policy] [data-test-kv-value] a');
  lostItemPolicy = scoped('[data-test-lost-item-policy] [data-test-kv-value]', KeyValue);
  clickLinkLostItemPolicy = clickable('[data-test-lost-item-policy] [data-test-kv-value] a');
  closeButton = scoped('button[icon=times]', ButtonInteractor);
}

export default new LoanActionsHistory();
