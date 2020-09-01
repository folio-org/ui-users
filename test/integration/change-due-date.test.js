import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';
import Button from '../interactors/Button';
import Header from '../interactors/Header';
import TableCell from '../interactors/TableCell';

export default test('change due date', { permissions: ['circulation.loans.collection.get'] })
  .step('seed data', async () => {
    const user = store.create('user');
    const loan = store.create('loan', {
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
    store.createList('request', 2, { itemId: loan.itemId });
  })
  .step('visit "/users/1/loans/open"', async () => {
    await App.visit('/users/1/loans/open');
  })
  .step('click the actions dropdown', async () => {
    await Button.findByAriaLabel('ellipsis').click();
  })
  .step('click "Change due date"', async () => {
    await Button('Change due date', { enabled: true }).click();
  })
  .assertion('shows the change due date modal', async () => {
    await Header('Change due date').exists();
  })
  .assertion('shows the requests count', async () => {
    await TableCell('2', { rowNumber: 0, columnTitle: 'Requests' }).exists();
  })
  .assertion('save button is disabled', async () => {
    await Button('Save and close').is({ disabled: true });
  })
  .assertion('cancel button is present', async () => {
    await Button('Cancel').is({ enabled: true });
  })
  .child('selecting a new due date', test => test
    .step('click the due date calendar button', async () => {
      await Button.findByAriaLabel('Show/hide datepicker').click();
    })
    .step('select a date', async () => {
      await Button.findByAriaLabel('Go to next month').click();
      await Button('15').click();
    })
    .assertion('save button is enabled', async () => {
      await Button('Save and close').is({ enabled: true });
    }));
