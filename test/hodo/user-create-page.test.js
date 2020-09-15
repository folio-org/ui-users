import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';

import Button from '../interactors/Button';
import Checkbox from '../interactors/Checkbox';
import Header from '../interactors/Header';
import Link from '../interactors/Link';
import Option from '../interactors/Option';
import Select from '../interactors/Select';
import Span from '../interactors/Span';

export default test('user create page')
  .step('visit "/users"', () => App.visit('/users'))
  .step(Button.findByAttribute('data-test-pane-header-actions-button').click())
  .step(Link('New').click())
  .assertion(Header.findByAttribute('data-test-pane-header-title').find(Span('data-test-header-title', { value: 'Create User' })).exists())
  .assertion(Button.findByAttribute('data-test-user-form-submit-button').exists())
  .assertion(Button.findByAttribute('data-test-user-form-cancel-button').exists())
  .child('cancel user create', test => test
    .step(Button.findByAttribute('data-test-user-form-cancel-button').click())
    .assertion(Header.findByAttribute('data-test-pane-heaeder-title').find(Span('data-test-header-title', { value: 'Create User' })).absent()))
  .child('request preferences', test => test
    .assertion(Checkbox('Hold Shelf', { enabled: false, value: 'true' }).exists())
    .assertion(Checkbox('Delivery', { value: 'false' }).exists())
    .child('when delivery box is checked', test => test
      .step(Checkbox('Delivery').click())
      .assertion(Select('Fulfillment preference', { value: 'Hold Shelf' }).exists())))
  .child('addresses', test => test
    .step(Button('Add address').click()) // this button returns an error
  //   .step(Select('Address Type').select('Home'))
  //   .step(Select('Default delivery address*').select('Home'))
  //   .assertion(Select('Default delivery address*').find(Option('Home', { value: 'Type2' })).exists())
  )