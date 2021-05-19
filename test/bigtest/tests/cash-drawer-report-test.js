import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('Cash drawer reconciliation report', () => {
  const users = new UsersInteractor();

  setupApplication();

  describe('When patron has cash drawer reconciliation report permissions', () => {
    beforeEach(async function () {
      this.visit('/users?sort=Name');

      await users.whenLoaded();
      await users.headerDropdown.click();
    });

    it('should be present cash drawer reconciliation report button', () => {
      expect(users.headerDropdownMenu.isCashDrawerReportBtnPresent).to.be.true;
    });
  });

  describe('When patron does not have cash drawer reconciliation report permissions', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'module.users.enabled': true,
      },
    });

    beforeEach(async function () {
      this.visit('/users?sort=Name');

      await users.whenLoaded();
      await users.headerDropdown.click();
    });

    it('should not be present cash drawer reconciliation report button', () => {
      expect(users.headerDropdownMenu.isCashDrawerReportBtnPresent).to.be.false;
    });
  });
});
