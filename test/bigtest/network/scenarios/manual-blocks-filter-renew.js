import CQLParser from '../cql';

export default (server) => {
  const usertmp = server.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });

  server.createList('manualblock', 2, { userId: usertmp.id, renewals: false, desc: 'No block renewals' });
  server.create('manualblock', { userId: usertmp.id, renewals: false, desc: 'Block for borrowing' });
  server.create('manualblock', { userId: usertmp.id, desc: 'Block for renewals' });


  server.get('/manualblocks', (schema, request) => {
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

  server.get('/manualblocks/:id', (schema, request) => {
    return schema.manualblocks.find(request.params.id);
  });

  server.put('/manualblocks/:id', ({ manualblocks }, request) => {
    const matching = manualblocks.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    return matching.update(body);
  });

  server.delete('manualblocks/:id', () => {});

  server.post('/manualblocks', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.manualblocks.create(body);
  });
};
