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
  let user;

  beforeEach(async function () {
    user = this.server.create('user');

    this.visit(`/users/view/${user.id}?layer=edit`);
    await UserFormPage.whenLoaded();
  });

  describe('visiting the edit user page', () => {
    it('displays the title in the pane header', () => {
      expect(UserFormPage.title).to.equal(user.username);
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
});
