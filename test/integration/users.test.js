import { App } from '@bigtest/interactor';
import test, { updatePermissions } from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import {
  Button,
  Checkbox,
  Link,
  Search,
  Section,
  Table,
  TableCell
} from '../interactors';

export default test('users', {
  permissions: ['manualblocks.collection.get', 'circulation.loans.collection.get']
})
  .step('seed data', async () => {
    const users = store.createList('user', 3, { active: true });
    const user = users[0];
    store.createList('user', 8, { active: false });
    store.create('user', {
      active: true,
      personal: store.create('user-personal', { firstName: 'Mary', lastName: 'Poppins' })
    });
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
    console.log('hi', user)
    return { user, openLoan, closedLoan };
  })
  .step(App.visit('/users'))
  .step(Checkbox('Active').click())
  .step(Checkbox('Inactive').click())
  .assertion(Table('list-users').has({ dataRowCount: 12 }))
  .child('status filter', test => test
    .child('show inactive users', test => test
      .step(Checkbox('Active').click())
      .assertion(Table('list-users').has({ dataRowCount: 8 })))
    .child('show active users', test => test
      .step(Checkbox('Inactive').click())
      .assertion(Table('list-users').has({ dataRowCount: 4 })))
    // .child('search for users', test => test
    //   // 🧹  search function is broken
    //   .step(Search('input-user-search').fill('Mary Poppins'))
    //   .step(Button.findById('submit-user-search').click())
    //   .assertion(Table().has({ dataRowCount: 1 })))
    .child('reset all status filter', test => test
      .step(Button.findById('clickable-reset-all').click())
      .assertion(Table('list-users').absent())))
  .child('click user', test => test
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
