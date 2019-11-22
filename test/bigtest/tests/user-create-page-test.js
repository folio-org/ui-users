import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import UsersInteractor from '../interactors/users';

describe('User Create Page', () => {
  const users = new UsersInteractor();

  before(function () {
    setupApplication();
  });

  beforeEach(async function () {
    this.visit('/users');
    await users.clickCreateUserButton();
  });

  describe('visiting the create user page', () => {
    it('should display the title in the pane header', () => {
      expect(UserFormPage.title).to.equal('Create User');
    });

    it('should render a primary button', () => {
      expect(UserFormPage.submitButton.rendersPrimary).to.be.true;
    });

    it('should render a default button', () => {
      expect(UserFormPage.cancelButton.rendersDefault).to.be.true;
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
