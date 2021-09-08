import {
  interactor,
  clickable,
  isPresent,
  isVisible
} from '@bigtest/interactor';

import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor';

@interactor class PayInteractor {
  payButton = clickable('#open-closed-all-pay-button');
  ownerSelect = new SelectInteractor('[data-test-payment-owner]');
  actionSelect = new SelectInteractor('#action-selection');
  selectCheckbox = clickable('#checkbox');
  isLoaded = isPresent('#list-accounts-history-view-feesfines [class*=mclRowContainer---] > div:nth-child(5)');
  isView = isVisible('#list-accounts-history-view-feesfines [class*=mclScrollable---]');

  whenLoaded() {
    return this.when(() => this.isLoaded);
  }

  whenVisibled() {
    return this.when(() => this.isView);
  }
}

export default new PayInteractor(5000);
