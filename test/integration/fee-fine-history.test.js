import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import {
  Button,
  Checkbox,
  Div,
  Link,
  Search,
  Section,
  Table,
  TableCell,
  TableRow,
  TableRowGroup
} from '../interactors';

export default test('fee fine history')
  .step('seed data', async () => {
    const user = store.create('user', { id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd' });
    store.createList('owner', 3);
    store.createList('feefine', 5);
    const account = store.create('account', { userId: user.id });
    store.createList('feefineaction', 1, { accountId: account.id });
    store.createList('account', 3, { userId: user.id });
    store.create('account', {
      userId: user.id,
      status: {
        name: 'Open'
      },
      amount: 100,
      remaining: 100
    });
    store.create('account', {
      userId: user.id,
      status: {
        name: 'Closed'
      },
      amount: 0,
      remaining: 0
    });
    store.create('comment');
    store.createList('waiver', 4);
    store.createList('payment', 4);
    store.createList('transfer', 4);
    return { user };
  })
  .step('query routes', async () => {
    routes.get('/accounts');
    routes.get('/accounts/:id', (schema, request) => {
      return schema.accounts.find(request.params.id).attrs;
    });
    routes.get('/users');
    routes.get('/owners');
    routes.get('/feefines');
    routes.get('/comments');
    routes.get('/feefineactions');
    routes.get('/transfers');
    routes.get('/payments');
    routes.get('/waives', (schema) => {
      return schema.waivers.all();
    });
    routes.post('/accounts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.accounts.create(body);
    });
    routes.put('/accounts/:id', ({ accounts }, request) => {
      const matching = accounts.find(request.params.id);
      const body = JSON.parse(request.requestBody);
      return matching.update(body);
    });
    routes.post('/feefineactions', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.feefineactions.create(body);
    });
    routes.get('/feefineactions', (schema, request) => {
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
    routes.get('/feefineactions/:id', (schema, request) => {
      return schema.feefineactions.find(request.params.id);
    });
    routes.post('/transfers', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.transfers.create(body);
    });
    routes.get('/transfers/:id', (schema, request) => {
      return schema.transfers.find(request.params.id);
    });
    routes.post('/payments', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.payments.create(body);
    });
    routes.get('/payments/:id', (schema, request) => {
      return schema.payments.find(request.params.id);
    });
    routes.post('/waives', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.waivers.create(body);
    });
    routes.get('/waives/:id', (schema, request) => {
      return schema.waivers.find(request.params.id);
    });
    routes.delete('/waives/:id', (schema, request) => {
      return schema.db.waivers.remove(request.params.id);
    });
    routes.post('/comments', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.comments.create(body);
    });
    routes.get('/comments/:id', (schema, request) => {
      return schema.comments.find(request.params.id);
    });
  })
  .step('visit /users/preview/userid', async ({ user }) => {
    await App.visit(`/users/preview/${user.id}`);
  })
  .step(Button.findById('accordion-toggle-button-accountsSection').click())
  .step(Link.findById('clickable-viewcurrentaccounts').click())
  .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
  .assertion(Table('list-accounts-history-view-feesfines', { dataColumnCount: 14 }).exists())
  .child('filter pane', test => test
    .step(Button.findById('filter-button').click())
    .step(Search().fill('Missing item'))
    .step(Checkbox.findByName('owner.Main Circ0').click())
    .step(Button.findById('filter-button').click())
    .assertion(Link.findById('open-accounts', { value: 'Open' }).exists())) // 🧹 this test suite makes no sense. filter probably broken
  .child('selecting all accounts', test => test
    .step(Link.findById('all-accounts').click())
    .step(Checkbox.findByName('check-all').click())
    .assertion(Button.findById('open-closed-all-pay-button', { disabled: true }).absent()))
  .child('selecting one account', test => test
    .step(TableCell('Main Circ0').click())
    .assertion(Section.findByAttribute('data-test-fee-fine-details').exists()))
  .child('ellipsis menu', test => test
    .step(TableRowGroup().find(TableRow.findByRowNumber(1)).find(Button.findByAttribute('data-test-ellipsis-button')).click())
    .child('pay option', test => test
      .step(Div.findByAttribute('data-test-dropdown-menu-overlay').find(Button('Pay')).click())
      .assertion(Div.findById('payment-modal').exists()))
    .child('waive modal', test => test
      .step(Div.findByAttribute('data-test-dropdown-menu-overlay').find(Button('Waive')).click())
      .assertion(Div.findById('waive-modal').exists()))
    .child('transfer modal', test => test
      .step(Div.findByAttribute('data-test-dropdown-menu-overlay').find(Button('Transfer')).click())
      .assertion(Div.findById('transfer-modal').exists()))
    .child('error modal', test => test
      // 🧹 this test was originally called 'select the cancel option' but UI shows the button as 'Error'; not sure if it's meant to be 'Error'
      .step(Div.findByAttribute('data-test-dropdown-menu-overlay').find(Button('Error')).click())
      .assertion(Div.findById('error-modal').exists()))
    .child('loan details', test => test
      // 🧹 this route is broken
      .step(Div.findByAttribute('data-test-dropdown-menu-overlay').find(Button(' Loan details')).click())));
