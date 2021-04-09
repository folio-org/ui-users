import {
  interactor,
  scoped,
  clickable,
  blurrable,
  triggerable,
  is,
  selectable,
  focusable,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import TextAreaInteractor from '@folio/stripes-components/lib/TextArea/tests/interactor'; // eslint-disable-line
import ModalInteractor from '@folio/stripes-components/lib/Modal/tests/interactor'; // eslint-disable-line
import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line
import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line

import KeyValue from './KeyValue';

@interactor class InputFieldInteractor {
  clickInput = clickable();
  blurInput = blurrable();

  pressTab = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 9,
    key: 'Tab',
  });
}

@interactor class SelectFieldInteractor {
  select = selectable();
  focus = focusable();
  blur = blurrable();
  selectAndBlur(val) {
    return this
      .focus()
      .timeout(5000)
      .select(val)
      .timeout(5000)
      .blur()
      .timeout(5000);
  }

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

@interactor class FeeFineDetails {
  static defaultScope = '[data-test-fee-fine-details]';

  latestPaymentStatus = scoped('[data-test-latestPaymentStatus] div', KeyValue);
  overduePolicy = scoped('[data-test-overdue-policy] div', KeyValue);
  overduePolicyClick = clickable('[data-test-overdue-policy] a');
  lostItemPolicy = scoped('[data-test-lost-item-policy] div', KeyValue);
  lostItemPolicyClick = clickable('[data-test-lost-item-policy] a');
  loanDetails = scoped('[data-test-loan-details] div', KeyValue);
  loanDetailsClick = clickable('[data-test-loan-details] a');
  instanceAndType = scoped('[data-test-instance] div', KeyValue);
  contributors = scoped('[data-test-contributors] div', KeyValue);
  payButton = new ButtonInteractor('#payAccountActionsHistory');
  waiveButton = new ButtonInteractor('#waiveAccountActionsHistory');
  transferButton = new ButtonInteractor('#transferAccountActionsHistory');
  refundButton = new ButtonInteractor('#refundAccountActionsHistory');
  errorButton = new ButtonInteractor('#errorAccountActionsHistory');
  errorButtonIsDisabled = is('#errorAccountActionsHistory[disabled]');
  exportAccountActionsHistoryReport = scoped('[data-test-export-account-actions-history-report]');
  exportAccountActionsHistoryReportButton = scoped('[data-test-export-account-actions-history-report]', ButtonInteractor);
  errorModal = new ModalInteractor('#error-modal');
  errorComment = new TextAreaInteractor('[class*=textArea---]');
  errorModalSubmit = new ButtonInteractor('[data-test-error-submit]');
  errorModalSubmitIsDisabled = is('[data-test-error-submit][disabled]');
  actionModal = new ModalInteractor('[data-test-fee-fine-action-modal]');
  actionModalSubmitButton = new ButtonInteractor('[data-test-fee-fine-action-modal] #submit-button');
  actionModalSubmitButtonIsDisabled = is('[data-test-fee-fine-action-modal] #submit-button[disabled]');
  actionModalAmountField = new InputFieldInteractor('input[name="amount"]');
  actionModalSelect = new SelectFieldInteractor('select[id*="select-"]');
  actionConfirmationModal = new ConfirmationModalInteractor();
  callout = new CalloutInteractor();

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

export default new FeeFineDetails({ timeout: 5000 });
