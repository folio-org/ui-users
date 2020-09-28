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
  .step(Link('Refund reasons').click())
  .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
  .assertion(Table('editList-settings-refunds', { dataColumnCount: 4 }).exists())
  .child('delete', test => test
    .step(Button.findById('clickable-delete-settings-refunds-0').click())
    .child('cancel delete', test => test
      .step(Button('Cancel').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 5 })))
    .child('confirm delete', test => test
      .step(Button('Delete').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 4 }))))
  .child('edit', test => test
    .step(Button.findById('clickable-edit-settings-refunds-0').click())
    .step(TextField.findByPlaceholder('nameReason').fill('Reason10'))
    .step(TextField.findByPlaceholder('description').fill('Reason Desc10'))
    .child('cancel edit', test => test
      .step(Button('Cancel').click())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Reason0')).exists())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Reason Desc0')).exists()))
    .child('confirm edit', test => test
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Reason10')).exists())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Reason Desc10')).exists())))
  .child('add a refund', test => test
    .step(Button.findById('clickable-add-settings-refunds').click())
    .step(TextField.findByPlaceholder('nameReason').fill('Reason10'))
    .step(TextField.findByPlaceholder('description').fill('Reason Desc10'))
    .step(Button('Save').click())
    .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Reason10')).exists())
    .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Reason Desc10')).exists()))
  .child('add a pre-existing refund', test => test
    .step(Button.findById('clickable-add-settings-refunds').click())
    .step(TextField.findByPlaceholder('nameReason').fill('Reason1'))
    .step(Button('Save').click())
    .assertion(Alert('Refund reason already exists').exists()));
