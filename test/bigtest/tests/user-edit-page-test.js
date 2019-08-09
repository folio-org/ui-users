import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import InstanceViewPage from '../interactors/user-view-page';
import UsersInteractor from '../interactors/users';

describe('ItemEditPage', () => {
  setupApplication();

  const users = new UsersInteractor();
  let user1;
  let user2;

  beforeEach(async function () {
    user1 = this.server.create('user');
    user2 = this.server.create('user');

    this.visit(`/users/view/${user1.id}?layer=edit`);
    await UserFormPage.whenLoaded();
  });

  describe('visiting the edit user page', () => {
    it('displays the title in the pane header', () => {
      expect(UserFormPage.title).to.equal(user1.username);
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

  describe('validating user barcode', () => {
    beforeEach(async function () {
      await UserFormPage.barcodeField.fillAndBlur(user2.barcode);
      await UserFormPage.submitButton.click();
    });

    it('should display validation error', () => {
      expect(UserFormPage.feedbackError).to.equal('This barcode has already been taken');
    });
  });

  describe('validating empty user barcode', () => {
    beforeEach(async function () {
      await UserFormPage.barcodeField.fillAndBlur('');
      await UserFormPage.submitButton.click();
    });

    it('should show user detail view', () => {
      expect(InstanceViewPage.isVisible).to.equal(true);
    });
  });

  describe('validating username', () => {
    beforeEach(async function () {
      await UserFormPage.usernameField.fillAndBlur(user2.username);
      await UserFormPage.submitButton.click();
    });

    it('should display validation error', () => {
      expect(UserFormPage.feedbackError).to.equal('This username already exists');
    });
  });
});
