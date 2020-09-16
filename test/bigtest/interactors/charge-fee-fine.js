import {
  count,
  interactor,
  selectable,
  value,
  fillable,
  clickable,
  is,
  Interactor,
  focusable,
  blurrable,
  triggerable,
} from '@bigtest/interactor';

import ConfirmationModalInteractor from '@folio/stripes-components/lib/ConfirmationModal/tests/interactor'; // eslint-disable-line
import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor'; // eslint-disable-line
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import ModalInteractor from '@folio/stripes-components/lib/Modal/tests/interactor'; // eslint-disable-line

@interactor class SelectInteractor {
  select = selectable();
  focus = focusable();
  blur = blurrable();
  optionCount = count('option');

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
    return this.when(() => this.isLoaded).timeout(5000);
  }
}
@interactor class TextFieldInteractor {
  val = value();
  fill = fillable();

  fillAndBlur(val) {
    return this.fill(val)
      .blur();
  }

  pressTab = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 9,
    key: 'Tab',
  });
}

export default @interactor class ChargeFeeFineInteractor {
  static defaultScope = '[data-test-charge-form]';

  form = new Interactor('#feeFineChargeForm');
  ownerSelect = new SelectInteractor('#ownerId');
  typeSelect = new SelectInteractor('#feeFineType');
  amountField = new TextFieldInteractor('#amount');
  clickCancel = clickable('#cancelCharge');
  clickSubmitChargeAndPay = clickable('#chargeAndPay');
  chargeAndPayButtonIsDisabled = is('#payment-modal #chargeAndPay[disabled]');
  submitChargeAndPay = new ButtonInteractor('#chargeAndPay');
  clickSubmitCharge = clickable('#chargeOnly');
  confirmationModal = new ConfirmationModalInteractor();
  paymentModal = new ModalInteractor('#payment-modal');
  paymentModalButton = new ButtonInteractor('#payment-modal #submit-button');
  paymentModalButtonIsDisabled = is('#payment-modal #submit-button[disabled]');
  paymentModalAmountField = new TextFieldInteractor('input[name="amount"]');
  paymentModalSelect = new SelectInteractor('select[id*="select-"]');
  callout = new CalloutInteractor();

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}
