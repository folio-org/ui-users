import {
  Alert,
  Button,
  Div,
  Link,
  ListItem,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
  TextField
} from '../../../../interactors';

export default test => test
  .step(Link('Owners').click())
  .assertion(Table('editList-settings-owners', { dataColumnCount: 4 }).exists())
  .assertion(TableRowGroup().has({ dataRowContainerCount: 5 }))
  .child('delete', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findById('clickable-delete-settings-owners-0')).click())
    .assertion(Paragraph('The Fee/fine Owner Main Admin0 will be deleted.').exists())
    .child('cancel delete', test => test
      .step(Button('Cancel').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 5 })))
    .child('confirm delete', test => test
      .step(Button('Delete').click())
      .assertion(TableRowGroup().has({ dataRowContainerCount: 4 }))))
  .child('edit', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findById('clickable-edit-settings-owners-0')).click())
    .step(TextField.findByPlaceholder('owner').fill('Main Admin10'))
    .step(TextField.findByPlaceholder('desc').fill('Owner Test'))
    .child('cancel edit', test => test
      .step(Button('Cancel').click())
      .assertion(TableRow.findByDataRowIndex('row-0')
        .find(TableCell('Main Admin0'))
        .exists())
      .assertion(TableRow.findByDataRowIndex('row-0')
        .find(TableCell('Owner FyF'))
        .exists()))
    .child('save edit', test => test
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-1')
        .find(TableCell('Main Admin10'))
        .exists())
      .assertion(TableRow.findByDataRowIndex('row-1')
        .find(TableCell('Owner Test'))
        .exists())))
  .child('adding owner', test => test
    .step(Button.findById('clickable-add-settings-owners').click())
    .child('submit new owner', test => test
      .step(TextField.findByPlaceholder('owner').fill('Main CUIB'))
      .step(TextField.findByPlaceholder('desc').fill('CUIB'))
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-4')
        .find(TableCell('Main CUIB'))
        .exists())
      .assertion(TableRow.findByDataRowIndex('row-4')
        .find(TableCell('CUIB'))
        .exists()))
    .child('type pre-existing owner', test => test
      .step(TextField.findByPlaceholder('owner').fill('Main Admin0'))
      .assertion(Alert('Fee/fine Owner already exists').exists())
      .assertion(Button('Save', { disabled: true }).exists())))
  .child('edit service-point', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findById('clickable-edit-settings-owners-0')).click())
    .step(TextField.findByPlaceholder('owner').fill('Main Admin10'))
    .step(TextField.findByPlaceholder('desc').fill('Owner Test'))
    .step(Button.findByAriaLabel('open menu').click())
    .step(ListItem('owner-service-point-main-item-0').click())
    .step(Button('Save').click())
    .assertion(Div.findByAriaLabelledBy('owner-service-point-label').absent()));
