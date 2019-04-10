/* istanbul ignore file */

export default (server) => {
  const owner = server.create('owner', { owner: 'Diku' });

  server.create('template', { name: 'Template 1' });
  server.create('template', { name: 'Template 2' });
  server.create('feefine', { feeFineType: 'Feefine 1', ownerId: owner.attrs.id });

  server.get('owners');
  server.get('templates');

  server.get('feefines');
  server.delete('feefines/:id');

  server.put('feefines/:id', (schema, request) => {
    const {
      params: { id },
      requestBody,
    } = request;
    const model = schema.feefines.find(id);
    const json = JSON.parse(requestBody);

    model.update({ ...json });

    return model.attrs;
  });

  server.post('feefines', (schema, request) => {
    const json = JSON.parse(request.requestBody);
    const record = server.create('feefine', json);

    return record.attrs;
  });
};
