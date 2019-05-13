/* istanbul ignore file */
import CQLParser from '../cql';

export default (server) => {
  const user = server.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
  server.createList('owner', 5);
  server.createList('feefine', 5);
  server.createList('transfers', 5);
  const account = server.create('accounts', { userId: user.id });
  server.createList('feefineactions', 5, { accountId: account.id });
  server.createList('accounts', 3, { userId: user.id });
  server.create('accounts', {
    userId: user.id,
    status: {
      name: 'Closed'
    },
    amount: 0,
    remaining: 0
  });
  server.create('comments');

  server.get('/accounts');
  server.get('/accounts/:id', (schema, request) => {
    return schema.accounts.find(request.params.id).attrs;
  });
  server.put('/accounts/:id', ({ accounts }, request) => {
    const matching = accounts.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    return matching.update(body);
  });
  server.get('/users');
  server.get('/owners');
  server.get('/feefines');
  server.get('/comments');
  server.get('/feefineactions');
  server.get('/transfers');

  server.post('/transfers', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.transfers.create(body);
  });

  server.put('/transfers/:id', ({ transfers }, request) => {
    const matching = transfers.find(request.params.id);
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
};
