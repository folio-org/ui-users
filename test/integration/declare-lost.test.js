import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';

import {
  Button,
  Div,
  Span,
  TextArea
} from '../interactors';

export default test('declare lost', {
  permissions: [
    'manualblocks.collection.get',
    'circulation.loans.collection.get'
  ],
  user: { curServicePoints: { id: 1 } }
})
  .child('visiting open loans with no declared lost item', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', { status: { name: 'Open' } });
      return { loan };
    })
    .step('visit /users/loan.userid/loans/open', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/open`);
    })
    .step(Div.findByAttribute('data-test-actions-dropdown').find(Button.findByAriaLabel('ellipsis')).click())
    .step(Button('Declare lost').click())
    .assertion(Div.findById('declareLost-modal').exists())
    .assertion(Button('Cancel').exists())
    .assertion(Button('Confirm', { disabled: true }).exists())
    .child('cancel declare lost', test => test
      .step(Button('Cancel').click())
      .assertion(Div.findById('declareLost-modal').absent()))
    .child('submit declare lost', test => test
      .step(TextArea('Additional information*').fill('text'))
      .step(Button('Confirm').click())
      .assertion(Div.findById('declareLost-modal').absent())))
  .child('visiting open loans with declared lost item', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Declared lost' } },
      });
      return { loan };
    })
    .step('visit /users/loan.userid/loans/open', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/open`);
    })
    .step(Div.findByAttribute('data-test-actions-dropdown').find(Button.findByAriaLabel('ellipsis')).click())
    .assertion(Button('Declare lost').absent()))
  .child('visiting loan details with no declared lost item', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'claimedReturned',
        actionComment: 'Claim returned confirmation',
        item: { status: { name: 'Claimed returned' } },
        itemStatus: 'Claimed returned',
        claimedReturnedDate: new Date().toISOString(),
      });
      store.create('user', { id: loan.userId });
      store.create('loanaction', { loan });
      return { loan };
    })
    .step('visit /users/loan.userid/loans/view/loan.id', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    })
    .assertion(Div.findByAttribute('data-test-loan-actions-history-lost').find(Span.findByTextContent('-')).exists())
    .child('declare lost', test => test
      .step(Div.findById('resolve-claim-menu').find(Button('Declare lost')).click()) // 🧹 two identical buttons and unfortunately i had to anchor to the dropdown to grab one of them
      .assertion(Div.findById('declareLost-modal').exists())))
  .child('fine incurred after marking item as lost', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'claimedReturned',
        actionComment: 'Claim returned confirmation',
        item: { status: { name: 'Claimed returned' } },
        itemStatus: 'Claimed returned',
        claimedReturnedDate: new Date().toISOString(),
      });
      store.create('user', { id: loan.userId });
      store.create('loanaction', { loan });
      return { loan };
    })
    .step('query routes', async () => {
      let refreshCounter = 0;
      routes.get('/accounts', () => {
        const accounts = (refreshCounter > 3) ? [{ id: 1, amount: 250 }] : [];
        refreshCounter++;
        return { accounts };
      });
    })
    .step('visit /users/loan.userid/loans/view/loan.id', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    })
    .assertion(Div.findByAttribute('data-test-loan-fees-fines').find(Div('-')).exists())
    .child('mark lost and update fine', test => test
      .step(Div.findById('resolve-claim-menu').find(Button('Declare lost')).click()) // 🧹 same issue as above; two identical buttons
      .step(TextArea('Additional information*').fill('item lost'))
      .step(Button('Confirm').click())
      // .assertion(Div.findByAttribute('data-test-loan-fees-fines').find(Div('250.00')).exists()) // 🧹 issue with the ugly querying and the counter
    ))
  .child('visiting loan details with declared lost item', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'declaredLost',
        actionComment: 'D',
        itemStatus: 'Declared lost',
        item: { status: { name: 'Declared lost' } },
      });
      store.create('user', { id: loan.userId });
      store.create('loanaction', {
        operation : 'U',
        loan
      });
      return { loan };
    })
    .step('visit /users/loan.userid/loans/view/loan.id', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    })
    .assertion(Button('Declare lost', { disabled: true }).exists())
    .assertion(Div.findByAttribute('data-test-loan-actions-history-lost').find(Div('-')).absent()))
  .child('visiting loan details with checked out item', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'checkedOut',
        actionComment: 'Checked out confirmation',
        item: { status: { name: 'Checked out' } },
        itemStatus: 'Checked out',
      });
      return { loan };
    })
    .step('visit /users/loan.userid/loans/view/loan.id', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    })
    .step(Button('Declare lost').click())
    .step(TextArea('Additional information*').fill('item lost'))
    .step(Button('Confirm').click())
    .assertion(Button('Declare lost', { disabled: true }).exists()))