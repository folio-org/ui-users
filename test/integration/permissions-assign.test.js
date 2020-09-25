import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import {
  Button,
  Checkbox,
  Div,
  Link,
  Paragraph,
  UnorderedList
} from '../interactors';

// 🧹  unstable page

export default test('', { permissions: ['perms.users.get'] })
  .step('seed data', async () => {
    store.createList('permission', 10);
    store.createList('permission', 1, { mutable: true });
    const user = store.create('user');
    return { user };
  })
  .step('visit "/users/preview/user.id"', ({ user }) => App.visit(`/users/preview/${user.id}`))
  // .step(Link('Edit').click())
  // .step(Button('User permissions').click())
  // .assertion(Paragraph('No permissions found').exists())
  // .child('add permission', test => test
  //   .step(Button('Add permission').click())
  //   .assertion(Div.findById('permissions-modal').exists())
  //   .child('assign all permissions', test => test
  //     .step(Checkbox.findByName('selected-selectAll').click())
  //     .step(Button.findById('clickable-permissions-modal-save').click())
  //     .assertion(Div.findById('permissions-modal').absent())
  //     .assertion(Div.findByAriaLabelledBy('accordion-toggle-button-permissions').find(UnorderedList()).has({ itemCount: '11' }))));
