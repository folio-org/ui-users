import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';

import {
  Div,
  Header,
  Link,
  Section
} from '../interactors';

// 🧹 permissions makes no difference

export default test('settings custom fields', {
  permissions: [
    // 'ui-users.settings.customfields.edit',
    'ui-users.settings.customfields.view'
  ]
})
  // .step(App.visit('/settings/users/custom-fields'))
  // .assertion(Link('Edit').exists())
  // .assertion(Div.findById('custom-fields-list', { sectionsCount: 4 }).exists())
  // .child('edit button', test => test
  //   .step(Link('Edit').click())
  //   .assertion(Header('Edit custom fields').exists()))
  .step(App.visit('/settings/users/custom-fields'))
  .assertion(Section('custom-fields-pane').exists())
  .assertion(Link('Edit').absent());
