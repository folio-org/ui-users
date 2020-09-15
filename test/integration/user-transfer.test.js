/* eslint-disable newline-per-chained-call */
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import {
  Alert,
  Button,
  Checkbox,
  Div,
  HeaderRow,
  Link,
  Select,
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
  TextArea,
  TextField
} from '../interactors';

export default test('Transfer user fines', { permissions: [] }, { curServicePoint: { id: 1 } })
  .step('seed data', async () => {
    const user = store.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
    store.createList('owner', 5);
    store.createList('feefine', 5);
    store.createList('transfer', 5);
    const account = store.create('account', { userId: user.id });
    store.createList('feefineaction', 5, { accountId: account.id });
    store.createList('account', 3, { userId: user.id });
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

    return { user };
  })
  .step('query routes', async () => {
    routes.get('/accounts');
    routes.get('/accounts/:id', (schema, request) => {
      return schema.accounts.find(request.params.id).attrs;
    });
    routes.put('/accounts/:id', ({ accounts }, request) => {
      const matching = accounts.find(request.params.id);
      const body = JSON.parse(request.requestBody);
      return matching.update(body);
    });
    routes.get('/users');
    routes.get('/owners');
    routes.get('/feefines');
    routes.get('/comments');
    routes.get('/feefineactions');
    routes.get('/waives');
    routes.get('/transfers');
    routes.post('/transfers', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.transfers.create(body);
    });
    routes.put('/transfers/:id', ({ transfers }, request) => {
      const matching = transfers.find(request.params.id);
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
  })
  .step('visit user-details: accounts', ({ user }) => App.visit(`users/${user.id}/accounts/all`))
  .assertion(Table('list-accounts-history-view-feesfines', { dataRowCount: 5 }).exists())
  .child('open accounts', test => test
    .step(Link('Open').click())
    .assertion(Table('list-accounts-history-view-feesfines', { dataRowCount: 4 }).exists())
    .assertion(Table('list-accounts-history-view-feesfines').find(HeaderRow('', { columnRowCount: 14 })).exists())
    .child('transfer prompt', test => test
      .step(Checkbox.findByName('check-all').click())
      .step(Button.findById('open-closed-all-transfer-button').click())
      .child('cancel the transfer', test => test
        .step(Button('Cancel').click())
        .assertion(Div.findById('transfer-modal').absent()))
      .child('add a transfer', test => test
        .step(TextField.findById('amount').fill('200.00'))
        .step(Select.findByName('method').select('USA Bank1'))
        .step(TextArea.findByName('comment').fill('Comment UNAM'))
        .step(Div.findById('transfer-modal').find(Button('Transfer')).click())
        .step(Button('Confirm').click())
        .assertion(Table('list-accounts-history-view-feesfines', { dataRowCount: 4 }).exists()))
      .child('amount is less than zero', test => test
        .step(TextField.findById('amount').fill('-200.00'))
        .assertion(Alert('Transfer amount must be greater than zero').exists()))
      .child('amount exceeds the total amount', test => test
        .step(TextField.findById('amount').fill('700.00'))
        .assertion(Alert('Transfer amount exceeds selected amount').exists()))
      .child('amount is NaN', test => test
        .step(TextField.findById('amount').fill('a'))
        .assertion(Alert('Please fill this field in to continue').exists()))))
  .child('all accounts', test => test
    .step(Link('All').click())
    .step(Checkbox.findByName('check-all').click())
    .step(Button.findById('open-closed-all-transfer-button').click())
    .assertion(Div.findById('warning-modal').exists())
    .assertion(Table('warning-mcl').find(TableRowGroup('', { dataRowCount: 5 })).exists())
    .assertion(Table('warning-mcl').find(HeaderRow('', { columnRowCount: 6 })).exists())
    .child('deselect closed account and continue transfer', test => test
      .step(Table('warning-mcl').find(TableRow.findByRowNumber(1)).find(Checkbox()).click())
      .step(Button.findById('warningTransferContinue').click())
      .step(TextField.findById('amount').fill('400.00'))
      .step(Select.findByName('method').select('USA Bank1'))
      .step(TextArea.findByName('comment').fill('Comment UNAM'))
      .step(Button.findById('submit-button').click())
      .step(Button('Confirm').click())
      .assertion(Table('list-accounts-history-view-feesfines', { dataRowCount: 5 }).exists())
      .assertion(Table('list-accounts-history-view-feesfines').find(TableRowGroup()).find(TableRow.findByRowNumber(1)).find(TableCell('0.00', { columnTitle: 'Remaining' })).exists())
      .assertion(Table('list-accounts-history-view-feesfines').find(TableRowGroup()).find(TableRow.findByRowNumber(2)).find(TableCell('10.00', { columnTitle: 'Remaining' })).exists())
      .assertion(Table('list-accounts-history-view-feesfines').find(TableRowGroup()).find(TableRow.findByRowNumber(3)).find(TableCell('20.00', { columnTitle: 'Remaining' })).exists())
      .assertion(Table('list-accounts-history-view-feesfines').find(TableRowGroup()).find(TableRow.findByRowNumber(4)).find(TableCell('30.00', { columnTitle: 'Remaining' })).exists())
      .assertion(Table('list-accounts-history-view-feesfines').find(TableRowGroup()).find(TableRow.findByRowNumber(5)).find(TableCell('0.00', { columnTitle: 'Remaining' })).exists())));
