import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import { feeFineBalanceId } from '../../src/constants';

import {
  Button,
  Form,
  Header,
  InputNumber,
  Link,
  Nav
} from '../interactors';

const validationMessage = 'Must be blank or a number from 1 to 999,999';
const feeFineValidationMessage = 'Must be blank or a number from 0.01 to 999,999.99';

export default test('patron block limits')
  .step('seed data', async () => {
    const condition = await store.createList('patronBlockCondition', 5);
    await store.create('patronBlockCondition', { id: feeFineBalanceId });
    const conditionData = condition.map((c) => c.attrs);
    return { conditionData };
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
        // 🧹 post error - check config
      )
    )
  )