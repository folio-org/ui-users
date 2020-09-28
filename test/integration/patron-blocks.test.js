import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import {
  Button,
  Checkbox,
  Div,
  Link,
  TableCell,
  TableRow,
  TableRowGroup,
  TextArea,
  TextField
} from '../interactors';

export default test('patron blocks section', { permissions: ['manualblocks.collection.get'] })
  .step('seed data', async () => {
    const usertmp = store.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
    store.createList('manualblock', 3, { userId: usertmp.id });
    store.create('manualblock', { userId: usertmp.id, expirationDate: '2019-05-23T00:00:00Z' });
  })
  .step('configure routes', async () => {
    routes.get('/manualblocks', (schema, request) => {
      const url = new URL(request.url);
      const cqlQuery = url.searchParams.get('query');
      if (cqlQuery != null) {
        const cqlParser = new CQLParser();
        cqlParser.parse(cqlQuery);
        if (cqlParser.tree.term) {
          return schema.manualblocks.where({
            userId: cqlParser.tree.term
          });
        }
      }
      return schema.manualblocks.all();
    });
    routes.get('/manualblocks/:id', (schema, request) => {
      return schema.manualblocks.find(request.params.id);
    });
    routes.put('/manualblocks/:id', ({ manualblocks }, request) => {
      const matching = manualblocks.find(request.params.id);
      const body = JSON.parse(request.requestBody);
      return matching.update(body);
    });
    routes.delete('manualblocks/:id', () => {
      // 🧹 original test had this route as an empty function
    });
    routes.post('/manualblocks', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.manualblocks.create(body);
    });
  })
  .step(App.visit('/users/view/1ad737b0-d847-11e6-bf26-cec0c932ce02'))
  .assertion(Button('Patron blocks').exists())
  .assertion(Div.findByAriaLabelledBy('accordion-toggle-button-patronBlocksSection')
    .find(TableRowGroup())
    .has({ dataRowContainerCount: 3 }))
  .assertion(Div.findByAriaLabelledBy('accordion-toggle-button-patronBlocksSection')
    .find(TableCell('Invalid email and mailing addresses.', { rowNumber: 0 }))
    .exists())
  .child('add patron block', test => test
    .step(Link('Create block').click())
    .assertion(Button('Save & close', { disabled: true }).exists())
    .child('save new patron block', test => test
      .step(TextArea('Display Description').fill('Description'))
      .step(TextArea('Staff only information').fill('Staff information'))
      .step(TextArea('Message to Patron').fill('Message to Patron'))
      .step(Checkbox('Renewals').click())
      .step(Checkbox('Borrowing').click())
      .step(Button('Save & close').click())
      .assertion(Div.findByAriaLabelledBy('accordion-toggle-button-patronBlocksSection')
        .find(TableRowGroup())
        .has({ dataRowContainerCount: 4 }))))
  // .child('update patron block', test => test
  //   .step(TableRow.findByRowNumber(1).find(TableCell('Manual')).click())
  //   // 🧹 clicking on block does not direct user to page with information
  //   .step(TextArea.findByName('desc').fill('Mail sent to patron has bounced back.'))
  //   .step(Button('Save & Close').click())
  //   .assertion(TableRow.findByRowNumber(1).find(TableCell('Mail sent to patron has bounced back.')).exists())
  //   .assertion(Div.findByAriaLabelledBy('accordion-toggle-button-patronBlocksSection')
  //     .find(TableRowGroup())
  //     .has({ dataRowContainerCount: 3 }))
  // )
  // .child('delete block', test => test
  //   // 🧹 clicking on block does not direct user like above
  //   // 🧹 delete button does not work even when manually clicked
  // )
  .child('collapse/expand button', test => test
    .step(Link('Create block').click())
    .step(Button('Block information').click())
    .child('collapsing one section', test => test
      .assertion(Button('Block information').has({ ariaExpanded: 'false' })))
    .child('collapse all', test => test
      .step(Button('Collapse all').click())
      .assertion(Button('Expand all').exists())));
