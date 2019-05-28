import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
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

    describe('pane header menu', () => {
      beforeEach(async () => {
        await UserFormPage.headerDropdown.click();
      });

      describe('clicking on cancel', () => {
        beforeEach(async () => {
          await UserFormPage.headerDropdownMenu.clickCancel();
        });

        it('should redirect to view users page after click', () => {
          expect(users.$root).to.exist;
        });
      });
    });
  });

  describe('validating user barcode', () => {
    beforeEach(async function () {
      await UserFormPage.barcodeField.fillAndBlur(user2.barcode);
      await UserFormPage.clickSave();
    });

    it('should display validation error', () => {
      expect(UserFormPage.barcodeError).to.equal('This barcode has already been taken');
    });
  });
});
