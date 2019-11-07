import CQLParser from '../cql';
/* istanbul ignore file */

export default (server) => {
  server.logging = true;
  server.create('user', { active: true, id: 'test-user-proxy-unique-id', barcode: 'self' });
  server.create('user', { active: true, barcode: 'sponsor' });
  server.create('user', { active: true, barcode: 'proxy' });
  server.create('user', { active: true, barcode: 'expired', expirationDate: '2019-01-01T00:00:00.000+0000' });

  server.get('/users', ({ users }, request) => {
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

  server.get('/users/:id', (schema, request) => {
    return schema.users.find(request.params.id).attrs;
  });

  server.put('/users/:id', (schema, request) => {
    return schema.users.find(request.params.id).attrs;
  });

  server.get('/proxiesfor', ({ proxiesfors }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      // get the CQL query param from 'query=' until the amphersand or end of the string
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

  server.post('/proxiesfor', (schema, { requestBody }) => {
    const proxyFor = JSON.parse(requestBody);
    return server.create('proxiesfor', proxyFor);
  });
};
