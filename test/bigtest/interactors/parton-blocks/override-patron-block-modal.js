import {
  interactor, property,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line
import TextAreaInteractor from '@folio/stripes-components/lib/TextArea/tests/interactor'; // eslint-disable-line

export default @interactor class OverridePatronBlockModal {
  static defaultScope = '[data-test-override-patron-block-modal]';

  comment = new TextAreaInteractor('[data-test-override-patron-block-modal-comment]');
  closeButton = new ButtonInteractor('[data-test-override-patron-block-modal-close]');
  saveButton = new ButtonInteractor('[data-test-override-patron-block-modal-save]');
  saveButtonDisabled = property('[data-test-override-patron-block-modal-save]', 'disabled');
}
