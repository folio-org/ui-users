import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { routes } from '../helpers/server';

import {
  Button,
  ColumnDiv,
  Div,
  Form,
  Header,
  Option,
  Select
} from '../interactors';

// 🧹 the original tests for this component is not so great. i just translated them over to the new bigtest

export default test('fee/fines comments')
  .step('configure routes', async () => {
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
  .assertion(Form.findById('form-require-comment').find(Div.findById('paid')).find(ColumnDiv('Require comment when fee/fine fully/partially paid')).exists())
  .assertion(Form.findById('form-require-comment').find(Div.findById('waived')).find(ColumnDiv('Require comment when fee/fine fully/partially waived')).exists())
  .assertion(Form.findById('form-require-comment').find(Div.findById('refunded')).find(ColumnDiv('Require comment when fee/fine fully/partially refunded')).exists())
  .assertion(Form.findById('form-require-comment').find(Div.findById('transferredManually')).find(ColumnDiv('Require comment when fee/fine fully/partially transferred')).exists())
  .child('submit comments', test => test
    .step(Select.findByName('waived').select('Yes'))
    .step(Select.findByName('refunded').select('Yes'))
    .step(Button('Save').click())
    // .assertion(Select.findByName('paid').find(Option('Yes', { value: 'false' })).exists())
    // .assertion(Select.findByName('waived').find(Option('Yes', { value: 'true' })).exists())
    // .assertion(Select.findByName('refunded').find(Option('Yes', { value: 'true' })).exists())
    // .assertion(Select.findByName('transferredManually').find(Option('Yes', { value: 'false' })).exists())
    );
