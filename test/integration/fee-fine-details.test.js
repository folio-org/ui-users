import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import {
  Button,
  Div,
  Link,
  Section,
  TableCell
} from '../interactors';

export default test('fee/fine details')
  .step('seed data', async () => {
    const user = store.create('user', { id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd' });
    store.create('account', { userId: user.id });
    const loan = store.create('loan', {
      id: '8e9f211b-6024-4828-8c14-ace39c6c2863',
      userId: user.id,
      overdueFinePolicyId: () => 'a6130d37-0468-48ca-a336-c2bde575768d',
      lostItemPolicyId: () => '48a3115d-d476-4582-b6a8-55c09eed7ec7',
      overdueFinePolicy: {
        name: () => 'Overdue Fine Policy name',
      },
      lostItemPolicy: {
        name: () => 'Lost Item Policy name',
      },
    });
    store.createList('account', 3, { userId: user.id });
    store.create('account', {
      userId: user.id,
      status: {
        name: 'Open',
      },
      amount: 100,
      remaining: 100,
      loanId: loan.id,
    });
    store.create('account', {
      userId: user.id,
      status: {
        name: 'Closed',
      },
      amount: 0,
      remaining: 0
    });
    return { user, loan };
  })
  .step('query routes', async () => {
    routes.get('/accounts');
    routes.get('/accounts/:id', (schema, request) => {
      return schema.accounts.find(request.params.id).attrs;
    });
    routes.get('/loans');
    routes.post('/loans', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.feefineactions.create(body);
    });
    routes.get('/loans', (schema, request) => {
      const url = new URL(request.url);
      const cqlQuery = url.searchParams.get('query');
      if (cqlQuery != null) {
        const cqlParser = new CQLParser();
        cqlParser.parse(cqlQuery);
        if (cqlParser.tree.term) {
          return schema.feefineactions.where({
            accountId: cqlParser.tree.term
          });
        }
      }
      return schema.feefineactions.all();
    });
    routes.get('/loans/:id', (schema, request) => {
      return schema.loans.find(request.params.id);
    });
  })
  .step('visit /users/preview/user.id', async ({ user }) => {
    await App.visit(`/users/preview/${user.id}`);
  })
  .step(Button.findById('accordion-toggle-button-accountsSection').click())
  .step(Link.findById('clickable-viewcurrentaccounts').click())
  .step(TableCell('Main Circ2').click())
  .assertion(Section.findByAttribute('data-test-fee-fine-details').exists())
  .assertion(Div.findByAttribute('data-test-overdue-policy').find(Div('Overdue Fine Policy name')).exists())
  .assertion(Div.findByAttribute('data-test-lost-item-policy').find(Div('Lost Item Policy name')).exists())
  .assertion(Div.findByAttribute('data-test-instance').find(Div('GROẞE DUDEN2 (book)')).exists())
  .assertion(Div.findByAttribute('data-test-contributors').find(Div('-')).exists())
  .child('overdue policy', test => test
    .step(Link('Overdue Fine Policy name').click())
    .assertion(Section.findByAttribute('data-test-fee-fine-details').absent()))
  .child('lost item policy', test => test
    .step(Link('Lost Item Policy name').click())
    .assertion(Section.findByAttribute('data-test-fee-fine-details').absent()));
