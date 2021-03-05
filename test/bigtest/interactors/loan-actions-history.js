import {
  interactor,
  scoped,
  clickable,
  ButtonInteractor,
  property,
  isPresent,
} from '@bigtest/interactor';

import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor'; // eslint-disable-line

import PatronBlockModal from './parton-blocks/modal';
import KeyValue from './KeyValue';

@interactor class LoanActionsHistory {
  actionHistoryPresent = isPresent('[data-test-loan-actions-history]');
  claimedReturnedDate = scoped('[data-test-loan-claimed-returned] div', KeyValue);
  requests = scoped('[data-test-loan-actions-history-requests] div', KeyValue);
  lostDate = scoped('[data-test-loan-actions-history-lost] div', KeyValue);
  itemStatus = scoped('[data-test-loan-actions-history-item-status] div', KeyValue);
  feeFines = scoped('[data-test-loan-fees-fines] [data-test-kv-value]', KeyValue);
  effectiveCallNumber = scoped('[data-test-effective-call-number] [data-test-kv-value]', KeyValue);
  overduePolicy = scoped('[data-test-overdue-policy] [data-test-kv-value]', KeyValue);
  clickLinkOverduePolicy = clickable('[data-test-overdue-policy] [data-test-kv-value] a');
  lostItemPolicy = scoped('[data-test-lost-item-policy] [data-test-kv-value]', KeyValue);
  clickLinkLostItemPolicy = clickable('[data-test-lost-item-policy] [data-test-kv-value] a');
  closeButton = scoped('button[icon=times]', ButtonInteractor);
  declareLostButton = scoped('[data-test-declare-lost-button]', ButtonInteractor);
  isDeclareLostButtonDisabled = property('[data-test-declare-lost-button]', 'disabled');
  claimReturnedButton = scoped('[data-test-claim-returned-button]', ButtonInteractor);
  isClaimReturnedButtonDisabled = property('[data-test-claim-returned-button]', 'disabled');
  isRenewButtonDisabled = property('[data-test-renew-button]', 'disabled');
  renewButton = scoped('[data-test-renew-button]', ButtonInteractor);
  isChangeDueDateButtonDisabled = property('[data-test-change-due-date-button]', 'disabled');
  loanActions = scoped('#list-loanactions', MultiColumnListInteractor);
  patronBlockModal = new PatronBlockModal();
  feeFineIncurredButton = scoped('[data-test-fee-fine-details-link]', ButtonInteractor);
  feeFinesHistoryPresent = isPresent('#list-accounts-history-view-feesfines');
  feeFinesDetailsPresent = isPresent('[data-test-fee-fine-details]');

  resolveClaimMenu = scoped('#resolve-claim-menu button');

  whenLoaded() {
    return this.when(() => this.actionHistoryPresent).timeout(5000);
  }

  whenFeesFinesHistoryPageLoaded() {
    return this.when(() => this.feeFinesHistoryPresent).timeout(5000);
  }

  whenFeesFinesDetailsPageLoaded() {
    return this.when(() => this.feeFinesDetailsPresent).timeout(5000);
  }
}

export default new LoanActionsHistory({ timeout: 5000 });
