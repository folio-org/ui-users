import { Response } from '@bigtest/mirage';
/* istanbul ignore file */

export default (server) => {
  server.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
  server.create('owners', { owner: 'Main Admin0', desc: 'Owner FyF' });

  server.create('owners', { owner: 'Shared', desc: 'Owner Shared' });

  server.create('owners', { owner: 'Main Admin1', desc: 'Owner DGB' });

  server.create('owners', { owner: 'Main Admin2', desc: 'Owner CCH' });

  const ownerFeeFine = server.create('owners', { owner: 'Main Admin3', desc: 'Owner DGB' });
  server.createList('feefines', 4, { ownerId: ownerFeeFine.id });

  server.createList('service-point', 3);

  server.get('feefines');

  server.post('feefines', (schema, request) => {
    const json = JSON.parse(request.requestBody);
    const record = server.create('feefine', json);

    return record.attrs;
  });

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


  server.get('owners');

  server.post('owners', (schema, request) => {
    const json = JSON.parse(request.requestBody);
    const record = server.create('owners', json);
    return record.attrs;
  });

  server.delete('/owners/:id', (schema, request) => {
    const matchingowner = schema.db.owners.find(request.params.id);
    const matchingfeefines = schema.db.feefines.where({ ownerId: request.params.id });
    if (matchingfeefines.length > 0) {
      return new Response(400, { 'Content-Type': 'application/json' }, JSON.stringify({
        errors: [{
          title: 'An error has occurred'
        }]
      }));
    }
    if (matchingowner != null) {
      return schema.db.owners.remove(request.params.id);
    }
    return matchingowner;
  });

  server.put('owners/:id', (schema, request) => {
    const {
      params: { id },
      requestBody,
    } = request;
    const model = schema.owners.find(id);
    const json = JSON.parse(requestBody);

    model.update({ ...json });

    return model.attrs;
  });
};
