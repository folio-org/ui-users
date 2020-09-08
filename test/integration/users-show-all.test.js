/* eslint-disable indent */
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import Button from '../interactors/Button';
import Checkbox from '../interactors/Checkbox';
import Link from '../interactors/Link';
import Table from '../interactors/Table';
import TableCell from '../interactors/TableCell';

export default test('', {
  permissions: ['manualblocks.collection.get', 'circulation.loans.collection.get']
})
  .step('seed data', async () => {
    const users = store.createList('user', 8);
    const user = users[0];

    return { users, user };
  })
  .step('visit "/users"', async () => {
    await App.visit('/users');
  })
  .step('select active and inactive users', async () => {
    await Checkbox('Active').click();
    await Checkbox('Inactive').click();
  })
  .child('reset all status filter', test => test
    .step('click reset all button', async () => {
      await Button.findById('clickable-reset-all').click();
    })
    .assertion('should display no users', async () => {
      await Table('list-users').absent();
    }))
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
    .step('click on loan accordion', () => Button.findById('accordion-toggle-button-loansSection').click())
    .child('clicking on the open loans link', test => test
      .step('clicking on the open loans link', () => Link('2 open loans').click())
      .step('clicking on the first loan', ({ openLoan }) => TableCell(openLoan.item.barcode.toString()).click())
      // confirm we're at the loan details page
      .step('clicking on the close botton on loan actions history', () => Button.findByAriaLabel('Close').click())
      .step('clicking on the close botton on open loans pane', () => Button.findByAriaLabel('Close').click())
      .assertion('loan accordion is displayed', () => Button.findById('accordion-toggle-button-loansSection').exists())) // assertion based on accordion button presence
    .child('clicking on the closed loans link', test => test
      .step('clicking on the open loans link', () => Link('2 closed loans').click())
      .step('clicking on the first loan', ({ closedLoan }) => TableCell(closedLoan.item.barcode.toString()).click())
      // confirm we're at the loan details page
      .step('clicking on the close botton on loan actions history', () => Button.findByAriaLabel('Close').click())
      .step('clicking on the close botton on open loans pane', () => Button.findByAriaLabel('Close').click())
      .assertion('loan accordion is displayed', () => Button.findById('accordion-toggle-button-loansSection').exists()))); // assertion based on accordion button presence
