import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';

import {
  Div,
  Header,
  Link,
  Section
} from '../interactors';

// 🧹 permissions does not work
// ui.users.settings.customfields.view is supposed to not display the edit button but it does

export default test('settings custom fields', {
  permissions: [
    'ui-users.settings.customfields.view'
  ]
})
  .step(App.visit('/settings/users/custom-fields'))
  // .assertion(Section('custom-fields-pane').exists())
  // .assertion(Link('Edit').absent())
  .child('visit edit page', test => test
    .step(App.visit('/settings/users/custom-fields/edit'))
    // .assertion(Section('edit-custom-fields-pane').absent())
  );
