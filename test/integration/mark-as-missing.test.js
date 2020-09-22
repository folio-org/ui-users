import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';

import {
  Button,
  Div,
  TextArea
} from '../interactors';

export default test('mark as missing', { permissions: [
  'module.users.enabled',
  'ui-users.loans.view',
  'manualblocks.collection.get',
  'circulation.loans.collection.get'
] })
  .child('without any returned claims', test => test  
    .step('seed data', async () => {
      const loan = store.create('loan', { status: { name: 'Open' } });
      return { loan };
    })
    .step('visit /users/loan.userid/loans/open', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/open`);
    })
    .step(Div.findByAttribute('data-test-actions-dropdown').find(Button.findByAriaLabel('ellipsis')).click())
    .assertion(Div.findByAttribute('data-test-dropdown-menu-overlay').find(Button('Mark as missing')).absent())
  )
  .child('with returned claims', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Claimed returned' } },
      });
      return { loan };
    })
    .step('visit /users/loan.userid/loans/open', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/open`);
    })
    .step(Div.findByAttribute('data-test-actions-dropdown').find(Button.findByAriaLabel('ellipsis')).click())
    .assertion(Div.findByAttribute('data-test-dropdown-menu-overlay').find(Button('Mark as missing')).exists())
    .child('mark missing', test => test
      .step(Button('Mark as missing').click())
      .assertion(Div.findById('markAsMissing-modal').exists())
      .assertion(Button('Cancel').exists())
      .assertion(Button('Confirm', { disabled: true }).exists())
      .assertion(TextArea('Additional information*').exists())
      .child('cancel', test => test
        .step(Button('Cancel').click())
        .assertion(Div.findById('markAsMissing-modal').absent()))
      .child('submitting missing', test => test
        .step(TextArea('Additional information*').fill('text'))
        .step('query route', async ({ loan }) => {
          let parsedRequestBody;
          routes.post(`/circulation/loans/${loan.id}/declare-claimed-returned-item-as-missing`, (_, request) => {
            parsedRequestBody = JSON.parse(request.requestBody);
            return new Response(204, {});
          });
          return { parsedRequestBody };
        })
        .step(Button('Confirm').click())
        // 🧹 there's a test here to confirm the response but is not reflected in the UI
        // expect(parsedRequestBody.comment).to.equal('text')
        .assertion(Div.findById('markAsMissing-modal').absent()))))
  .child('with item marked missing', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', {
        status: { name: 'Closed' },
        loanPolicyId: 'test',
        action: 'markedMissing',
        actionComment: 'Missing confirmation',
        item: { status: { name: 'Missing' } },
        itemStatus: 'Missing',
      });
      store.create('user', { id: loan.userId });
      return { loan };
    })
    .step('visit /users/loan.userId/loans/view/loan.id', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    })
    .assertion(Div.findByAttribute('data-test-loan-actions-history-item-status').find(Div('Missing')).exists()));
