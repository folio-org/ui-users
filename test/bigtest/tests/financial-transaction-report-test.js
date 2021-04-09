import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('Financial transaction detail report', () => {
  const users = new UsersInteractor();

  setupApplication();

  describe('When patron has financial transaction detail report permissions', () => {
    beforeEach(async function () {
      this.visit('/users?sort=Name');

      await users.whenLoaded();
      await users.headerDropdown.click();
    });

    it('should be present financial transaction detail report button', () => {
      expect(users.headerDropdownMenu.isFinancialTransactionReportBtnPresent).to.be.true;
    });
  });

  describe('When patron does not have financial transaction detail report permissions', () => {
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

    it('should not be present financial transaction detail report button', () => {
      expect(users.headerDropdownMenu.isFinancialTransactionReportBtnPresent).to.be.false;
    });
  });
});
