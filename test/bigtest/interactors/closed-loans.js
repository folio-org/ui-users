import {
  interactor,
  scoped,
  Interactor,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

@interactor class ClosedLoans {
  static defaultScope = '[data-test-closed-loans]';

  anonymizeButton = new ButtonInteractor('#anonymize-all');
  anonymizationFeesFinesErrorModal = new Interactor('#anonymization-fees-fines-modal');
  anonymizationConfirmButton = new ButtonInteractor('#anonymization-fees-fines-modal-footer button');
  list = scoped('#list-loanshistory');

  whenLoaded() {
    return this.when(() => this.list.isVisible);
  }
}

export default new ClosedLoans();
