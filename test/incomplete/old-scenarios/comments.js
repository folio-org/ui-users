/* istanbul ignore file */

export default (server) => {
  server.get('/comments');

  server.post('/comments', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.comments.create(body);
  });

  server.put('/comments/:id', ({ comments }, request) => {
    const matching = comments.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    return matching.update(body);
  });
};
