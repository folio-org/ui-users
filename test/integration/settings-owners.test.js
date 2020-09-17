import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import {
  Alert,
  Button,
  Div,
  ListItem,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
  TextField
} from '../interactors';

export default test('settings owners')
  .step('seed data', async () => {
    store.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
    store.create('owner', { owner: 'Main Admin0', desc: 'Owner FyF' });
    store.create('owner', { owner: 'Shared', desc: 'Owner Shared' });
    const owner1 = store.create('owner', { owner: 'Main Admin1', desc: 'Owner DGB' });
    const otherOwner = store.create('owner', { owner: 'Main Admin2', desc: 'Owner CCH' });
    const ownerFeeFine = store.create('owner', { owner: 'Main Admin3', desc: 'Owner DGB' });
    store.createList('feefine', 4, { ownerId: ownerFeeFine.id });
    store.createList('transfer', 2, { ownerId: owner1.id });
    store.createList('transfer', 3, { ownerId: otherOwner.id });
    store.createList('payment', 5, { ownerId: owner1.id });
    store.createList('refund', 5);
    store.createList('waiver', 5);
    store.createList('service-point', 3);
    store.create('service-point', { name: 'none' });
  })
  .step('query routes', async () => {
    routes.get('feefines');
    routes.post('feefine', (schema, request) => {
      const json = JSON.parse(request.requestBody);
      const record = store.create('feefine', json);
      return record.attrs;
    });
    routes.delete('feefines/:id');
    routes.put('feefines/:id', (schema, request) => {
      const {
        params: { id },
        requestBody,
      } = request;
      const model = schema.feefines.find(id);
      const json = JSON.parse(requestBody);
      model.update({ ...json });
      return model.attrs;
    });
    routes.get('owners');
    routes.post('owners', (schema, request) => {
      const json = JSON.parse(request.requestBody);
      const record = store.create('owner', json);
      return record.attrs;
    });
    routes.delete('/owners/:id', (schema, request) => {
      const matchingowner = schema.db.owners.find(request.params.id);
      const matchingfeefines = schema.db.feefines.where({ ownerId: request.params.id });
      if (matchingfeefines.length > 0) {
        return new Response(400, { 'Content-Type': 'application/json' }, JSON.stringify({
          errors: [{
            title: 'An error has occurred'
          }]
        }));
      }
      if (matchingowner != null) {
        return schema.db.owners.remove(request.params.id);
      }
      return matchingowner;
    });
    routes.put('owners/:id', (schema, request) => {
      const {
        params: { id },
        requestBody,
      } = request;
      const model = schema.owners.find(id);
      const json = JSON.parse(requestBody);
      model.update({ ...json });
      return model.attrs;
    });
    routes.get('/transfers', (schema, request) => {
      const url = new URL(request.url);
      const cqlQuery = url.searchParams.get('query');
      if (cqlQuery != null) {
        const cqlParser = new CQLParser();
        cqlParser.parse(cqlQuery);
        if (cqlParser.tree.field === 1) {
          return schema.transfers.all();
        }
        return schema.transfers.all();
      }
      return schema.transfers.all();
    });
    routes.post('/transfers', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.transfers.create(body);
    });
    routes.put('/transfers/:id', ({ transfers }, request) => {
      const matching = transfers.find(request.params.id);
      const body = JSON.parse(request.requestBody);
      return matching.update(body);
    });
    routes.delete('/transfers/:id', (schema, request) => {
      return schema.db.transfers.remove(request.params.id);
    });
    routes.get('/refunds', (schema, request) => {
      const url = new URL(request.url);
      const cqlQuery = url.searchParams.get('query');
      if (cqlQuery != null) {
        const cqlParser = new CQLParser();
        cqlParser.parse(cqlQuery);
        if (cqlParser.tree.field === 1) {
          return schema.refunds.all();
        }
        return schema.refunds.all();
      }
      return schema.refunds.all();
    });
    routes.post('/refunds', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.refunds.create(body);
    });
    routes.put('/refunds/:id', ({ refunds }, request) => {
      const matching = refunds.find(request.params.id);
      const body = JSON.parse(request.requestBody);
      return matching.update(body);
    });
    routes.delete('/refunds/:id', (schema, request) => {
      return schema.db.refunds.remove(request.params.id);
    });
    routes.get('/waives', (schema, request) => {
      const url = new URL(request.url);
      const cqlQuery = url.searchParams.get('query');
      if (cqlQuery != null) {
        const cqlParser = new CQLParser();
        cqlParser.parse(cqlQuery);
        if (cqlParser.tree.field === 1) {
          return schema.waivers.all();
        }
        return schema.waivers.all();
      }
      return schema.waivers.all();
    });
    routes.post('/waives', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.waivers.create(body);
    });
    routes.put('/waives/:id', ({ waivers }, request) => {
      const matching = waivers.find(request.params.id);
      const body = JSON.parse(request.requestBody);
      return matching.update(body);
    });
    routes.delete('/waives/:id', (schema, request) => {
      return schema.db.waivers.remove(request.params.id);
    });
    routes.get('/payments', (schema, request) => {
      const url = new URL(request.url);
      const cqlQuery = url.searchParams.get('query');
      if (cqlQuery != null) {
        const cqlParser = new CQLParser();
        cqlParser.parse(cqlQuery);
        if (cqlParser.tree.field === 1) {
          return schema.payments.all();
        }
        return schema.payments.all();
      }
      return schema.payments.all();
    });
    routes.post('/payments', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.payments.create(body);
    });
    routes.put('/payments/:id', ({ payments }, request) => {
      const matching = payments.find(request.params.id);
      const body = JSON.parse(request.requestBody);
      return matching.update(body);
    });
    routes.delete('/payments/:id', (schema, request) => {
      return schema.db.payments.remove(request.params.id);
    });
  })
  .step(App.visit('/settings/users/owners'))
  .assertion(Table('editList-settings-owners', { dataColumnCount: 4 }).exists())
  .assertion(TableRow.findByDataRowIndex('row-0')
    .find(TableCell('Main Admin0'))
    .exists())
  .assertion(TableRow.findByDataRowIndex('row-0')
    .find(TableCell('Owner FyF'))
    .exists())
  .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
  .child('delete', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findById('clickable-delete-settings-owners-0')).click())
    .assertion(Paragraph('The Fee/fine Owner Main Admin0 will be deleted.').exists())
    .child('cancel delete', test => test
      .step(Button('Cancel').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 5 })))
    .child('confirm delete', test => test
      .step(Button('Delete').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 4 }))))
  .child('edit', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findById('clickable-edit-settings-owners-0')).click())
    .step(TextField.findByPlaceholder('owner').fill('Main Admin10'))
    .step(TextField.findByPlaceholder('desc').fill('Owner Test'))
    .child('cancel edit', test => test
      .step(Button('Cancel').click())
      .assertion(TableRow.findByDataRowIndex('row-0')
        .find(TableCell('Main Admin0'))
        .exists())
      .assertion(TableRow.findByDataRowIndex('row-0')
        .find(TableCell('Owner FyF'))
        .exists()))
    .child('save edit', test => test
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-1')
        .find(TableCell('Main Admin10'))
        .exists())
      .assertion(TableRow.findByDataRowIndex('row-1')
        .find(TableCell('Owner Test'))
        .exists())))
  .child('adding owner', test => test
    .step(Button.findById('clickable-add-settings-owners').click())
    .child('submit new owner', test => test
      .step(TextField.findByPlaceholder('owner').fill('Main CUIB'))
      .step(TextField.findByPlaceholder('desc').fill('CUIB'))
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-4')
        .find(TableCell('Main CUIB'))
        .exists())
      .assertion(TableRow.findByDataRowIndex('row-4')
        .find(TableCell('CUIB'))
        .exists()))
    .child('type pre-existing owner', test => test
      .step(TextField.findByPlaceholder('owner').fill('Main Admin0'))
      .assertion(Alert('Fee/fine Owner already exists').exists())
      .assertion(Button('Save', { disabled: true }).exists())))
  .child('edit service-point', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findById('clickable-edit-settings-owners-0')).click())
    .step(TextField.findByPlaceholder('owner').fill('Main Admin10'))
    .step(TextField.findByPlaceholder('desc').fill('Owner Test'))
    .step(Button.findByAriaLabel('open menu').click())
    .step(ListItem('owner-service-point-main-item-0').click())
    .step(Button('Save').click())
    .assertion(Div.findByAriaLabelledBy('owner-service-point-label').absent()))