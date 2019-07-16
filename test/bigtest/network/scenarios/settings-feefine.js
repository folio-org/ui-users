import { Response } from '@bigtest/mirage';
import CQLParser from '../cql';
/* istanbul ignore file */

export default (server) => {
  server.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
  server.create('owners', { owner: 'Main Admin0', desc: 'Owner FyF' });

  server.create('owners', { owner: 'Shared', desc: 'Owner Shared' });

  const owner1 = server.create('owners', { owner: 'Main Admin1', desc: 'Owner DGB' });

  const otherOwner = server.create('owners', { owner: 'Main Admin2', desc: 'Owner CCH' });

  const ownerFeeFine = server.create('owners', { owner: 'Main Admin3', desc: 'Owner DGB' });
  server.createList('feefines', 4, { ownerId: ownerFeeFine.id });

  server.createList('transfers', 2, { ownerId: owner1.id });

  server.createList('transfers', 3, { ownerId: otherOwner.id });

  server.createList('payments', 5, { ownerId: owner1.id });

  server.createList('refunds', 5);

  server.createList('waivers', 5);

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

  server.get('/transfers', (schema, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');

    if (cqlQuery != null) {
      const cqlParser = new CQLParser();
      cqlParser.parse(cqlQuery);
      if (cqlParser.tree.field === 1) {
        return schema.transfers.all();
      }

      return schema.transfers.all();
    }

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

  server.del('/transfers/:id', (schema, request) => {
    return schema.db.transfers.remove(request.params.id);
  });

  server.get('/refunds', (schema, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');

    if (cqlQuery != null) {
      const cqlParser = new CQLParser();
      cqlParser.parse(cqlQuery);
      if (cqlParser.tree.field === 1) {
        return schema.refunds.all();
      }

      return schema.refunds.all();
    }

    return schema.refunds.all();
  });

  server.post('/refunds', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.refunds.create(body);
  });

  server.put('/refunds/:id', ({ refunds }, request) => {
    const matching = refunds.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    return matching.update(body);
  });

  server.del('/refunds/:id', (schema, request) => {
    return schema.db.refunds.remove(request.params.id);
  });

  server.get('/waives', (schema, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');

    if (cqlQuery != null) {
      const cqlParser = new CQLParser();
      cqlParser.parse(cqlQuery);
      if (cqlParser.tree.field === 1) {
        return schema.waivers.all();
      }

      return schema.waivers.all();
    }

    return schema.waivers.all();
  });

  server.post('/waives', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.waivers.create(body);
  });

  server.put('/waives/:id', ({ waivers }, request) => {
    const matching = waivers.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    return matching.update(body);
  });

  server.del('/waives/:id', (schema, request) => {
    return schema.db.waivers.remove(request.params.id);
  });

  server.get('/payments', (schema, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');

    if (cqlQuery != null) {
      const cqlParser = new CQLParser();
      cqlParser.parse(cqlQuery);
      if (cqlParser.tree.field === 1) {
        return schema.payments.all();
      }

      return schema.payments.all();
    }

    return schema.payments.all();
  });

  server.post('/payments', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    return schema.payments.create(body);
  });

  server.put('/payments/:id', ({ payments }, request) => {
    const matching = payments.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    return matching.update(body);
  });

  server.del('/payments/:id', (schema, request) => {
    return schema.db.payments.remove(request.params.id);
  });
};
