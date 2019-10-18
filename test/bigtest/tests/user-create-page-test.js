import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { location } from '@bigtest/react';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
// eslint-disable-next-line import/no-duplicates
import UserFormPage from '../interactors/user-form-page';
import UsersInteractor from '../interactors/users';
import InstanceViewPage from '../interactors/user-view-page';

describe('User create', () => {
  setupApplication();

  const users = new UsersInteractor();

  beforeEach(async function () {
    this.visit('/users?sort=name&layer=create');
  });

  it('should open create user page', function () {
    expect(location().search).to.to.equal('?sort=name&layer=create');
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

    describe('filling create user form', () => {
      const lastName = 'Test';
      const email = 'test@test.com';

      beforeEach(async function () {
        await UserFormPage.lastNameField.fillAndBlur(lastName);
        await UserFormPage.selectPatronGroup('graduate (Graduate Student)');
        await UserFormPage.usernameField.fillAndBlur(' test');
        await UserFormPage.passwordField.fillAndBlur('test');
        await UserFormPage.emailField.fillAndBlur(email);
        await UserFormPage.submitButton.click();
      });

      it('should display the title in the pane header', () => {
        expect(InstanceViewPage.userNameTitle).to.equal(lastName);
      });

      it('should display the user email in contact information accordion', () => {
        expect(InstanceViewPage.userContactsEmail.value.text).to.equal(email);
      });
    });
  });
});
