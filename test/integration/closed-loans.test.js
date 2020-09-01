import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import Header from '../interactors/Header';
import Button from '../interactors/Button';
import TableCell from '../interactors/TableCell';
import TableColumnHeader from '../interactors/TableColumnHeader';
import OverlayContainer from '../interactors/OverlayContainer';

function setupAnonymizationAPIResponse(errors) {
  routes.post('/loan-anonymization/by-user/:id', { errors });
}

export default test('closed loans', { permissions: ['manualblocks.collection.get', 'circulation.loans.collection.get'] })
  .step('seed data', async () => {
    const user = store.create('user');
    const loan1 = store.create('loan', 'feesAndFines', {
      user,
      status: { name: 'Closed' },
      dueDate: () => new Date(133700000).toString(),
      item: {
        holdingsRecordId: () => faker.random.uuid(),
        instanceId: () => faker.random.uuid(),
        barcode: () => faker.random.number(),
        title: () => faker.company.catchPhrase(),
        callNumberComponents: {
          prefix: 'prefix',
          callNumber: 'callNumber',
          suffix: 'suffix',
        },
        enumeration: 'enumeration',
        chronology: 'chronology',
        volume: 'volume',
      }
    });
    const loan2 = store.create('loan', 'feesAndFines', {
      user,
      status: { name: 'Closed' },
      dueDate: () => new Date(3133700000000).toString(),
      item: {
        holdingsRecordId: () => faker.random.uuid(),
        instanceId: () => faker.random.uuid(),
        barcode: () => faker.random.number(),
        title: () => faker.company.catchPhrase(),
        callNumberComponents: {
          prefix: 'prefix',
          callNumber: 'callNumber',
          suffix: 'suffix',
        },
        enumeration: 'enumeration',
        chronology: 'chronology',
        volume: 'volume',
      }
    });

    setupAnonymizationAPIResponse([{
      message: 'haveAssociatedFeesAndFines',
      parameters: [{
        key: 'loanIds',
        value: JSON.stringify([loan1]),
      }]
    }]);

    return { user, loan1, loan2 };
  })
  .step('visit "/users/:user_id/loans/closed"', async ({ user }) => {
    await App.visit(`/users/${user.id}/loans/closed`);
  })
  .assertion('close button is present', () => Button.findByAriaLabel('Close').exists())
  .assertion('call number is present', () => TableCell('prefix callNumber suffix volume enumeration chronology', { rowNumber: 1, columnTitle: 'Effective call number string' }).exists())
  .child('sorting loan list', test => test
    .step('sort loan list', () => TableColumnHeader('Due date').click())
    .assertion('loan with more recent due date is at the bottom', ({ loan2 }) => TableCell(loan2.item.title).has({ rowNumber: 1 }))
    .assertion('loan with older due date is at the top', ({ loan1 }) => TableCell(loan1.item.title).has({ rowNumber: 0 }))
    .child('sorting loan list once again', test => test
      .step('sort loan list', () => TableColumnHeader('Due date').click())
      .assertion('loan with more recent due date is at the top', ({ loan2 }) => TableCell(loan2.item.title, { rowNumber: 0 }).exists())
      .assertion('loan with older due date is at the bottom', ({ loan1 }) => TableCell(loan1.item.title, { rowNumber: 1 }).exists())))
  .child('anonymizing loans with fee/fines', test => test
    .step('click anonymize button', () => Button('Anonymize all loans').click())
    .assertion('anonymization error modal is shown', () => Header('Anonymization prevented').exists())
    .child('confirming anonymization', test => test
      .step('click "OK" button', () => Button('OK').click())
      .assertion('anonymization error modal is shown', () => OverlayContainer('').has({ modal: false }))));
