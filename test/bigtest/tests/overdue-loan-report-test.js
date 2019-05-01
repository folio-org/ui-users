import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('OverdueLoanReport', () => {
  setupApplication();

  const users = new UsersInteractor();

  describe('Show export to CSV', function () {
    beforeEach(async function () {
      this.server.createList('loan', 5);
      this.visit('/users?sort=Name');

      await users.headerDropdown.click();
      await users.headerDropdownMenu.clickExportToCSV();
    });

    it('exports data to csv and hides dropdown menu', () => {
      expect(users.headerDropdownMenu.exportBtnIsVisible).to.be.false;
    });
  });
});
