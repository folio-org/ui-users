import {
  count,
  interactor,
  selectable,
  value,
  fillable,
  clickable,
  Interactor,
  property,
} from '@bigtest/interactor';

@interactor class SelectInteractor {
  selectOption = selectable();
  optionCount = count('option');

  selectAndBlur(val) {
    return this.selectOption(val)
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
  barcodeField = new TextFieldInteractor('[data-test-fee-fine-barcode]');
  clickCancel = clickable('#cancelCharge');
  clickSubmitChargeAndPay = clickable('#chargeAndPay');
  submitChargeAndPayIsDisabled = property('#chargeAndPay', 'disabled');
  clickSubmitCharge = clickable('#chargeOnly');
  submitChargeIsDisabled = property('#chargeOnly', 'disabled');
  clickConfirmCancel = clickable('[data-test-confirmation-modal-cancel-button]');
  clickEnterBarcode = clickable('[data-test-enter-barcode]');
}
