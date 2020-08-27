import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';
import Header from '../interactors/Header';
import OpenLoansControl from '../interactors/OpenLoansControl';

export default test('bulk claim returned', { permissions: ['circulation.loans.collection.get'] })
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
  .step('visit "/users/1/loans/open"', async () => {
    await App.visit('/users/1/loans/open');
  })
  .child('when no items are selected', test => test
    .assertion('the "Claim returned" button is disabled', async () => {
      await OpenLoansControl('').is({ actionBarClaimReturnedDisabled: true });
    }))
  .child('working with checked out items', test => test
    .step('select all checkboxes', async () => {
      await OpenLoansControl('').selectAll();
    })
    .step('click "Claim returned"', async () => {
      await OpenLoansControl('').clickClaimReturnedForSelected();
    })
    .assertion('shows the bulk claim returned modal', async () => {
      await Header('Confirm claim returned').exists();
    }));
