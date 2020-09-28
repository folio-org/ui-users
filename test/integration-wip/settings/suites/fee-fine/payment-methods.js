import {
  Alert,
  Button,
  Link,
  Select,
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
  TextField
} from '../../../../interactors';

export default test => test
  .step(Link('Payment methods').click())
  .step(Select.findById('select-owner').select('Main Admin1'))
  .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
  .assertion(Table('editList-settings-payments', { dataColumnCount: 4 }).exists())
  .child('delete', test => test
    .step(Button.findById('clickable-delete-settings-payments-0').click())
    .child('cancel delete', test => test
      .step(Button('Cancel').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 5 })))
    .child('confirm delete', test => test
      .step(Button('Delete').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 4 }))))
  .child('edit', test => test
    .step(Button.findById('clickable-edit-settings-payments-0').click())
    .step(TextField.findByPlaceholder('nameMethod').fill('Cash10'))
    .step(Select.findByName('items[0].allowedRefundMethod').select('Yes'))
    .child('cancel edit', test => test
      .step(Button('Cancel').click())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Cash0')).exists())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('No')).exists()))
    .child('confirm edit', test => test
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Cash10')).exists())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Yes')).exists())))
  .child('add a payment', test => test
    .step(Button.findById('clickable-add-settings-payments').click())
    .step(TextField.findByPlaceholder('nameMethod').fill('Cash10'))
    .step(Select.findByName('items[0].allowedRefundMethod').select('Yes'))
    .step(Button('Save').click())
    .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Cash10')).exists())
    .assertion(TableRow.findByDataRowIndex('row-5').find(TableCell('Yes')).exists()))
  .child('add a pre-existing payment', test => test
    .step(Button.findById('clickable-add-settings-payments').click())
    .step(TextField.findByPlaceholder('nameMethod').fill('Cash2'))
    .assertion(Alert('Payment method already exists').exists()));
