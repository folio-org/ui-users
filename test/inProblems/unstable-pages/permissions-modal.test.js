import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';

const permissionsAmount = 10;
const permissionSetsAmount = 1;

export default test('permissions modal')
  .step('seed data', async () => {
    store.createList('permission', permissionsAmount);
    const permissionSets = store.createList('permission', permissionSetsAmount, { mutable: true });
    const user = store.create('user');
    return { permissionSets, user };
  })
  .step('query routes', async () => {
    routes.get('/comments');
    routes.post('/comments', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      return schema.comments.create(body);
    });
    routes.put('/comments/:id', ({ comments }, request) => {
      const matching = comments.find(request.params.id);
      const body = JSON.parse(request.requestBody);
      return matching.update(body);
    });
  })
  .step('visit "/users/user.id/edit', ({ user }) => App.visit(`/users/${user.id}/edit`))
