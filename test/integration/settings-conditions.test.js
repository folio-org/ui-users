import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import {
  Button,
  Checkbox,
  Div,
  Form,
  Nav,
  TextArea
} from '../interactors';

export default test('patron block conditions')
  .step('seed data', async () => {
    const condition = store.createList('patronBlockCondition', 6);
    return { condition };
  })
  .step(App.visit('/settings/users/conditions'))
  .assertion(Nav('Module Settings', { listCount: 6 }).exists())
  .child('visit condition form', test => test
    .step('seed data', async ({ condition }) => {
      const conditionData = condition.map((c) => c.attrs);
      return { conditionData };
    })
    .step('visit "/settings/users/conditions/conditionData[0].id"', ({ conditionData }) => App.visit(`/settings/users/conditions/${conditionData[0].id}`))
    .assertion(Form('data-test-conditions-form').exists())
    .assertion(Checkbox('Block borrowing').exists())
    .assertion(Checkbox('Block renewals').exists())
    .assertion(Checkbox('Block request').exists())
    .assertion(TextArea('Message to be displayed*').exists())
    .assertion(Button('Save', { disabled: true }).exists())
    .child('change value', test => test
      .step(Checkbox('Block renewals').click())
      .assertion(Button('Save', { disabled: true }).absent())
      .child('saving change', test => test
        .step(Button('Save').click())
        .assertion(Div.findByAttribute('data-test-callout-element').exists()))));

// 🧹 the reason why the last assertion was randomly failing is because the checkbox values are randomized and in order for the save to trigger, one of the three checkboxes must be checked. i changed the factory default of the renewal checkbox to be false to ensure one of the checkboxes will be changed to true for the last assertion.
