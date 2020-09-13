import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

import Checkbox from '../interactors/Checkbox';
import Table from '../interactors/Table';
// import Search from '../interactors/Search';
// import Button from '../interactors/Button';

export default test('status filter', {})
  .step('seed data', async () => {
    store.createList('user', 3, { active: true });
    store.createList('user', 8, { active: false });
    store.create('user', {
      active: true,
      personal: store.create('user-personal', { firstName: 'Mary', lastName: 'Poppins' })
    });
  })
  .step(App.visit('/users'))
  .child('show inactive users', test => test
    .step(Checkbox('Inactive').click())
    .assertion(Table('list-users').has({ dataRowCount: 8 })))
  .child('show active users', test => test
    .step(Checkbox('Active').click())
    .assertion(Table('list-users').has({ dataRowCount: 4 })))
  .child('show all users', test => test
    .step(Checkbox('Active').click())
    .step(Checkbox('Inactive').click()))
    .assertion(Table('list-users').has({ dataRowCount: 12 })));

// skipping because search function is broken; search for '/users' getter in network/config.js

// .child('search for users', test => test
//   .step(Search('input-user-search').fill('Mary Poppins'))
//   .step(Button.findById('submit-user-search').click())
//   .assertion(Table('').has({ dataRowCount: 1 })))
