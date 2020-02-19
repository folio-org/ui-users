import {
  interactor,
  scoped,
  clickable,
  ButtonInteractor,
  property,
} from '@bigtest/interactor';

import KeyValue from './KeyValue';

@interactor class LoanActionsHistory {
  static defaultScope = '[data-test-loan-actions-history]';

  claimedReturnedDate = scoped('[data-test-loan-claimed-returned] div', KeyValue);
  requests = scoped('[data-test-loan-actions-history-requests] div', KeyValue);
  lostDate = scoped('[data-test-loan-actions-history-lost] div', KeyValue);
  itemStatus = scoped('[data-test-loan-actions-history-item-status] div', KeyValue);
  feeFines = scoped('[data-test-loan-fees-fines] [data-test-kv-value]', KeyValue);
  overduePolicy = scoped('[data-test-overdue-policy] [data-test-kv-value]', KeyValue);
  clickLinkOverduePolicy = clickable('[data-test-overdue-policy] [data-test-kv-value] a');
  lostItemPolicy = scoped('[data-test-lost-item-policy] [data-test-kv-value]', KeyValue);
  clickLinkLostItemPolicy = clickable('[data-test-lost-item-policy] [data-test-kv-value] a');
  closeButton = scoped('button[icon=times]', ButtonInteractor);
  declareLostButton = scoped('[data-test-declare-lost-button]', ButtonInteractor);
  isDeclareLostButtonDisabled = property('[data-test-declare-lost-button]', 'disabled');
  claimReturnedButton = scoped('[data-test-claim-returned-button]', ButtonInteractor);
  isClaimReturnedButtonDisabled = property('[data-test-claim-returned-button]', 'disabled');

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

export default new LoanActionsHistory({ timeout: 5000 });
