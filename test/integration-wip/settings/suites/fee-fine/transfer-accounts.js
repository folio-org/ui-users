import {
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
  .step(Link('Transfer accounts').click())
  .step(Select.findById('select-owner').select('Main Admin1'))
  .assertion(TableRowGroup().has({ dataRowContainerCount: 2 }))
  .assertion(Table('editList-settings-transfers', { dataColumnCount: 4 }).exists())
  .child('delete', test => test
    .step(Button.findById('clickable-delete-settings-transfers-0').click())
    .child('cancel delete', test => test
      .step(Button('Cancel').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 2 })))
    .child('confirm delete', test => test
      .step(Button('Delete').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 1 }))))
  .child('edit', test => test
    .step(Button.findById('clickable-edit-settings-transfers-0').click())
    .step(TextField.findByPlaceholder('accountName').fill('USA Bank3'))
    .step(TextField.findByPlaceholder('desc').fill('Transfer place3'))
    .child('cancel edit', test => test
      .step(Button('Cancel').click())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('USA Bank0')).exists())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Transfer place0')).exists()))
    .child('confirm edit', test => test
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('USA Bank3')).exists())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Transfer place3')).exists())))
  .child('add new transfer', test => test
    .step(Button.findById('clickable-add-settings-transfers').click())
    .step(TextField.findByPlaceholder('accountName').fill('USA Bank5'))
    .step(TextField.findByPlaceholder('desc').fill('Transfer place5'))
    .child('cancel addition', test => test
      .step(Button('Cancel').click())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('USA Bank0')).exists())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Transfer place0')).exists()))
    .child('confirm addition', test => test
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-2').find(TableCell('USA Bank5')).exists())
      .assertion(TableRow.findByDataRowIndex('row-2').find(TableCell('Transfer place5')).exists())));
