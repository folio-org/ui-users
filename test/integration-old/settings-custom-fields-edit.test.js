import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';

import {
  Button,
  Div,
  Header,
  Link,
  Section
} from '../interactors';

export default test('settings custom fields', {
  permissions: [
    'ui-users.settings.customfields.edit'
  ]
})
  .step(App.visit('/settings/users/custom-fields/'))
  .assertion(Link('Edit').exists())
  .assertion(Div.findById('custom-fields-list', { sectionsCount: 4 }).exists())
  .child('edit button', test => test
    .step(Link('Edit').click())
    .assertion(Header('Edit custom fields').exists())
    .child('has delete buttons', test => test
      .assertion(Section.findByAttribute('data-test-accordion-section', { id: '1' })
        .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())
      .assertion(Section.findByAttribute('data-test-accordion-section', { id: '2' })
        .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())
      .assertion(Section.findByAttribute('data-test-accordion-section', { id: '3' })
        .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())
      .assertion(Section.findByAttribute('data-test-accordion-section', { id: '4' })
        .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())))
  .child('visit edit page', test => test
    .step(App.visit('/settings/users/custom-fields/edit'))
    .assertion(Section('edit-custom-fields-pane').exists()));
