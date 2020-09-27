import { App } from '@bigtest/interactor';
import test from '../../helpers/base-steps/simulate-server';

import {
  Alert,
  Button,
  Header,
  TableRow,
  TableRowGroup,
  TextField
} from '../../interactors';

export default test('settings departments')
  .step(App.visit('/settings/users/departments'))
  .assertion(Header('Departments').exists())
  .assertion(TableRowGroup().has({ dataRowContainerCount: 2 }))
  .assertion(TableRow.findByDataRowIndex('row-1').find(Button.findByAriaLabel('Delete this item')).absent())
  .child('create new department errors', test => test
    .step(Button.findById('clickable-add-departments').click())
    .child('pre-existing name', child => child
      .step(TextField.findByPlaceholder('name').fill('Test1'))
      .assertion(Alert('Name already exists').exists()))
    .child('pre-existing code', child => child
      .step(TextField.findByPlaceholder('code').fill('test1'))
      .assertion(Alert('Code already exists').exists()))
    .child('empty fields', child => child
      .step(TextField.findByPlaceholder('name').fill(''))
      .step(TextField.findByPlaceholder('code').fill(''))
      .assertion(Alert('Please fill this in to continue').exists())
      .assertion(Alert('Code is required').exists())));
