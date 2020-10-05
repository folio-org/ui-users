import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import {
  Button,
  Div
} from '../interactors';

export default test('overdue loan report')
  .step('seed data', async () => {
    store.createList('loan', 5, 'borrower');
  })
  .step(App.visit('/users'))
  .step(Button('Actions').click())
  .step(Button('Overdue loans report (CSV)').click())
  .assertion(Div({ attribute: 'data-test-callout-element' }).exists());
