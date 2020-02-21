import {
  interactor,
  clickable,
  Interactor,
} from '@bigtest/interactor';

import SelectInteractor from './select-section';
import TextFieldInteractor from './text-field-section';

@interactor class ChargeFeeFineInteractor {
  form = new Interactor('#feeFineChargeForm');
  ownerSelect = new SelectInteractor('#ownerId');
  typeSelect = new SelectInteractor('#feeFineType');
  amountField = new TextFieldInteractor('#amount');
  clickCancel = clickable('#cancelCharge');
  clickSubmitChargeAndPay = clickable('#chargeAndPay');
  clickSubmitCharge = clickable('#chargeOnly');
  clickConfirmCancel = clickable('[data-test-confirmation-modal-cancel-button]');
}

export default ChargeFeeFineInteractor;
