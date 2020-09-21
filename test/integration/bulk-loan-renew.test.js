import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import { ActionsBar, Checkbox, Header } from '../interactors';

export default test('bulk loan renew', { permissions: ['circulation.loans.collection.get'] })
  .step('seed data', async () => {
    const user = store.create('user');
    store.createList('loan', 3, {
      user,
      status: { name: 'Open' },
      item: {
        id: () => faker.random.uuid(),
        holdingsRecordId: () => faker.random.uuid(),
        instanceId: () => faker.random.uuid(),
        title: () => faker.company.catchPhrase(),
        barcode: () => faker.random.number(),
      },
    });
  })
  .step(App.visit('/users/1/loans/open'))
  .child('working with checked out items', test => test
    .step(Checkbox.findByName('check-all').click())
    .step(ActionsBar().clickButton('Renew'))
    .assertion(Header('Renew Confirmation').exists()));
