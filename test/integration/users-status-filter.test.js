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
  .step('visit "/users"', async () => {
    await App.visit('/users');
  })
  .child('show inactive users', test => test
    .step('select inactive users', async () => {
      await Checkbox('Inactive').click();
    })
    .assertion('should be the correct amount of inactive users', async () => {
      await Table('list-users').has({ dataRowCount: 8 });
    }))
  .child('show active users', test => test
    .step('select active users', async () => {
      await Checkbox('Active').click();
    })
    .assertion('should be the correct amount of inactive users', async () => {
      await Table('list-users').has({ dataRowCount: 4 });
    }))
  .child('show all users', test => test
    .step('select active and inactive users', async () => {
      await Checkbox('Active').click();
      await Checkbox('Inactive').click();
    })
    .assertion('should be the correct amount of inactive users', async () => {
      await Table('list-users').has({ dataRowCount: 12 });
    }));

// skipping because search function is broken; search for '/users' getter in network/config.js

// .child('search for users', test => test
//   .step('enter a search query', async () => {
//     await Search('input-user-search').fill('Mary Poppins');
//     await Button.findById('submit-user-search').click();
//   })
//   .assertion('should be the correct amount of inactive users', async () => {
//     await Table('').has({ dataRowCount: 1 });
//   })
// )
