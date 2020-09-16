import findUser from '@folio/plugin-find-user';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';
import CQLParser from '../network/cql';

import { Header, Button } from '../interactors';

// 🧹 skipped because i don't know how to incorporate the plugin to the new setup

export default test('user proxy edit', {
  modules: [{
    type: 'plugin',
    name: '@folio/ui-plugin-find-user',
    pluginType: 'find-user',
    displayName: 'ui-plugin-find-user.meta.title',
    module: findUser,
  }],
  // translations: {
  //   'ui-plugin-find-user': 'ui-plugin-find-user'
  // }
})
  .step('seed data', async () => {
    store.create('user', { active: true, id: 'test-user-proxy-unique-id', barcode: 'self' });
    store.create('user', { active: true, barcode: 'sponsor' });
    store.create('user', { active: true, barcode: 'proxy' });
    store.create('user', { active: true, barcode: 'expired', expirationDate: '2019-01-01T00:00:00.000+0000' });
  })
  .step('query routes', async () => {
    // 🧹
    routes.get('/users', ({ users }, request) => {
      const url = new URL(request.url);
      const cqlQuery = url.searchParams.get('query');
      // For the proxy tests, the only tests handled by this endpoint
      // that have `searchParams` come from the find-user-plugin and
      // have a monster query that looks like this:
      //
      //   (username="sponsor*" or personal.firstName="sponsor*" or personal.lastName="sponsor*" ...)
      //
      // That turns into a *giant* tree when you feed it through the CQL
      // parser because of all those `or` clauses. We can be a bit clever,
      // or naive depending on how you think of it, and just grab the value
      // of the last leaf on the parse-tree to find out what search term
      // the user actually submitted.
      //
      // Once we have that value, we can use it to match against the barcodes
      // configured above to handle search.
      if (cqlQuery != null) {
        const cqlParser = new CQLParser();
        cqlParser.parse(cqlQuery);
        if (cqlParser.tree.right.term) {
          return users.where({
            barcode: cqlParser.tree.right.term.substring(0, cqlParser.tree.right.term.length - 1)
          });
        }
      }
      return users.all();
    });
    routes.get('/users/:id', (schema, request) => {
      return schema.users.find(request.params.id).attrs;
    });
    routes.put('/users/:id', (schema, request) => {
      return schema.users.find(request.params.id).attrs;
    });
    routes.get('/proxiesfor', ({ proxiesfors }, request) => {
      if (request.queryParams.query) {
        const cqlParser = new CQLParser();
        let query = /query=(\(.*\)|%28.*%29)/.exec(request.url)[1];
        if (/^%28/.test(query)) {
          query = decodeURIComponent(query);
        }
        cqlParser.parse(query);
        const {
          tree: {
            field,
            term,
          }
        } = cqlParser;
        return proxiesfors.where({ [field]: term });
      }
      return proxiesfors.all();
    });
    routes.post('/proxiesfor', (schema, { requestBody }) => {
      const proxyFor = JSON.parse(requestBody);
      return routes.create('proxiesfor', proxyFor);
    });
  })
  .step(App.visit('/users/test-user-proxy-unique-id/edit'))
  .assertion(Header('Edit').exists())
  // .child('cancel and redirect', test => test
  //   .step(Button('Cancel').click())
  //   .assertion(Header('Edit').absent()))
  // .child('sponsor', test => test
  // )
