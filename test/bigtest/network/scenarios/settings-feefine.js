import { Response } from '@bigtest/mirage';
/* istanbul ignore file */

export default (server) => {
  server.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
  const owner = server.create('owners', { owner: 'Main Admin0', desc: 'Owner FyF' });
  server.createList('payments', 7, { ownerId: owner.id });

  const ownerShared = server.create('owners', { owner: 'Shared', desc: 'Owner Shared' });
  server.createList('payments', 5, { ownerId: ownerShared.id });

  const owner1 = server.create('owners', { owner: 'Main Admin1', desc: 'Owner DGB' });
  server.createList('payments', 4, { ownerId: owner1.id });

  const otherOwner = server.create('owners', { owner: 'Main Admin2', desc: 'Owner CCH' });
  server.createList('payments', 5, { ownerId: otherOwner.id });

  const ownerFeeFine = server.create('owners', { owner: 'Main Admin3', desc: 'Owner DGB' });
  server.createList('feefines', 4, { ownerId: ownerFeeFine.id });

  server.createList('transfers', 2, { ownerId: owner1.id });

  server.createList('transfers', 3, { ownerId: otherOwner.id });

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


  server.get('payments');
  server.post('payments', (schema, request) => {
    const json = JSON.parse(request.requestBody);
    const record = server.create('payments', json);

    return record.attrs;
  });
  server.delete('payments/:id');

  server.put('payments/:id', (schema, request) => {
    const {
      params: { id },
      requestBody,
    } = request;
    const model = schema.payments.find(id);
    const json = JSON.parse(requestBody);

    model.update({ ...json });

    return model.attrs;
  });

  server.get('/transfers', (schema) => {
    return schema.transfers.all();
  });

  server.post('/transfers', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.transfers.create(body);
  });

  server.put('/transfers/:id', ({ transfers }, request) => {
    const matching = transfers.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    return matching.update(body);
  });

  server.delete('/transfers/:id');
};
