import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { routes } from '../helpers/server';

import { Button, Div, Header, Option, Select } from '../interactors';

// 🧹 these tests are not so great

export default test('fee/fines comments')
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
  .step(App.visit('/settings/users/comments'))
  .assertion(Header('Fee/fine: Comment required').exists())
  .assertion(Div.findById('paid', { value: 'Require comment when fee/fine fully/partially paid' }).exists())
  .assertion(Div.findById('waived', { value: 'Require comment when fee/fine fully/partially waived' }).exists())
  .assertion(Div.findById('refunded', { value: 'Require comment when fee/fine fully/partially refunded' }).exists())
  .assertion(Div.findById('transferredManually', { value: 'Require comment when fee/fine fully/partially transferred' }).exists())
  .child('submit comments', test => test
    .step(Select.findByName('waived').select('Yes'))
    .step(Select.findByName('refunded').select('Yes'))
    .step(Button('Save').click())
    // .assertion(Select.findByName('paid').find(Option('Yes', { value: 'false' })).exists())
    // .assertion(Select.findByName('waived').find(Option('Yes', { value: 'true' })).exists())
    // .assertion(Select.findByName('refunded').find(Option('Yes', { value: 'true' })).exists())
    // .assertion(Select.findByName('transferredManually').find(Option('Yes', { value: 'false' })).exists())
    );
