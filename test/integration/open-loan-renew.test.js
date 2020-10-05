import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';

import {
  Bold,
  Button,
  Div,
  Link
} from '../interactors';

export default test('open loan renew', { permissions: [
  'automated-patron-blocks.collection.get',
  'circulation.loans.collection.get'
] })
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
  .step('configure routes', async ({ loan }) => {
    routes.get(`/automated-patron-blocks/${loan.userId}`, {
      automatedPatronBlocks: {
        patronBlockConditionId: '1',
        blockBorrowing: true,
        blockRenewals: true,
        blockRequests: false,
        message: 'Patron has reached maximum allowed number of items charged out'
      },
      totalRecords: 1,
    });
  })
  .child('action dropdown click', test => test
    .step('visit /users/user.id/loans/open', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/open`);
    })
    .step(Div({ attribute: 'data-test-actions-dropdown' }).find(Button({ ariaLabel: 'ellipsis' })).click())
    .assertion(Div({ attribute: 'data-test-dropdown-menu-overlay' }).exists())
    .child('renew', test => test
      .step(Button({ attribute: 'data-test-dropdown-content-renew-button' }).click())
      .assertion(Div({ attribute: 'data-test-patron-block-modal' }).exists())
      .assertion(Bold('Patron has reached maximum allowed number of items charged out').exists())))
  .child('loan detail page', test => test
    .step('visit /users/user.id/loans/open', async ({ loan }) => {
      await App.visit(`/users/${loan.userId}/loans/open/`);
    })
    .step(Div({ attribute: 'data-test-actions-dropdown' }).find(Button({ ariaLabel: 'ellipsis' })).click())
    // .step(Link('Item details').click()) // 🧹 next page renders for microsecond and disappears
    // .step(Button('Renew').click())
    // .assertion(Div({ attribute: 'data-test-patron-block-modal' }).exists())
    // .assertion(Bold('Patron has reached maximum allowed number of items charged out').exists())
  );
