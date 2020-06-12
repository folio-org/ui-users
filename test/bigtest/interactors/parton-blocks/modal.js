import {
  interactor,
  collection,
} from '@bigtest/interactor';

export default @interactor class PatronBlockModal {
  static defaultScope = '[data-test-patron-block-modal]';

  modalContent = collection('[data-test-patron-block-reason]');
}
