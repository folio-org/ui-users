import { App } from '@bigtest/interactor';
import test, { updatePermissions } from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import { feeFineBalanceId } from '../../src/constants';

import {
  Alert,
  Button,
  Checkbox,
  ColumnDiv,
  Div,
  Form,
  Header,
  InputNumber,
  Link,
  ListItem,
  Nav,
  Paragraph,
  Section,
  Select,
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
  TextArea,
  TextField
} from '../interactors';

export default test('settings')
  .step('seed data', async () => {
    store.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
    store.create('owner', { owner: 'Main Admin0', desc: 'Owner FyF' });
    const owner = store.create('owner', { owner: 'Shared', desc: 'Owner Shared' });
    const owner1 = store.create('owner', { owner: 'Main Admin1', desc: 'Owner DGB' });
    const otherOwner = store.create('owner', { owner: 'Main Admin2', desc: 'Owner CCH' });
    const ownerFeeFine = store.create('owner', { owner: 'Main Admin3', desc: 'Owner DGB' });
    store.createList('feefine', 5, { ownerId: ownerFeeFine.id });
    store.create('feefine', { feeFineType: 'Feefine 1', ownerId: owner.attrs.id });
    store.createList('transfer', 2, { ownerId: owner1.id });
    store.createList('transfer', 3, { ownerId: otherOwner.id });
    store.createList('payment', 5, { ownerId: owner1.id });
    store.createList('refund', 5);
    store.createList('waiver', 5);
    store.createList('service-point', 3);
    store.create('service-point', { name: 'none' });

    store.create('template', { name: 'Template 1' });
    store.create('template', { name: 'Template 2' });
    store.create('template', { category: 'FeeFineCharge', name: 'Template 3' });
    store.create('template', { category: 'FeeFineCharge', name: 'Template 4' });

    const condition = store.createList('patronBlockCondition', 5);
    const feeFineCondition = store.create('patronBlockCondition', { id: feeFineBalanceId });

    return { condition, feeFineCondition };
  })
  .step('configure routes', async () => {
    routes.get('/feefines');
    routes.post('/feefine', (schema, request) => {
      const json = JSON.parse(request.requestBody);
      const record = store.create('feefine', json);
      return record.attrs;
    });
    routes.delete('/feefines/:id');
    routes.put('/feefines/:id', (schema, request) => {
      const {
        params: { id },
        requestBody,
      } = request;
      const model = schema.feefines.find(id);
      const json = JSON.parse(requestBody);
      model.update({ ...json });
      return model.attrs;
    });
    routes.post('/feefines', (schema, request) => {
      const json = JSON.parse(request.requestBody);
      const record = store.create('feefine', json);

      return record.attrs;
    });
    routes.get('/owners');
    routes.post('/owners', (schema, request) => {
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
    routes.put('/owners/:id', (schema, request) => {
      const {
        params: { id },
        requestBody,
      } = request;
      const model = schema.owners.find(id);
      const json = JSON.parse(requestBody);
      model.update({ ...json });
      return model.attrs;
    });
    routes.get('/templates');
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
  .step(App.visit('/settings/users/'))
  .child('fee/fines manual/charges', test => test
    .step(Link('Manual charges').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 1 }))
    .assertion(Table('editList-settings-feefines', { dataColumnCount: 5 }).exists())
    .child('delete charge', test => test
      .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Delete this item')).click())
      .assertion(Paragraph('The Fee/Fine Type Feefine 1 will be deleted.').exists())
      .child('cancel deletion', test => test
        .step(Button('Cancel').click())
        .assertion(Paragraph('The Fee/Fine Type Feefine 1 will be deleted.').absent())
        .assertion(Table('editList-settings-feefines', { dataColumnCount: 5 }).exists()))
      .child('confirm deletion', test => test
        .step(Button('Delete').click())
        .step(Div.findByAttribute('data-test-callout-element').find(Div('The Fee/Fine Type Feefine 1 was successfully deleted')).exists())
        .assertion(TableRow().absent())))
    .child('edit change', test => test
      .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Edit this item')).click())
      .step(TextField.findByPlaceholder('defaultAmount').fill('300'))
      .step(Select.findByName('items[0].actionNoticeId').select('Template 1'))
      .child('cancel edit', test => test
        .step(Button('Cancel').click())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('1050.00')).exists()))
      .child('confirm edit', test => test
        .step(Button('Save').click())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('300.00')).exists())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Template 1')).exists())))
    .child('create new', test => test
      .step(Button.findById('clickable-add-settings-feefines').click())
      .step(TextField.findByPlaceholder('feeFineType').fill('New feefine'))
      .step(TextField.findByPlaceholder('defaultAmount').fill('100'))
      .step(Select.findByName('items[0].chargeNoticeId').select('Template 3'))
      .step(Button('Save').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 2 }))
      .assertion(TableRow.findByDataRowIndex('row-1').find(TableCell('New feefine')).exists())
      .assertion(TableRow.findByDataRowIndex('row-1').find(TableCell('100.00')).exists())
      .assertion(TableRow.findByDataRowIndex('row-1').find(TableCell('Template 3')).exists()))
    .child('create new with error', test => test
      .step(Button.findById('clickable-add-settings-feefines').click())
      .child('fee/fine type when empty', step => step
        .step(TextField.findByPlaceholder('feeFineType').fill(''))
        .assertion(Button('Save', { disabled: true }).exists())
        .assertion(Alert('Please fill this in to continue').exists()))
      .child('duplicate fee/fine type', step => step
        .step(TextField.findByPlaceholder('feeFineType').fill('Damage camera fee0'))
        .assertion(Button('Save', { disabled: true }).exists())
        .assertion(Alert('Fee/fine type exists for owner Main Admin3').exists()))
      .child('amount is non numeric', test => test
        .step(TextField.findByPlaceholder('defaultAmount').fill('hundred'))
        .assertion(Button('Save', { disabled: true }).exists())
        .assertion(Alert('Default Amount must be numeric').exists()))
      .child('amount is negative', test => test
        .step(TextField.findByPlaceholder('defaultAmount').fill('-100'))
        .assertion(Button('Save', { disabled: true }).exists())
        .assertion(Alert('Default Amount must be positive').exists())))
    .child('owner charge notice', test => test
      .step(Select.findById('select-owner').select('Main Admin3'))
      .step(Button('Edit').click())
      .step(Select.findByName('defaultChargeNoticeId').select('Template 3'))
      .step(Select.findByName('defaultActionNoticeId').select('Template 2'))
      .child('cancel edit', test => test
        .step(Button.findById('charge-notice-cancel').click())
        .assertion(Div.findById('defaultChargeNoticeId', { value: '-' }).exists())
        .assertion(Div.findById('defaultActionNoticeId', { value: '-' }).exists()))
      .child('save edit', test => test
        .step(Button('Save').click())
        .assertion(Div.findById('defaultChargeNoticeId', { value: 'Template 3' }).exists())
        .assertion(Div.findById('defaultActionNoticeId', { value: 'Template 2' }).exists())))
    .child('copy feefines to another owner', test => test
      .step(Select.findById('select-owner').select('Main Admin1'))
      .step(Select.findByName('ownerId').select('Main Admin3'))
      .child('select "No" and continue', test => test
        .step(Checkbox('No').click())
        .step(Button('Continue').click())
        .assertion(TableRow().absent()))
      .child('select "Yes" and continue', test => test
        .step(Button('Continue').click())
        .assertion(Table('editList-settings-feefines', { dataColumnCount: 5 }).exists()))))
  .child('fee/fine owners', test => test
    .step(Link('Owners').click())
    .assertion(Table('editList-settings-owners', { dataColumnCount: 4 }).exists())
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
      .assertion(Div.findByAriaLabelledBy('owner-service-point-label').absent())))
  .child('fee/fine payment methods', test => test
    .step(Link('Payment methods').click())
    .step(Select.findById('select-owner').select('Main Admin1'))
    .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
    .assertion(Table('editList-settings-payments', { dataColumnCount: 4 }).exists())
    .child('delete', test => test
      .step(Button.findById('clickable-delete-settings-payments-0').click())
      .child('cancel delete', test => test
        .step(Button('Cancel').click())
        .assertion(TableRowGroup().has({ dataRowContainerCount: 5 })))
      .child('confirm delete', test => test
        .step(Button('Delete').click())
        .assertion(TableRowGroup().has({ dataRowContainerCount: 4 }))))
    .child('edit', test => test
      .step(Button.findById('clickable-edit-settings-payments-0').click())
      .step(TextField.findByPlaceholder('nameMethod').fill('Cash10'))
      .step(Select.findByName('items[0].allowedRefundMethod').select('Yes'))
      .child('cancel edit', test => test
        .step(Button('Cancel').click())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Cash0')).exists())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('No')).exists()))
      .child('confirm edit', test => test
        .step(Button('Save').click())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Cash10')).exists())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Yes')).exists())))
    .child('add a payment', test => test
      .step(Button.findById('clickable-add-settings-payments').click())
      .step(TextField.findByPlaceholder('nameMethod').fill('Cash10'))
      .step(Select.findByName('items[0].allowedRefundMethod').select('Yes'))
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Cash10')).exists())
      .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Yes')).exists()))
    .child('add a pre-existing payment', test => test
      .step(Button.findById('clickable-add-settings-payments').click())
      .step(TextField.findByPlaceholder('nameMethod').fill('Cash2'))
      .assertion(Alert('Payment method already exists').exists())))
  .child('fee/fine refund reasons', test => test
    .step(Link('Refund reasons').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
    .assertion(Table('editList-settings-refunds', { dataColumnCount: 4 }).exists())
    .child('delete', test => test
      .step(Button.findById('clickable-delete-settings-refunds-0').click())
      .child('cancel delete', test => test
        .step(Button('Cancel').click())
        .assertion(TableRowGroup().has({ dataRowContainerCount: 5 })))
      .child('confirm delete', test => test
        .step(Button('Delete').click())
        .assertion(TableRowGroup().has({ dataRowContainerCount: 4 }))))
    .child('edit', test => test
      .step(Button.findById('clickable-edit-settings-refunds-0').click())
      .step(TextField.findByPlaceholder('nameReason').fill('Reason10'))
      .step(TextField.findByPlaceholder('description').fill('Reason Desc10'))
      .child('cancel edit', test => test
        .step(Button('Cancel').click())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Reason0')).exists())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Reason Desc0')).exists()))
      .child('confirm edit', test => test
        .step(Button('Save').click())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Reason10')).exists())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Reason Desc10')).exists())))
    .child('add a refund', test => test
      .step(Button.findById('clickable-add-settings-refunds').click())
      .step(TextField.findByPlaceholder('nameReason').fill('Reason10'))
      .step(TextField.findByPlaceholder('description').fill('Reason Desc10'))
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Reason10')).exists())
      .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Reason Desc10')).exists()))
    .child('add a pre-existing refund', test => test
      .step(Button.findById('clickable-add-settings-refunds').click())
      .step(TextField.findByPlaceholder('nameReason').fill('Reason1'))
      .step(Button('Save').click())
      .assertion(Alert('Refund reason already exists').exists())))
  .child('fee/fine transfer accounts', test => test
    .step(Link('Transfer accounts').click())
    .step(Select.findById('select-owner').select('Main Admin1'))
    .assertion(TableRowGroup().has({ dataRowContainerCount: 2 }))
    .assertion(Table('editList-settings-transfers', { dataColumnCount: 4 }).exists())
    .child('delete', test => test
      .step(Button.findById('clickable-delete-settings-transfers-0').click())
      .child('cancel delete', test => test
        .step(Button('Cancel').click())
        .assertion(TableRowGroup().has({ dataRowContainerCount: 2 })))
      .child('confirm delete', test => test
        .step(Button('Delete').click())
        .assertion(TableRowGroup().has({ dataRowContainerCount: 1 }))))
    .child('edit', test => test
      .step(Button.findById('clickable-edit-settings-transfers-0').click())
      .step(TextField.findByPlaceholder('accountName').fill('USA Bank3'))
      .step(TextField.findByPlaceholder('desc').fill('Transfer place3'))
      .child('cancel edit', test => test
        .step(Button('Cancel').click())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('USA Bank0')).exists())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Transfer place0')).exists()))
      .child('confirm edit', test => test
        .step(Button('Save').click())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('USA Bank3')).exists())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Transfer place3')).exists())))
    .child('add new transfer', test => test
      .step(Button.findById('clickable-add-settings-transfers').click())
      .step(TextField.findByPlaceholder('accountName').fill('USA Bank5'))
      .step(TextField.findByPlaceholder('desc').fill('Transfer place5'))
      .child('cancel addition', test => test
        .step(Button('Cancel').click())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('USA Bank0')).exists())
        .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Transfer place0')).exists()))
      .child('confirm addition', test => test
        .step(Button('Save').click())
        .assertion(TableRow.findByDataRowIndex('row-2').find(TableCell('USA Bank5')).exists())
        .assertion(TableRow.findByDataRowIndex('row-2').find(TableCell('Transfer place5')).exists()))))
  .child('fee/fine waive reasons', test => test
    .step(Link('Waive reasons').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
    .assertion(Table('editList-settings-waives', { dataColumnCount: 4 }).exists())
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
      .assertion(Alert('Waive reason already exists').exists())))
  .child('patron block limits', test => test
    .step('configure routes', async () => {
      routes.post('/patron-block-limits', function (schema, { requestBody }) {
        const json = JSON.parse(requestBody);
        const limit = store.create('patron-block-limit', json);
        return limit.attrs;
      });
    })
    .step(Link('Limits').click())
    .assertion(Nav('Module Settings', { listCount: 7 }).exists())
    .child('without preexisting limit', test => test
      .step(Link('Faculty').click())
      .assertion(Form('data-test-limits-form', { limitFieldCount: 6 }).exists())
      .assertion(Button('Save', { disabled: true }).exists())
      .child('create limit', test => test
        .step('input limit value', ({ condition }) => InputNumber(`${condition[0].name}`).fill(12))
        .assertion(Button('Save', { disabled: true }).absent())
        .child('submit limit', test => test
          .step(Button('Save').click())
          .assertion(Div.findByAttribute('data-test-callout-element').exists())))
      .child('set invalid negative limit', test => test
        .step('input limit value', ({ condition }) => InputNumber(`${condition[0].name}`).fill(-12))
        .assertion(Alert('Must be blank or a number from 1 to 999,999').exists()))
      .child('set invalid float limit', test => test
        .step('input limit value', ({ condition }) => InputNumber(`${condition[0].name}`).fill(12.5))
        .assertion(Alert('Must be blank or a number from 1 to 999,999').exists()))
      .child('set invalid negative fee fine', test => test
        .step('input limit value', ({ feeFineCondition }) => InputNumber(`${feeFineCondition.name}`).fill(-12))
        .assertion(Alert('Must be blank or a number from 0.01 to 999,999.99').exists()))
      .child('set valid float fee fine limit', test => test
        .step('input limit value', ({ feeFineCondition }) => InputNumber(`${feeFineCondition.name}`).fill(12.5))
        .step(Button('Save').click())
        .assertion(Div.findByAttribute('data-test-callout-element').exists()))))
  .child('general custom fields', test => test
    .child('view permission', test => test
      .step('update permissions', () => updatePermissions(['ui-users.settings.customfields.view']))
      .step(Link('Custom fields').click())
      // 🧹 permissions does not work
      // .assertion(Section('custom-fields-pane').exists())
      // .assertion(Link('Edit').absent())
    )
    .child('edit permission', test => test
      .step('update permissions', () => updatePermissions(['ui-users.settings.customfields.edit']))
      .step(Link('Custom fields').click())
      .assertion(Link('Edit').exists())
      .assertion(Div.findById('custom-fields-list', { sectionsCount: 4 }).exists())
      .child('edit', test => test
        .step(Link('Edit').click())
        .assertion(Header('Edit custom fields').exists())
        .child('has delete buttons', test => test
          .assertion(Section.findByAttribute('data-test-accordion-section', { id: '1' })
            .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())
          .assertion(Section.findByAttribute('data-test-accordion-section', { id: '2' })
            .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())
          .assertion(Section.findByAttribute('data-test-accordion-section', { id: '3' })
            .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())
          .assertion(Section.findByAttribute('data-test-accordion-section', { id: '4' })
            .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())))))
  .child('general departments', test => test
    .step(Link('Departments').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 2 }))
    .assertion(TableRow.findByDataRowIndex('row-1')
      .find(Button.findByAriaLabel('Delete this item'))
      .absent())
    .child('create new department errors', test => test
      .step(Button.findById('clickable-add-departments').click())
      .child('pre-existing name', child => child
        .step(TextField.findByPlaceholder('name').fill('Test1'))
        .assertion(Alert('Name already exists').exists()))
      .child('pre-existing code', child => child
        .step(TextField.findByPlaceholder('code').fill('test1'))
        .assertion(Alert('Code already exists').exists()))
      .child('empty fields', child => child
        .step(TextField.findByPlaceholder('name').fill(''))
        .step(TextField.findByPlaceholder('code').fill(''))
        .assertion(Alert('Please fill this in to continue').exists())
        .assertion(Alert('Code is required').exists()))))
  .child('patron block conditions', test => test
    .step(Link('Conditions').click())
    .step('click on first condition', ({ condition }) => Link(`${condition[0].name}`).click())
    .assertion(Nav('Module Settings', { listCount: 6 }).exists())
    .assertion(Button('Save', { disabled: true }).exists())
    .child('change value', test => test
      .step(Checkbox('Block renewals').click())
      .step(Checkbox('Block request').click())
      .step(TextArea('Message to be displayed').fill('test'))
      .assertion(Button('Save', { disabled: true }).absent())
      .child('save value', test => test
        .step(Button('Save').click())
        .assertion(Div.findByAttribute('data-test-callout-element').exists()))))
  .child('fee/fine comment required', test => test
    .step(Link('Comment required').click())
    .assertion(Form.findById('form-require-comment')
      .find(Div.findById('paid'))
      .find(ColumnDiv('Require comment when fee/fine fully/partially paid'))
      .exists())
    .assertion(Form.findById('form-require-comment')
      .find(Div.findById('waived'))
      .find(ColumnDiv('Require comment when fee/fine fully/partially waived'))
      .exists())
    .assertion(Form.findById('form-require-comment')
      .find(Div.findById('refunded'))
      .find(ColumnDiv('Require comment when fee/fine fully/partially refunded'))
      .exists())
    .assertion(Form.findById('form-require-comment')
      .find(Div.findById('transferredManually'))
      .find(ColumnDiv('Require comment when fee/fine fully/partially transferred'))
      .exists())
    .child('submit comments', test => test
      .step(Select.findByName('waived').select('Yes'))
      .step(Select.findByName('refunded').select('Yes'))
      .step(Button('Save').click())
      .assertion(Div.findByAttribute('data-test-callout-element').exists())));
