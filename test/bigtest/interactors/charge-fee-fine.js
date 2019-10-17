import {
  count,
  interactor,
  selectable,
  value,
  fillable,
  clickable,
  Interactor,
} from '@bigtest/interactor';


@interactor class SelectInteractor {
  selectOption = selectable();
  optionCount = count('option');

  selectAndBlur(value) {
    return this.selectOption(value)
      .blur();
  }
}

@interactor class TextFieldInteractor {
  val = value();
  fill = fillable();

  fillAndBlur(val) {
    return this.fill(val)
      .blur();
  }
}

export default @interactor class ChargeFeeFineInteractor {
  form = new Interactor('#feeFineChargeForm');
  ownerSelect = new SelectInteractor('#ownerId');
  typeSelect = new SelectInteractor('#feeFineType');
  amountField = new TextFieldInteractor('#amount');
  clickCancel = clickable('#cancelCharge');
  clickSubmitChargeAndPay = clickable('#chargeAndPay');
  clickSubmitCharge = clickable('#chargeOnly');
  clickConfirmCancel = clickable('[data-test-confirmation-modal-cancel-button]');
}
