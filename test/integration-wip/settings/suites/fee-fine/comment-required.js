import {
  Button,
  ColumnDiv,
  Div,
  Form,
  Link,
  Select
} from '../../../../interactors';

export default test => test
  .step(Link('Comment required').click())
  .assertion(Form.findById('form-require-comment')
    .find(Div.findById('paid'))
    .find(ColumnDiv('Require comment when fee/fine fully/partially paid'))
    .exists())
  .assertion(Form.findById('form-require-comment')
    .find(Div.findById('waived'))
    .find(ColumnDiv('Require comment when fee/fine fully/partially waived'))
    .exists())
  .assertion(Form.findById('form-require-comment')
    .find(Div.findById('refunded'))
    .find(ColumnDiv('Require comment when fee/fine fully/partially refunded'))
    .exists())
  .assertion(Form.findById('form-require-comment')
    .find(Div.findById('transferredManually'))
    .find(ColumnDiv('Require comment when fee/fine fully/partially transferred'))
    .exists())
  .child('submit comments', test => test
    .step(Select.findByName('waived').select('Yes'))
    .step(Select.findByName('refunded').select('Yes'))
    .step(Button('Save').click())
    .assertion(Div.findByAttribute('data-test-callout-element').exists()));
