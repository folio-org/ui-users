import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';
import Button from '../interactors/Button';
import Checkbox from '../interactors/Checkbox';
import Header from '../interactors/Header';
import ActionsBar from '../interactors/ActionsBar';

export default test('bulk claim returned', { permissions: ['circulation.loans.collection.get'] })
  .step('before visiting the app', async () => {
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
  .step('visit "/users/1/loans/open"', async () => {
    await App.visit('/users/1/loans/open');
  })
  .child('bulk claim returned button', test => test
    .assertion('disables the button if no items are selected', async () => {
      await ActionsBar('').find(Button('Claim returned')).is({ disabled: true });
    }))
  .child('working with checked out items', test => test
    .step('select all checkboxes', async () => {
      await Checkbox.findByName('check-all').click();
    })
    .assertion('"Claim returned" button is enabled', async () => {
      await ActionsBar('').find(Button('Claim returned')).is({ enabled: true });
    })
    .step('click "Claim returned"', async () => {
      await ActionsBar('').find(Button('Claim returned')).click();
    })
    .assertion('shows the bulk claim returned modal', async () => {
      await Header('Confirm claim returned').exists();
    }));
