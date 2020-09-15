import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import {
  Button,
  Checkbox,
  Link,
  Section,
  Table,
  TableCell
} from '../interactors';

export default test('user loans', {
  permissions: ['manualblocks.collection.get', 'circulation.loans.collection.get']
})
  .step('seed data', async () => {
    const users = store.createList('user', 8);
    const user = users[0];
    return { users, user };
  })
  .step('visit "/users"', () => App.visit('/users'))
  .step(Checkbox('Active').click())
  .step(Checkbox('Inactive').click())
  .child('reset all status filter', test => test
    .step(Button.findById('clickable-reset-all').click())
    .assertion(Table('list-users').absent()))
  .child('clicking on user', test => test
    .step('', async ({ user }) => {
      const openLoan = store.create('loan', {
        action: 'claimedReturned',
        status: { name: 'Open' },
        userId: user.id,
        loanPolicyId: 'test'
      });
      const closedLoan = store.create('loan', {
        status: { name: 'Closed' },
        userId: user.id,
        loanPolicyId: 'test'
      });
      return { openLoan, closedLoan };
    })
    .step('click on first user', ({ user }) => TableCell(user.username).click())
    .step(Button.findById('accordion-toggle-button-loansSection').click())
    .child('clicking on the open loans link', test => test
      .step(Link('2 open loans').click())
      .step('clicking on the first loan', ({ openLoan }) => TableCell(openLoan.item.barcode.toString()).click())
      .step(Button.findByAriaLabel('C').click())
      .step(Button.findByAriaLabel('C').click())
      .assertion(Button.findById('accordion-toggle-button-loansSection').exists())
      .assertion(Section('pane-loandetails').absent())
      .assertion(Section('pane-loanhistory').absent()))
    .child('clicking on the closed loans link', test => test
      .step(Link('2 closed loans').click())
      .step('clicking on the first loan', ({ closedLoan }) => TableCell(closedLoan.item.barcode.toString()).click())
      .step(Button.findByAriaLabel('C').click())
      .step(Button.findByAriaLabel('C').click())
      .assertion(Button.findById('accordion-toggle-button-loansSection').exists())
      .assertion(Section('pane-loandetails').absent())
      .assertion(Section('pane-loanhistory').absent())));
