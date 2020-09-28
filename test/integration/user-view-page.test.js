import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';

import { Button, Div, Section, Span } from '../interactors';

export default test('user details page')
  .step('seed data', async () => {
    const user = store.create('user');
    store.create('requestPreference', {
      userId: user.id,
      delivery: true,
      defaultServicePointId: 'servicepointId1',
      defaultDeliveryAddressTypeId: 'Type1',
      fulfillment: 'Delivery',
    });
    return { user };
  })
  .step('visit "/users/view/id"', ({ user }) => App.visit(`/users/view/${user.id}`))
  .step(Button('Extended information').click())
  .assertion(Span('data-test-department-name', { value: '-' }).exists())
  .assertion(Div.findByAttribute('data-test-hold-shelf', { value: 'Hold shelf - Yes' }).exists())
  .assertion(Div.findByAttribute('data-test-delivery', { value: 'Delivery - Yes' }).exists())
  .assertion(Span('data-test-default-delivery-address', { value: 'Claim' }).exists())
  .assertion(Section('customFields').exists())
  .child('when custom fiels are not in stock', test => test
    .step('configure routes', async () => {
      routes.get('/custom-fields', {
        customFields: [],
      });
    })
    .step('visit "/users/view/id"', ({ user }) => App.visit(`/users/view/${user.id}`))
    .assertion(Section('customFields').absent()))
  .child('when user has departments', test => test
    .step('seed data', async () => {
      const departments = store.createList('department', 2);
      routes.get('/departments', { departments });
      const user2 = store.create('user', {
        departments: departments.map(({ id }) => id),
      });
      return { user2 };
    })
    .step('visit "/users/view/id"', ({ user2 }) => App.visit(`/users/view/${user2.id}`))
    .assertion(Span('data-test-department-name', { value: 'TestName0, TestName1' }).exists()));
