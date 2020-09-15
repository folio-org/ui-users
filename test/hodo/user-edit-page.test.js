import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

export default test('user edit page')
  .step('seed data', async () => {
    let user1 = store.create('user');
    let user2 = store.create('user');
    store.create('requestPreference', {
      userId: user1.id,
      delivery: true,
      defaultServicePointId: 'servicepointId1',
      defaultDeliveryAddressTypeId: 'Type1',
      fulfillment: 'Delivery',
    });
    return { user1, user2 };
  })
  .step('visit "/users/user.id/edit"', ({ user1 }) => App.visit(`/users/${user1.id}/edit`));
