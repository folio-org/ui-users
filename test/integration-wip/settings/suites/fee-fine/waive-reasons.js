import {
  Alert,
  Button,
  Link,
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
  TextField
} from '../../../../interactors';

export default test => test
  .step(Link('Waive reasons').click())
  .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
  .assertion(Table('editList-settings-waives', { dataColumnCount: 4 }).exists())
  .child('delete and cancel', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Delete this item')).click())
    .step(Button('Cancel').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 5 })))
  .child('delete and confirm', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Delete this item')).click())
    .step(Button('Delete').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 4 })))
  .child('edit and cancel', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Edit this item')).click())
    .step(TextField.findByPlaceholder('nameReason').fill('First time offender99'))
    .step(Button('Cancel').click())
    .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('First time offender0')).exists()))
  .child('edit and save', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Edit this item')).click())
    .step(TextField.findByPlaceholder('nameReason').fill('First time offender99'))
    .step(Button('Save').click())
    .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('First time offender99')).exists()))
  .child('add a waive', test => test
    .step(Button.findById('clickable-add-settings-waives').click())
    .step(TextField.findByPlaceholder('nameReason').fill('First time offender10'))
    .step(TextField.findByPlaceholder('description').fill('Penalty abatement10'))
    .step(Button('Save').click())
    .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('First time offender10')).exists())
    .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Penalty abatement10')).exists()))
  .child('add a pre-existing waive', test => test
    .step(Button.findById('clickable-add-settings-waives').click())
    .step(TextField.findByPlaceholder('nameReason').fill('First time offender1'))
    .step(Button('Save').click())
    .assertion(Alert('Waive reason already exists').exists()));
