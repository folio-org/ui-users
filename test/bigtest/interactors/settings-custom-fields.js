import {
  interactor,
  isPresent,
  clickable,
} from '@bigtest/interactor';

import { AccordionSetInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

@interactor class CustomFieldsInteractor {
  editFieldsButtonPresent = isPresent('[data-test-custom-fields-edit-button]');
  clickEditFieldsButton = clickable('[data-test-custom-fields-edit-button]');
  noCustomFieldsMessagePresent = isPresent('[data-test-custom-fields-no-fields-message]');
  customFieldsList = new AccordionSetInteractor('#custom-fields-list');

  whenLoaded() {
    return this.when(() => this.editFieldsButtonPresent).timeout(10000);
  }

  whenCustomFieldsLoaded() {
    return this.when(() => this.customFieldsList.isPresent).timeout(1000);
  }
}

export default new CustomFieldsInteractor();
