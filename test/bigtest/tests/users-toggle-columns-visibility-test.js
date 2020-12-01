import {
  afterEach,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('Users list columns visibility', () => {
  setupApplication();

  const users = new UsersInteractor();

  beforeEach(async function () {
    this.server.createList('user', 10, { active: true });
    this.visit('/users?sort=Name');
    await users.whenLoaded();
    await users.activeUserCheckbox.clickActive();
  });

  it('"active" column is present by default', () => {
    expect(users.column('active').isPresent).to.be.true;
  });

  describe('open actions dropdown and uncheck the "active"-column', () => {
    beforeEach(async function () {
      await users.headerDropdown.click();
      await users.headerDropdownMenu.columnCheckbox('active').click();
    });

    it('hides the "active"-column', () => {
      expect(users.column('active').isPresent).to.be.false;
    });
  });

  describe('when the component mounts again', () => {
    it('persists the "active"-column visibility state', () => {
      expect(users.column('active').isPresent).to.be.false;
    });

    describe('click the "active" column checkbox again', () => {
      beforeEach(async function () {
        await users.headerDropdownMenu.columnCheckbox('active').click();
      });

      afterEach(async function () {
        await sessionStorage.clear();
      });

      it('re-enables the "active"-column', () => {
        expect(users.column('active').isPresent).to.be.true;
      });
    });
  });
});
