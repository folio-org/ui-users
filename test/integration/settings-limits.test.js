import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';

import { feeFineBalanceId } from '../../src/constants';

import {
  Alert,
  Button,
  Div,
  Form,
  Header,
  InputNumber,
  Link,
  Nav
} from '../interactors';

export default test('patron block limits')
  .step('seed data', async () => {
    const condition = await store.createList('patronBlockCondition', 5);
    const feeFineCondition = await store.create('patronBlockCondition', { id: feeFineBalanceId });
    const conditionData = condition.map((c) => c.attrs);
    return { conditionData, feeFineCondition };
  })
  .step('query routes', async () => {
    routes.post('/patron-block-limits', function (schema, { requestBody }) {
      const json = JSON.parse(requestBody);
      const limit = store.create('patron-block-limit', json);
      return limit.attrs;
    });
  })
  .step(App.visit('/settings/users/limits'))
  .assertion(Header('Limits').exists())
  .assertion(Nav('Module Settings', { listCount: 7 }).exists())
  .child('visit group', test => test
    .step(Link('Faculty').click())
    .assertion(Header('Faculty').exists())
    .assertion(Form('data-test-limits-form', { limitFieldCount: 6 }).exists())
    .assertion(Button('Save', { disabled: true }).exists())
    .child('create limit', test => test
      .step('input limit value', ({ conditionData }) => InputNumber(`${conditionData[0].name}`).fill(12))
      .assertion(Button('Save', { disabled: true }).absent())
      .child('submit limit', test => test
        .step(Button('Save').click())
        .assertion(Div.findByAttribute('data-test-callout-element').exists())))
    .child('set invalid limit value', test => test
      .child('negative value', test => test
        .step('input limit value', ({ conditionData }) => InputNumber(`${conditionData[0].name}`).fill(-12))
        .assertion(Alert('Must be blank or a number from 1 to 999,999').exists()))
      .child('float value', test => test
        .step('input limit value', ({ conditionData }) => InputNumber(`${conditionData[0].name}`).fill(12.5))
        .assertion(Alert('Must be blank or a number from 1 to 999,999').exists())))
    .child('set invalid fee fine limit', test => test
      .child('negative value', test => test
        .step('input limit value', ({ feeFineCondition }) => InputNumber(`${feeFineCondition.name}`).fill(-12))
        .assertion(Alert('Must be blank or a number from 0.01 to 999,999.99').exists())))
    .child('float value', test => test
      .step('input limit value', ({ feeFineCondition }) => InputNumber(`${feeFineCondition.name}`).fill(12.5))
      .step(Button('Save').click())
      .assertion(Div.findByAttribute('data-test-callout-element').exists())))
  .child('visit group with preexisting limit', test => test
    .step('seed more data', async ({ conditionData }) => {
      await store.create('patronBlockLimit', {
        conditionId: conditionData[0].id,
        patronGroupId: 'group4',
        value: 13,
      });
    })
    .step(App.visit('/settings/users/limits/group4'))
    .assertion(Header('Faculty').exists())
    .assertion(Form('data-test-limits-form', { limitFieldCount: 6 }).exists())
    .child('remove limit value', test => test
      .step('input limit value', ({ conditionData }) => InputNumber(`${conditionData[0].name}`).fill(''))
      .assertion(Button('Save', { disabled: true }).absent())
      .child('save form value', test => test
        .step(Button('Save').click())
        .assertion(Div.findByAttribute('data-test-callout-element').exists())))
    .child('update limit value', test => test
      .step('input limit value', ({ conditionData }) => InputNumber(`${conditionData[0].name}`).fill('2'))
      .assertion(Button('Save', { disabled: true }).absent())
      .child('save form value', test => test
        .step(Button('Save').click())
        .assertion(Div.findByAttribute('data-test-callout-element').exists()))));
