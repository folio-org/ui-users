import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import {
  Section,
  TableRowGroup
} from '../interactors';

export default test('test patron block renewals', { permissions: [
  'manualblocks.collection.get',
  'circulation.loans.collection.get'
] })
  .step('seed data', async () => {
    const user = store.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
    store.createList('manualblock', 3, { userId: user.id });
    store.create('manualblock', { userId: user.id, expirationDate: '2019-05-23T00:00:00Z' });
    store.createList('loan', 3, { status: { name: 'Open' }, userId: user.id });
    return { user };
  })
  .step('query routes', async () => {
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
    routes.delete('/manualblocks/:id', () => {});
    routes.post('/manualblocks', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.manualblocks.create(body);
    });
  })
  .step('visit /users/user.id/loans/open', async ({ user }) => {
    await App.visit(`/users/${user.id}/loans/open`);
  })
  .assertion(TableRowGroup().has({ dataRowCount: 3 }))
  .child('patron block rows', test => test
    .step('visit /users/view/user.id', async ({ user }) => {
      await App.visit(`/users/view/${user.id}`);
    })
    .assertion(Section('patronBlocksSection').find(TableRowGroup()).has({ dataRowCount: 3 })));
