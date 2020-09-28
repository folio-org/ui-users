import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import {
  Alert,
  Button,
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
  TextField
} from '../interactors';

export default test('settings-waives')
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
  .step(App.visit('/settings/users/waivereasons'))
  .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
  .assertion(Table('editList-settings-waives', { dataColumnCount: 4 }).exists())
  .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('First time offender0')).exists())
  .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('First time offender0')).exists())
  .child('delete and cancel', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Delete this item')).click())
    .step(Button('Cancel').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 5 })))
  .child('delete and confirm', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Delete this item')).click())
    .step(Button('Delete').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 4 })))
  .child('edit and cancel', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Edit this item')).click())
    .step(TextField.findByPlaceholder('nameReason').fill('First time offender99'))
    .step(Button('Cancel').click())
    .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('First time offender0')).exists()))
  .child('edit and save', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Edit this item')).click())
    .step(TextField.findByPlaceholder('nameReason').fill('First time offender99'))
    .step(Button('Save').click())
    .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('First time offender99')).exists()))
  .child('add a waive', test => test
    .step(Button.findById('clickable-add-settings-waives').click())
    .step(TextField.findByPlaceholder('nameReason').fill('First time offender10'))
    .step(TextField.findByPlaceholder('description').fill('Penalty abatement10'))
    .step(Button('Save').click())
    .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('First time offender10')).exists())
    .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Penalty abatement10')).exists()))
  .child('add a pre-existing waive', test => test
    .step(Button.findById('clickable-add-settings-waives').click())
    .step(TextField.findByPlaceholder('nameReason').fill('First time offender1'))
    .step(Button('Save').click())
    .assertion(Alert('Waive reason already exists').exists()));
