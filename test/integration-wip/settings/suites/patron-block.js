import test from '../../../helpers/base-steps/simulate-server';
import { store, routes } from '../../../helpers/server';

import {
  Alert,
  Button,
  Checkbox,
  Div,
  Form,
  InputNumber,
  Link,
  Nav,
  TextArea
} from '../../../interactors';

export default test('patron blocks')
  .child('limits', test => test
    .step('configure routes', async () => {
      routes.post('/patron-block-limits', function (schema, { requestBody }) {
        const json = JSON.parse(requestBody);
        const limit = store.create('patron-block-limit', json);
        return limit.attrs;
      });
    })
    .step(Link('Limits').click())
    .assertion(Nav('Module Settings', { listCount: 7 }).exists())
    .child('without preexisting limit', test => test
      .step(Link('Faculty').click())
      .assertion(Form('data-test-limits-form', { limitFieldCount: 6 }).exists())
      .assertion(Button('Save', { disabled: true }).exists())
      .child('create limit', test => test
        .step('input limit value', ({ condition }) => InputNumber(`${condition[0].name}`).fill(12))
        .assertion(Button('Save', { disabled: true }).absent())
        .child('submit limit', test => test
          .step(Button('Save').click())
          .assertion(Div.findByAttribute('data-test-callout-element').exists())))
      .child('set invalid negative limit', test => test
        .step('input limit value', ({ condition }) => InputNumber(`${condition[0].name}`).fill(-12))
        .assertion(Alert('Must be blank or a number from 1 to 999,999').exists()))
      .child('set invalid float limit', test => test
        .step('input limit value', ({ condition }) => InputNumber(`${condition[0].name}`).fill(12.5))
        .assertion(Alert('Must be blank or a number from 1 to 999,999').exists()))
      .child('set invalid negative fee fine', test => test
        .step('input limit value', ({ feeFineCondition }) => InputNumber(`${feeFineCondition.name}`).fill(-12))
        .assertion(Alert('Must be blank or a number from 0.01 to 999,999.99').exists()))
      .child('set valid float fee fine limit', test => test
        .step('input limit value', ({ feeFineCondition }) => InputNumber(`${feeFineCondition.name}`).fill(12.5))
        .step(Button('Save').click())
        .assertion(Div.findByAttribute('data-test-callout-element').exists()))))
  .child('conditions', test => test
    .step(Link('Conditions').click())
    .step('click on first condition', ({ condition }) => Link(`${condition[0].name}`).click())
    .assertion(Nav('Module Settings', { listCount: 6 }).exists())
    .assertion(Button('Save', { disabled: true }).exists())
    .child('change value', test => test
      .step(Checkbox('Block renewals').click())
      .step(Checkbox('Block request').click())
      .step(TextArea('Message to be displayed').fill('test'))
      .assertion(Button('Save', { disabled: true }).absent())
      .child('save value', test => test
        .step(Button('Save').click())
        .assertion(Div.findByAttribute('data-test-callout-element').exists()))));
