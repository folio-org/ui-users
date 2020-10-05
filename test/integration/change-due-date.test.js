import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import {
  Button,
  CalendarButton,
  Header,
  TableCell
} from '../interactors';

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
  .step(App.visit('/users/1/loans/open'))
  .step(Button({ ariaLabel: 'ellipsis' }).click())
  .step(Button('Change due date', { enabled: true }).click())
  .assertion(Header('Change due date').exists())
  .assertion(TableCell('2', { columnTitle: 'Requests' }).exists())
  .assertion(Button('Save and close').is({ disabled: true }))
  .assertion(Button('Cancel').is({ enabled: true }))
  .child('selecting a new due date', test => test
    .step(Button({ attribute: 'data-test-calendar-button' }).click())
    .step(Button({ attribute: 'data-test-calendar-next-month' }).click())
    .step(CalendarButton('15').click())
    .assertion(Button('Save and close').is({ enabled: true })));
