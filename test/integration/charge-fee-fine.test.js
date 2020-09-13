import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import Button from '../interactors/Button';
import Header from '../interactors/Header';
import Link from '../interactors/Link';
import Select from '../interactors/Select';
import TextField from '../interactors/TextField';

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
  .step('visit "/users/preview/1"', async () => {
    await App.visit('/users/preview/1');
  })
  .step('open "Fees/fines" accordion', async () => {
    await Button('Fees/fines').click();
  })
  .step('click "Create fee/fine" button', async () => {
    await Link('Create fee/fine').click();
  })
  .step('select test owner', async () => {
    await Select('Fee/fine owner*').select('testOwner');
  })
  .step('select fee/fine type', async () => {
    await Select('Fee/fine type*').select('testFineType');
  })
  .assertion('amount value is automatically populated', async () => {
    await TextField('Fee/fine amount*').has({ value: '500.00' });
  })
  .child('cancelling the charge', test => test
    .step('click the cancel button', async () => {
      await Button('Cancel').click();
    })
    .step('click the confirm cancel button', async () => {
      await Button('Close without saving').click();
    })
    .assertion('arrive on fees/fines page', async () => {
      await Header('Fees/fines - Berners-Lee, Tim (Undergrad)').exists();
    }))
  .child('submitting the charge', test => test
    .step('click the "Charge only" button', async () => {
      await Button('Charge only').click();
    })
    .assertion('arrive on fees/fines page', async () => {
      await Header('User search').exists();
    }));
