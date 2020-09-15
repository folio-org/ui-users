import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import Button from '../interactors/Button';
import CalendarButton from '../interactors/CalendarButton';
import Header from '../interactors/Header';
import OverlayContainer from '../interactors/OverlayContainer';
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
  .step('visit "/users/1/loans/open"', () => App.visit('/users/1/loans/open'))
  .step(Button.findByAriaLabel('ellipsis').click())
  .step(Button('Change due date', { enabled: true }).click())
  .assertion(Header('Change due date').exists())
  .assertion(OverlayContainer('').find(TableCell('2', { rowNumber: 0, columnTitle: 'Requests' })).exists())
  .assertion(Button('Save and close').is({ disabled: true }))
  .assertion(Button('Cancel').is({ enabled: true }))
  .child('selecting a new due date', test => test
    .step(Button.findByAttribute('data-test-calendar-button').click())
    .step(Button.findByAttribute('data-test-calendar-next-month').click())
    .step(CalendarButton('15').click())
    .assertion(Button('Save and close').is({ enabled: true })));
