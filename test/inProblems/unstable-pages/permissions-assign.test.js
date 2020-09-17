import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import {
  Button
} from '../interactors';

const permissionsAmount = 10;
const permissionSetsAmount = 1;

// 🧹 unstable

export default test('', { permissions: ['perms.users.get'] })
  .step('seed data', async () => {
    store.createList('permission', permissionsAmount);
    store.createList('permission', permissionSetsAmount, { mutable: true });
    const user = store.create('user');
    return { user };
  })
  .step('visit "/users/preview/user.id"', ({ user }) => App.visit(`/users/preview/${user.id}`))
  .step(Button('Edit').click())