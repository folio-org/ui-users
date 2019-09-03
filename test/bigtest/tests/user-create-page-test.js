import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import UsersInteractor from '../interactors/users';

describe('User Create Page', () => {
  setupApplication();

  const users = new UsersInteractor();

  beforeEach(async function () {
    this.visit('/users');
    await users.clickCreateUserButton();
  });

  describe('visiting the create user page', () => {
    it('displays the title in the pane header', () => {
      expect(UserFormPage.title).to.equal('Create User');
    });

    describe('clicking on cancel button', () => {
      beforeEach(async () => {
        await UserFormPage.cancelButton.click();
      });

      it('should redirect to view users page after click', () => {
        expect(users.$root).to.exist;
      });
    });
  });
});
