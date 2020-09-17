import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

// 🧹 skipping because of unstable page load; can't access route

export default test('user edit page')
  .step('seed data', async () => {
    const user1 = store.create('user');
    const user2 = store.create('user');
    store.create('requestPreference', {
      userId: user1.id,
      delivery: true,
      defaultServicePointId: 'servicepointId1',
      defaultDeliveryAddressTypeId: 'Type1',
      fulfillment: 'Delivery',
    });
    return { user1, user2 };
  })
  .step('visit "/users/user.id/edit"', async ({ user1 }) => App.visit(`/users/${user1.id}/edit`));
