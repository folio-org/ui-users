import CQLParser from '../cql';
/* istanbul ignore file */

export default (server) => {
  server.logging = true;
  server.create('user', { active: true, id: 'test-user-proxy-unique-id' });
  server.create('user', { active: true, barcode: 'sponsor' });
  server.create('user', { active: true, barcode: 'proxy' });

  server.get('/users', ({ users }, request) => {
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
          lval,
        }
      } = cqlParser;

      if (lval === 'sponsor*') {
        return users.where({ barcode: 'sponsor' });
      }
      if (lval === 'proxy*') {
        return users.where({ barcode: 'proxy' });
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
