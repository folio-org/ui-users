import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';
import Button from '../interactors/Button';
import Link from '../interactors/Link';
import TextArea from '../interactors/TextArea';
import Header from '../interactors/Header';
import Paragraph from '../interactors/Paragraph';
import ActionsBar from '../interactors/ActionsBar';
import DropdownMenu from '../interactors/DropdownMenu';

export default test('claim returned', {
  permissions: ['manualblocks.collection.get', 'circulation.loans.collection.get']
})
  .child('visiting open loans list without claimed returned item', test => test
    .step('seed data', async () => {
      const user = store.create('user');
      const loan = store.create('loan', {
        userId: user.id,
        status: { name: 'Open' },
        item: {
          id: () => faker.random.uuid(),
          holdingsRecordId: () => faker.random.uuid(),
          instanceId: () => faker.random.uuid(),
          title: () => faker.company.catchPhrase(),
          barcode: () => faker.random.number(),
        }
      });
      return { user, loan };
    })
    .step('visit "/users/:user_id/loans/open"', ({ user }) => App.visit(`/users/${user.id}/loans/open`))
    .step('click the actions dropdown', () => Button.findByAriaLabel('ellipsis').click())
    .step('click the "Claim returned" button', () => Button('Claim returned', { enabled: true }).click())
    .assertion('"Confirm claim returned" modal is present', () => Header('Confirm claim returned').exists())
    .assertion('"Confirm" button is present and disabled', () => Button('Confirm', { disabled: true }).exists())
    .assertion('"Additional information" text area is present', () => TextArea('Additional information*').exists())
    .child('confirming claim returned', test => test
      .step('fill in "Additional information" text area', () => TextArea('Additional information*').fill('hello'))
      .step('click "Confirm" button', () => Button('Confirm').click())
      .step('click "Closed loans" tab', () => Link('Closed loans').click())
      .assertion('loan is now closed', () => Paragraph('1 closed loan').exists())))
  .child('visiting open loans list with claimed returned item', test => test
    .step('seed data', async () => {
      const user = store.create('user');
      store.create('loan', {
        userId: user.id,
        status: { name: 'Open' },
        item: {
          id: () => faker.random.uuid(),
          holdingsRecordId: () => faker.random.uuid(),
          instanceId: () => faker.random.uuid(),
          title: () => faker.company.catchPhrase(),
          barcode: () => faker.random.number(),
          status: { name: 'Checked out' }
        }
      });
      store.create('loan', {
        userId: user.id,
        status: { name: 'Open' },
        item: {
          id: () => faker.random.uuid(),
          holdingsRecordId: () => faker.random.uuid(),
          instanceId: () => faker.random.uuid(),
          title: () => faker.company.catchPhrase(),
          barcode: () => faker.random.number(),
          status: { name: 'Claimed returned' }
        }
      });
      return { user };
    })
    .step('visit "/users/:user_id/loans/open"', ({ user }) => App.visit(`/users/${user.id}/loans/open`))
    .assertion('claimed returned count is displayed', () => ActionsBar('').has({ loanCount: '2 records found (1 claimed returned)' })))
  .child('visiting loan detail without claimed returned item', test => test
    .step('seed data', async () => {
      const user = store.create('user');
      const loan = store.create('loan', {
        user,
        status: { name: 'Open' },
        loanPolicyId: 'test',
        item: {
          id: () => faker.random.uuid(),
          holdingsRecordId: () => faker.random.uuid(),
          instanceId: () => faker.random.uuid(),
          title: () => faker.company.catchPhrase(),
          barcode: () => faker.random.number(),
        }
      });
      return { user, loan };
    })
    .step('visit "/users/:user_id/loans/view/:loan_id"', ({ user, loan }) => App.visit(`/users/${user.id}/loans/view/${loan.id}`))
    .step('click "Claim returned" button', () => Button('Claim returned').click())
    .assertion('"Confirm claim returned" modal is present', () => Header('Confirm claim returned').exists()))
  .child('visiting loan detail with claimed returned item', test => test
    .step('seed data', async () => {
      const user = store.create('user');
      const loan = store.create('loan', {
        user,
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'claimedReturned',
        actionComment: 'Claim returned confirmation',
        itemStatus: 'Claimed returned',
        claimedReturnedDate: faker.date.past(1),
        item: {
          id: () => faker.random.uuid(),
          holdingsRecordId: () => faker.random.uuid(),
          instanceId: () => faker.random.uuid(),
          title: () => faker.company.catchPhrase(),
          barcode: () => faker.random.number(),
          status: { name: 'Claimed returned' }
        },
        metadata: {
          updatedByUserId: faker.random.uuid(),
        },
      });
      store.create('loanaction', {
        loan
      });

      return { user, loan };
    })
    .step('visit "/users/:user_id/loans/view/:loan_id"', ({ user, loan }) => App.visit(`/users/${user.id}/loans/view/${loan.id}`))
    .step('click "Resolve claim" dropdown button', () => Button('Resolve claim').click())
    .assertion('"Declare lost" button is present', () => DropdownMenu('').find(Button('Declare lost', { enabled: true })).exists()));
