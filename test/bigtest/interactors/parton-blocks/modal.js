import {
  interactor,
  collection,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

export default @interactor class PatronBlockModal {
  static defaultScope = '[data-test-patron-block-modal]';

  modalContent = collection('[data-test-patron-block-reason]');

  overrideButton = new ButtonInteractor('[data-test-open-override-modal]');
}
