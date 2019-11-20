import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import InstanceViewPage from '../interactors/user-view-page';
import UserFormPage from '../interactors/user-form-page';

describe('User view', () => {
  before(function () {
    setupApplication();
  });

  let user;

  beforeEach(async function () {
    user = this.server.create('user');

    this.visit(`/users/view/${user.id}`);
  });

  it('displays the instance title in the pane header', () => {
    expect(InstanceViewPage.title).to.equal(user.username);
  });

  describe('pane header dropdown menu', () => {
    beforeEach(async () => {
      await InstanceViewPage.headerDropdown.click();
    });

    describe('clicking on edit', () => {
      beforeEach(async () => {
        await InstanceViewPage.headerDropdownMenu.clickEdit();
      });

      it('should redirect to instance edit page', () => {
        expect(UserFormPage.$root).to.exist;
      });
    });
  });
});
