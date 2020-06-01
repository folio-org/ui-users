/* istanbul ignore file */
import CQLParser from '../cql';

export default (server) => {
  const user = server.create('user', { id: 'user1' });

  server.createList('automatedPatronBlock', 3);
  server.create('automatedPatronBlock', {
    'blockBorrowing': true,
    'blockRenewal': false,
    'blockRequest': false,
    'message': 'Patron has reached maximum allowed number of items charged out'
  });

  server.get('/automated-patron-blocks', (schema, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');
    if (cqlQuery != null) {
      const cqlParser = new CQLParser();
      cqlParser.parse(cqlQuery);
      if (cqlParser.tree.term) {
        return schema.automatedPatronBlocks.where({
          patronId: cqlParser.tree.term
        });
      }
    }
    return schema.automatedPatronBlocks.all();
  });

  server.get('/automated-patron-blocks/:patronId', (schema, request) => {
    return schema.automatedPatronBlocks.find(request.params.id);
  });

  // server.put('/automated-patron-blocks/:id', ({ automatedPatronBlocks }, request) => {
  //   const matching = automatedPatronBlocks.find(request.params.id);
  //   const body = JSON.parse(request.requestBody);

  //   return matching.update(body);
  // });

  //server.delete('automated-patron-blocks/:id', () => {});

  // server.post('/automated-patron-blocks', (schema, request) => {
  //   const body = JSON.parse(request.requestBody);

  //   return schema.automatedPatronBlocks.create(body);
  // });
};
