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

  overduePolicy = scoped('[data-test-overdue-policy] div', KeyValue);
  overduePolicyClick = clickable('[data-test-overdue-policy] a');
  lostItemPolicy = scoped('[data-test-lost-item-policy] div', KeyValue);
  lostItemPolicyClick = clickable('[data-test-lost-item-policy] a');
  instanceAndType = scoped('[data-test-instance] div', KeyValue);
  contributors = scoped('[data-test-contributors] div', KeyValue);
  payButton = new ButtonInteractor('#payAccountActionsHistory');
  paymentModal = new ModalInteractor('#payment-modal');
  paymentModalButton = new ButtonInteractor('#payment-modal #submit-button');
  paymentModalButtonIsDisabled = is('#payment-modal #submit-button[disabled]');
  paymentModalAmountField = new InputFieldInteractor('input[name="amount"]');
  paymentModalSelect = new SelectFieldInteractor('select[id*="select-"]');
  paymentConfirmationModal = new ConfirmationModalInteractor();
  callout = new CalloutInteractor();

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

export default new FeeFineDetails({ timeout: 5000 });
