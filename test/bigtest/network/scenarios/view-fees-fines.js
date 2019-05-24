/* istanbul ignore file */
import CQLParser from '../cql';

export default (server) => {
  const user = server.create('user', { id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd' });
  server.createList('owner', 3);
  server.createList('feefine', 5);
  const account = server.create('accounts', { userId: user.id });
  server.createList('feefineactions', 1, { accountId: account.id });
  server.createList('accounts', 3, { userId: user.id });
  server.create('accounts', {
    userId: user.id,
    status: {
      name: 'Open'
    },
    amount: 100,
    remaining: 100
  });
  server.create('accounts', {
    userId: user.id,
    status: {
      name: 'Closed'
    },
    amount: 0,
    remaining: 0
  });
  server.create('comments');
  server.createList('waivers', 4);
  server.createList('payments', 4);
  server.createList('transfers', 4);
  server.get('/accounts');
  server.get('/accounts/:id', (schema, request) => {
    return schema.accounts.find(request.params.id).attrs;
  });
  server.get('/users');
  server.get('/owners');
  server.get('/feefines');
  server.get('/comments');
  server.get('/feefineactions');
  server.get('/transfers');
  server.get('/payments');
  server.get('/waives', (schema) => {
    return schema.waivers.all();
  });

  server.post('/accounts', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.accounts.create(body);
  });

  server.put('/accounts/:id', ({ accounts }, request) => {
    const matching = accounts.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    return matching.update(body);
  });

  server.post('/feefineactions', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.feefineactions.create(body);
  });

  server.get('/feefineactions', (schema, request) => {
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

  server.get('/feefineactions/:id', (schema, request) => {
    return schema.feefineactions.find(request.params.id);
  });

  server.post('/transfers', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.transfers.create(body);
  });

  server.get('/transfers/:id', (schema, request) => {
    return schema.transfers.find(request.params.id);
  });

  server.post('/payments', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.payments.create(body);
  });

  server.get('/payments/:id', (schema, request) => {
    return schema.payments.find(request.params.id);
  });

  server.post('/waives', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.waivers.create(body);
  });

  server.get('/waives/:id', (schema, request) => {
    return schema.waivers.find(request.params.id);
  });

  server.del('/waives/:id', (schema, request) => {
    return schema.db.waivers.remove(request.params.id);
  });

  server.post('/comments', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.comments.create(body);
  });

  server.get('/comments/:id', (schema, request) => {
    return schema.comments.find(request.params.id);
  });
};
