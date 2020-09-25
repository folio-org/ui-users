import {
  interactor,
  scoped,
  Interactor,
  collection,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor'; // eslint-disable-line

@interactor class ClosedLoans {
  static defaultScope = '[data-test-closed-loans]';

  anonymizeButton = new ButtonInteractor('#anonymize-all');
  anonymizationFeesFinesErrorModal = new Interactor('#anonymization-fees-fines-modal');
  anonymizationConfirmButton = new ButtonInteractor('#anonymization-fees-fines-modal-footer button');
  list = scoped('#list-loanshistory', MultiColumnListInteractor);
  rowButtons = collection('[data-test-closed-loans] [data-row-inner]', ButtonInteractor);
  callNumbers = collection('[data-test-list-call-numbers]');
  columnHeaders = collection('[role="columnheader"]');

  whenLoaded() {
    return this.when(() => this.list.isVisible);
  }
}

export default new ClosedLoans();
