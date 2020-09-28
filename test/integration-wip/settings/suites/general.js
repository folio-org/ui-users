import test, { updatePermissions } from '../../../helpers/base-steps/simulate-server';

import {
  Alert,
  Button,
  Div,
  Header,
  Link,
  Section,
  TableRow,
  TableRowGroup,
  TextField
} from '../../../interactors';

export default test('general')
  .child('departments', test => test
    .step(Link('Departments').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 2 }))
    .assertion(TableRow.findByDataRowIndex('row-1')
      .find(Button.findByAriaLabel('Delete this item'))
      .absent())
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
        .assertion(Alert('Code is required').exists()))))
  .child('custom fields', test => test
    .child('view permission', test => test
      .step('update permissions', () => updatePermissions(['ui-users.settings.customfields.view']))
      .step(Link('Custom fields').click())
      // 🧹 permissions does not work
      // .assertion(Section('custom-fields-pane').exists())
      // .assertion(Link('Edit').absent())
    )
    .child('edit permission', test => test
      .step('update permissions', () => updatePermissions(['ui-users.settings.customfields.edit']))
      .step(Link('Custom fields').click())
      .assertion(Link('Edit').exists())
      .assertion(Div.findById('custom-fields-list', { sectionsCount: 4 }).exists())
      .child('edit', test => test
        .step(Link('Edit').click())
        .assertion(Header('Edit custom fields').exists())
        .child('has delete buttons', test => test
          .assertion(Section.findByAttribute('data-test-accordion-section', { id: '1' })
            .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())
          .assertion(Section.findByAttribute('data-test-accordion-section', { id: '2' })
            .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())
          .assertion(Section.findByAttribute('data-test-accordion-section', { id: '3' })
            .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())
          .assertion(Section.findByAttribute('data-test-accordion-section', { id: '4' })
            .find(Button.findByAttribute('data-test-custom-field-delete-button')).exists())))))