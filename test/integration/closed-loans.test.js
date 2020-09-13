import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';

import Button from '../interactors/Button';
import Header from '../interactors/Header';
import OverlayContainer from '../interactors/OverlayContainer';
import TableCell from '../interactors/TableCell';
import TableColumnHeader from '../interactors/TableColumnHeader';

export default test('closed loans', {
  permissions: ['manualblocks.collection.get', 'circulation.loans.collection.get']
})
  .child('loans with items', test => test
    .step('seed data', async () => {
      const earlierDate = new Date(133700000).toString();
      const laterDate = new Date(3133700000000).toString();
      const user = store.create('user');
      const loan1 = store.create('loan', 'feesAndFines', {
        user,
        status: { name: 'Closed' },
        dueDate: earlierDate,
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
        dueDate: laterDate,
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

      routes.post('/loan-anonymization/by-user/:id', {
        errors: [{
          message: 'haveAssociatedFeesAndFines',
          parameters: [{
            key: 'loanIds',
            value: JSON.stringify([loan1]),
          }]
        }]
      });

      return { user, loan1, loan2 };
    })
    .step('visit "/users/:user_id/loans/closed"', ({ user }) => App.visit(`/users/${user.id}/loans/closed`))
    .assertion(Button.findByAriaLabel('Close').exists())
    .assertion(TableCell('prefix callNumber suffix volume enumeration chronology', { rowNumber: 1, columnTitle: 'Effective call number string' }).exists())
    .child('sorting loan list', test => test
      .step(TableColumnHeader('Due date').click())
      .assertion('loan with more recent due date is at the bottom', ({ loan2 }) => TableCell(loan2.item.title).has({ rowNumber: 1 }))
      .assertion('loan with older due date is at the top', ({ loan1 }) => TableCell(loan1.item.title).has({ rowNumber: 0 }))
      .child('sorting loan list once again', test => test
        .step(TableColumnHeader('Due date').click())
        .assertion('loan with more recent due date is at the top', ({ loan2 }) => TableCell(loan2.item.title, { rowNumber: 0 }).exists())
        .assertion('loan with older due date is at the bottom', ({ loan1 }) => TableCell(loan1.item.title, { rowNumber: 1 }).exists())))
    .child('anonymizing loans with fee/fines', test => test
      .step(Button('Anonymize all loans').click())
      .assertion(Header('Anonymization prevented').exists())
      .child('confirming anonymization', test => test
        .step(Button('OK').click())
        .assertion(OverlayContainer('').has({ modal: false }))))
    .child('clicking the close button', test => test
      .step(Button.findByAriaLabel('Close').click())
      .assertion(Header('User search results').exists())))
  .child('loans without items', test => test
    .step('seed data', async () => {
      const user = store.create('user', {
        patronGroup: 'group7',
        personal: store.create('user-personal', {
          firstName: 'Tim',
          lastName: 'Berners-Lee'
        })
      });
      const loan = store.create('loan', 'feesAndFines', {
        user,
        status: { name: 'Closed' },
        dueDate: () => new Date(133700000).toString(),
        item: undefined
      });

      routes.post('/loan-anonymization/by-user/:id', {
        errors: [{
          message: 'haveAssociatedFeesAndFines',
          parameters: [{
            key: 'loanIds',
            value: JSON.stringify([loan]),
          }]
        }]
      });

      return { user };
    })
    .step('visit "/users/:user_id/loans/closed"', ({ user }) => App.visit(`/users/${user.id}/loans/closed`))
    .assertion(Header('Loans - Berners-Lee, Tim (Undergrad)').exists())
    .assertion(TableCell('', { rowNumber: 0, columnTitle: 'Item title' }).exists()));
