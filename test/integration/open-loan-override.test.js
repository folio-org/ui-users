import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';

import {
  Button,
  Div,
  TableColumnHeader
} from '../interactors';

// 🧹 original tests are not comprehensive and does not test override functionality

export default test('request related failure', { permissions: [
  'manualblocks.collection.get',
  'circulation.loans.collection.get'
] })
  .child('single override', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', {
        status: { name: 'Open' },
        item: {
          callNumberComponents: {
            prefix: 'prefix',
            callNumber: 'callNumber',
            suffix: 'suffix',
          },
          enumeration: 'enumeration',
          chronology: 'chronology',
          volume: 'volume',
        },
      });
      return { loan };
    })
    .step('configure routes', async () => {
      routes.post('/circulation/renew-by-barcode', {
        'errors' : [{
          'message' : 'items cannot be renewed when there is an active recall request',
          'parameters' : [{
            'key' : 'request id',
            'value' : 'b67e73a8-b6b7-46fd-a918-77ce907dd3aa'
          }]
        }]
      }, 422);
    })
    .step('visit /users/loan.id/loans/open', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/open`);
    })
    .child('bulk renew modal', test => test
      .step(Div({ attribute: 'data-test-actions-dropdown' }).find(Button({ ariaLabel: 'ellipsis' })).click())
      .step(Button({ attribute: 'data-test-dropdown-content-renew-button' }).click())
      .assertion(Div({ id: 'bulk-renewal-modal' }).exists())
      .assertion(Div({ attribute: 'data-test-bulk-renew-call-numbers', value: 'prefix callNumber suffix volume enumeration chronology' }).exists())
      .assertion(TableColumnHeader('Effective call number string').exists())
      .child('override', test => test
        .step(Button('Override').click())
        .assertion(Div({ attribute: 'data-test-bulk-override-call-numbers', value: 'prefix callNumber suffix volume enumeration chronology' }).exists())
        .assertion(Div({ id: 'bulk-override-modal' }).find(TableColumnHeader('Effective call number string')).exists()))))
  .child('multiple override', test => test
    .step('seed data', async () => {
      const loan = store.create('loan', { status: { name: 'Open' } });
      return { loan };
    })
    .step('configure routes', async () => {
      routes.post('/circulation/renew-by-barcode', {
        'errors' : [{
          'message' : 'items cannot be renewed when there is an active recall request',
          'parameters' : [{
            'key' : 'request id',
            'value' : 'b67e73a8-b6b7-46fd-a918-77ce907dd3aa'
          }]
        },
        {
          'message' : 'item is not loanable',
          'parameters' : [{
            'key' : 'request id',
            'value' : 'b67e73a8-b6b7-46fd-a918-77ce907dd3aa'
          }]
        },
        ]
      }, 422);
    })
    .step('visit /users/loan.userid/loans/open', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/open`);
    })
    .step(Div({ attribute: 'data-test-actions-dropdown' }).find(Button({ ariaLabel: 'ellipsis' })).click())
    .step(Button({ attribute: 'data-test-dropdown-content-renew-button' }).click())
    .assertion(Div({ id: 'bulk-renewal-modal' }).exists())
    .assertion(Button('Override').exists()));
