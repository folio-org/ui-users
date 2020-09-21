import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';

import {
  AddressForm,
  Alert,
  Button,
  Checkbox,
  Div,
  Header,
  Link,
  Option,
  Select,
  Span,
  TextField
} from '../interactors';

// 🧹 unstable page

export default test('user create page')
  .step(App.visit('/users'))
  .step(Button.findByAttribute('data-test-pane-header-actions-button').click())
  .step(Link('New').click())
  .assertion(Header.findByAttribute('data-test-pane-header-title').find(Span('data-test-header-title', { value: 'Create User' })).exists())
  .assertion(Button('Cancel').exists())
  .assertion(Button('Save & close').exists())
  // .child('cancel user create', test => test
  //   .step(Button.findByAttribute('data-test-user-form-cancel-button').click())
  //   .assertion(Header('Create User').absent()))
  // .child('request preferences', test => test
  //   .assertion(Checkbox('Hold Shelf', { enabled: false, value: 'true' }).exists())
  //   .assertion(Checkbox('Delivery', { value: 'false' }).exists())
  //   .child('when delivery box is checked', test => test
  //     .step(Checkbox('Delivery').click())
  //     .assertion(Select('Fulfillment preference', { value: 'Hold Shelf' }).exists())))
  // .child('addresses', test => test
  //   .step(Button('Add address').click())
  //   .step(Select('Address Type').select('Home'))
  //   .step(Select('Default delivery address*').select('Home'))
  //   .assertion(Select('Default delivery address*').find(Option('Home', { value: 'Type2' })).exists())
  //   .child('change selected default address type', test => test
  //     .step(Select('Address Type').select('Order'))
  //     .assertion(Select('Default delivery address*', { value: '' }).exists())
  //     .assertion(Div.findByAttribute('data-test-default-delivery-address-field').find(Alert('Please fill this in to continue')).exists()))
  //   .child('delete selected default address type', test => test
  //     .step(Button('Add address').click())
  //     .step(Select.findById('select-30').select('Order'))
  //     .step(AddressForm.findByHeaderLabel('Address1').find(Button.findByAttribute('data-test-delete-address-button')).click())
  //     .assertion(Select('Default delivery address*', { value: '' }).exists())
  //     .assertion(Div.findByAttribute('data-test-default-delivery-address-field').find(Alert('Please fill this in to continue')).exists()))
  //   .child('delete all address types', test => test
  //     .step(Select.findById('select-30').select('Order'))
  //     .step(Select('Default delivery address*').select('Order'))
  //     .step(AddressForm.findByHeaderLabel('Address2').find(Button.findByAttribute('data-test-delete-address-button')).click())
  //     .step(AddressForm.findByHeaderLabel('Address1').find(Button.findByAttribute('data-test-delete-address-button')).click())
  //     .assertion(Select('Default delivery address*', { value: '' }).exists())
  //     .assertion(Div.findByAttribute('data-test-default-delivery-address-field').find(Alert('Please, add at least one address inside "Addresses" section')).exists())))
  // .child('display reset password link', test => test
  //   .step(TextField.findById('adduser_username').fill('username'))
  //   .assertion(Link('Password Reset').exists()));

// 🧹 last assertion broken because password reset button is nowhere to be found
