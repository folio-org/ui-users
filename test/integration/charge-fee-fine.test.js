import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import {
  Button,
  Header,
  Link,
  Select,
  TextField
} from '../interactors';

export default test('charge fee/fine', { permissions: ['circulation.loans.collection.get'] })
  .step('seed data', async () => {
    const user = store.create('user', {
      patronGroup: 'group7',
      personal: store.create('user-personal', {
        firstName: 'Tim',
        lastName: 'Berners-Lee'
      })
    });
    const owner = store.create('owner', { owner: 'testOwner' });
    store.create('feefine', {
      feeFineType: 'testFineType',
      ownerId: owner.id,
      defaultAmount: 500.00
    });
    store.create('loan', {
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
  .step(App.visit('/users/preview/1'))
  .step(Button('Fees/fines').click())
  .step(Link('Create fee/fine').click())
  .step(Select('Fee/fine owner*').select('testOwner'))
  .step(Select('Fee/fine type*').select('testFineType'))
  .assertion(TextField('Fee/fine amount*').has({ value: '500.00' }))
  .child('cancelling the charge', test => test
    .step(Button('Cancel').click())
    .step(Button('Close without saving').click())
    .assertion(Header('Fees/fines - Berners-Lee, Tim (Undergrad)').exists()))
  .child('submitting the charge', test => test
    .step(Button('Charge only').click())
    .assertion(Header('User search').exists()));
