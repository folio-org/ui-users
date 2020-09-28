import {
  Alert,
  Button,
  Checkbox,
  Div,
  Link,
  Paragraph,
  Select,
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
  TextField
} from '../../../../interactors';

export default test => test
  .step(Link('Manual charges').click())
  .assertion(TableRowGroup().has({ dataRowContainerCount: 1 }))
  .assertion(Table('editList-settings-feefines', { dataColumnCount: 5 }).exists())
  .child('delete charge', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Delete this item')).click())
    .assertion(Paragraph('The Fee/Fine Type Feefine 1 will be deleted.').exists())
    .child('cancel deletion', test => test
      .step(Button('Cancel').click())
      .assertion(Paragraph('The Fee/Fine Type Feefine 1 will be deleted.').absent())
      .assertion(Table('editList-settings-feefines', { dataColumnCount: 5 }).exists()))
    .child('confirm deletion', test => test
      .step(Button('Delete').click())
      .step(Div.findByAttribute('data-test-callout-element').find(Div('The Fee/Fine Type Feefine 1 was successfully deleted')).exists())
      .assertion(TableRow().absent())))
  .child('edit change', test => test
    .step(TableRow.findByDataRowIndex('row-0').find(Button.findByAriaLabel('Edit this item')).click())
    .step(TextField.findByPlaceholder('defaultAmount').fill('300'))
    .step(Select.findByName('items[0].actionNoticeId').select('Template 1'))
    .child('cancel edit', test => test
      .step(Button('Cancel').click())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('1050.00')).exists()))
    .child('confirm edit', test => test
      .step(Button('Save').click())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('300.00')).exists())
      .assertion(TableRow.findByDataRowIndex('row-0').find(TableCell('Template 1')).exists())))
  .child('create new', test => test
    .step(Button.findById('clickable-add-settings-feefines').click())
    .step(TextField.findByPlaceholder('feeFineType').fill('New feefine'))
    .step(TextField.findByPlaceholder('defaultAmount').fill('100'))
    .step(Select.findByName('items[0].chargeNoticeId').select('Template 3'))
    .step(Button('Save').click())
    .assertion(TableRowGroup().has({ dataRowContainerCount: 2 }))
    .assertion(TableRow.findByDataRowIndex('row-1').find(TableCell('New feefine')).exists())
    .assertion(TableRow.findByDataRowIndex('row-1').find(TableCell('100.00')).exists())
    .assertion(TableRow.findByDataRowIndex('row-1').find(TableCell('Template 3')).exists()))
  .child('create new with error', test => test
    .step(Button.findById('clickable-add-settings-feefines').click())
    .child('fee/fine type when empty', step => step
      .step(TextField.findByPlaceholder('feeFineType').fill(''))
      .assertion(Button('Save', { disabled: true }).exists())
      .assertion(Alert('Please fill this in to continue').exists()))
    .child('duplicate fee/fine type', step => step
      .step(TextField.findByPlaceholder('feeFineType').fill('Damage camera fee0'))
      .assertion(Button('Save', { disabled: true }).exists())
      .assertion(Alert('Fee/fine type exists for owner Main Admin3').exists()))
    .child('amount is non numeric', test => test
      .step(TextField.findByPlaceholder('defaultAmount').fill('hundred'))
      .assertion(Button('Save', { disabled: true }).exists())
      .assertion(Alert('Default Amount must be numeric').exists()))
    .child('amount is negative', test => test
      .step(TextField.findByPlaceholder('defaultAmount').fill('-100'))
      .assertion(Button('Save', { disabled: true }).exists())
      .assertion(Alert('Default Amount must be positive').exists())))
  .child('owner charge notice', test => test
    .step(Select.findById('select-owner').select('Main Admin3'))
    .step(Button('Edit').click())
    .step(Select.findByName('defaultChargeNoticeId').select('Template 3'))
    .step(Select.findByName('defaultActionNoticeId').select('Template 2'))
    .child('cancel edit', test => test
      .step(Button.findById('charge-notice-cancel').click())
      .assertion(Div.findById('defaultChargeNoticeId', { value: '-' }).exists())
      .assertion(Div.findById('defaultActionNoticeId', { value: '-' }).exists()))
    .child('save edit', test => test
      .step(Button('Save').click())
      .assertion(Div.findById('defaultChargeNoticeId', { value: 'Template 3' }).exists())
      .assertion(Div.findById('defaultActionNoticeId', { value: 'Template 2' }).exists())))
  .child('copy feefines to another owner', test => test
    .step(Select.findById('select-owner').select('Main Admin1'))
    .step(Select.findByName('ownerId').select('Main Admin3'))
    .child('select "No" and continue', test => test
      .step(Checkbox('No').click())
      .step(Button('Continue').click())
      .assertion(TableRow().absent()))
    .child('select "Yes" and continue', test => test
      .step(Button('Continue').click())
      .assertion(Table('editList-settings-feefines', { dataColumnCount: 5 }).exists())));
