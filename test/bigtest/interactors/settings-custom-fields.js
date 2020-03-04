import {
  interactor,
  isPresent,
  clickable,
  count
} from '@bigtest/interactor';

import { AccordionSetInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor'; // eslint-disable-line import/no-extraneous-dependencies

@interactor class CustomFieldsInteractor {
  editCustomFieldsPaneIsPresent = isPresent('#edit-custom-fields-pane');
  viewCustomFieldsPaneIsPresent = isPresent('#custom-fields-pane');
  editFieldsButtonPresent = isPresent('[data-test-custom-fields-edit-button]');
  clickEditFieldsButton = clickable('[data-test-custom-fields-edit-button]');
  noCustomFieldsMessagePresent = isPresent('[data-test-custom-fields-no-fields-message]');
  customFieldsList = new AccordionSetInteractor('#custom-fields-list');
  deleteCustomFieldButtonsCount = count('[type="button"][data-test-custom-field-delete-button]');

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(1000);
  }

  whenCustomFieldsLoaded() {
    return this.when(() => this.customFieldsList.isPresent).timeout(1000);
  }
}

export default new CustomFieldsInteractor();
