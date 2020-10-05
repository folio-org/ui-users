import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import {
  Button,
  Checkbox,
  Div,
  Header,
  Link,
  Search,
  Section,
  Select,
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
  TextField
} from '../interactors';

export default test('fee/fines', { permissions: ['circulation.loans.collection.get'] })
  .step('seed data', async () => {
    const user = store.create('user', {
      id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd',
      patronGroup: 'group7',
      personal: store.create('user-personal', {
        firstName: 'Tim',
        lastName: 'Berners-Lee'
      })
    });
    const account = store.create('account', { userId: user.id });
    const loan = store.create('loan', {
      id: '8e9f211b-6024-4828-8c14-ace39c6c2863',
      user,
      userId: user.id,
      status: { name: 'Open' },
      overdueFinePolicyId: () => 'a6130d37-0468-48ca-a336-c2bde575768d',
      lostItemPolicyId: () => '48a3115d-d476-4582-b6a8-55c09eed7ec7',
      overdueFinePolicy: {
        name: () => 'Overdue Fine Policy name',
      },
      lostItemPolicy: {
        name: () => 'Lost Item Policy name',
      },
      item: {
        id: () => faker.random.uuid(),
        holdingsRecordId: () => faker.random.uuid(),
        instanceId: () => faker.random.uuid(),
        title: () => faker.company.catchPhrase(),
        barcode: () => faker.random.number(),
      },
    });
    const owner = store.create('owner', { owner: 'testOwner' });
    store.create('feefine', {
      feeFineType: 'testFineType',
      ownerId: owner.id,
      defaultAmount: 500.00
    });
    store.createList('owner', 2);
    store.createList('feefine', 4);
    store.createList('feefineaction', 1, { accountId: account.id });
    store.createList('account', 3, { userId: user.id });
    store.create('account', {
      userId: user.id,
      status: {
        name: 'Open'
      },
      amount: 100,
      remaining: 100,
      loanId: loan.id,
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
    return { user, loan };
  })
  .step('configure routes', async () => {
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
  .child('charge fee', test => test
    .step(Button('Fees/fines').click())
    .step(Link('Create fee/fine').click())
    .step(Select('Fee/fine owner').select('testOwner'))
    .step(Select('Fee/fine type').select('testFineType'))
    .assertion(TextField('Fee/fine amount').has({ value: '500.00' }))
    .child('cancelling the charge', test => test
      .step(Button('Cancel').click())
      .step(Button('Close without saving').click())
      .assertion(Header('Fees/fines - Berners-Lee, Tim (Undergrad)').exists()))
    .child('submitting the charge', test => test
      .step(Button('Charge only').click())
      .assertion(Header('User search').exists())))
  .child('fee details', test => test
    .step(Button({ id: 'accordion-toggle-button-accountsSection' }).click())
    .step(Link({ id: 'clickable-viewcurrentaccounts' }).click())
    .step(TableCell('Main Circ2').click())
    .assertion(Section({ attribute: 'data-test-fee-fine-details' }).exists())
    .assertion(Div({ attribute: 'data-test-overdue-policy' }).find(Div('Overdue Fine Policy name')).exists())
    .assertion(Div({ attribute: 'data-test-lost-item-policy' }).find(Div('Lost Item Policy name')).exists())
    .assertion(Div({ attribute: 'data-test-instance' }).find(Div('GROẞE DUDEN2 (book)')).exists())
    .assertion(Div({ attribute: 'data-test-contributors' }).find(Div('-')).exists())
    .child('overdue policy', test => test
      .step(Link('Overdue Fine Policy name').click())
      .assertion(Section({ attribute: 'data-test-fee-fine-details' }).absent()))
    .child('lost item policy', test => test
      .step(Link('Lost Item Policy name').click())
      .assertion(Section({ attribute: 'data-test-fee-fine-details' }).absent())))
  .child('fee history', test => test
    .step(Button({ id: 'accordion-toggle-button-accountsSection' }).click())
    .step(Link({ id: 'clickable-viewcurrentaccounts' }).click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
    .assertion(Table('list-accounts-history-view-feesfines', { dataColumnCount: 14 }).exists())
    .child('filter pane', test => test
      .step(Button({ id: 'filter-button' }).click())
      .step(Search().fill('Missing item'))
      .step(Checkbox({ name: 'owner.Main Circ0' }).click())
      .step(Button({ id: 'filter-button' }).click())
      .assertion(Link({ id: 'open-accounts', value: 'Open' }).exists())) // 🧹 this test suite makes no sense. filter probably broken
    .child('selecting all accounts', test => test
      .step(Link({ id: 'all-accounts' }).click())
      .step(Checkbox({ name: 'check-all' }).click())
      .assertion(Button({ id: 'open-closed-all-pay-button', disabled: true }).absent()))
    .child('selecting one account', test => test
      .step(TableCell('Main Circ0').click())
      .assertion(Section({ attribute: 'data-test-fee-fine-details' }).exists()))
    .child('ellipsis menu', test => test
      .step(TableRowGroup().find(TableRow({ rowNumber: 1 })).find(Button({ attribute: 'data-test-ellipsis-button' })).click())
      .child('pay option', test => test
        .step(Div({ attribute: 'data-test-dropdown-menu-overlay' }).find(Button('Pay')).click())
        .assertion(Div({ id: 'payment-modal' }).exists()))
      .child('waive modal', test => test
        .step(Div({ attribute: 'data-test-dropdown-menu-overlay' }).find(Button('Waive')).click())
        .assertion(Div({ id: 'waive-modal' }).exists()))
      .child('transfer modal', test => test
        .step(Div({ attribute: 'data-test-dropdown-menu-overlay' }).find(Button('Transfer')).click())
        .assertion(Div({ id: 'transfer-modal' }).exists()))
      .child('error modal', test => test
        // 🧹 this test was originally called 'select the cancel option' but UI shows the button as 'Error'; not sure if it's meant to be 'Error'
        .step(Div({ attribute: 'data-test-dropdown-menu-overlay' }).find(Button('Error')).click())
        .assertion(Div({ id: 'error-modal' }).exists()))
      .child('loan details', test => test
        // 🧹 this route is broken
        .step(Div({ attribute: 'data-test-dropdown-menu-overlay' }).find(Button(' Loan details')).click()))));
