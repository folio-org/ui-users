import faker from 'faker';
import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

// 🧹 the original test suite is incomplete

export default test('user notes flow')
  // .step('seed data', async () => {
  //   const user = store.create('user');
  //   const noteType = store.create('note-type', {
  //     id: 'noteType1',
  //     name: 'Test note type',
  //   });
  //   const userNote = store.create('note', {
  //     type: noteType.name,
  //     typeId: noteType.id,
  //     links: [{ type: 'user', id: user.id }],
  //   });
  //   store.create('note', {
  //     type: noteType.name,
  //     typeId: noteType.id,
  //     links: [{ type: 'user', id: 'someId' }],
  //   });
  //   store.create('note', {
  //     type: noteType.name,
  //     typeId: noteType.id,
  //     links: [{ type: 'user', id: 'someId2' }],
  //   });
  //   return { user, noteType, userNote };
  // })
  // .step('visit "/users/preview/user.id"', async ({ user }) => {
  //   await App.visit(`/users/preview/${user.id}`);
  // })
