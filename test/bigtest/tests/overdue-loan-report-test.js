import { beforeEach, afterEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';


import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('OverdueLoanReport', () => {
  setupApplication();

  const users = new UsersInteractor();

  describe('Show export to CSV', function () {
    let Blob;
    let blobContent;

    beforeEach(async function () {
      this.server.createList('loan', 5);
      this.visit('/users?sort=Name');

      Blob = global.Blob;
      global.Blob = function (content) {
        blobContent = content;
      };

      await users.headerDropdown.click();
      await users.headerDropdownMenu.clickExportToCSV();
    });

    afterEach(function () {
      global.Blob = Blob;
    });

    it('exports data to csv and hides dropdown menu', () => {
      expect(users.headerDropdownMenu.exportBtnIsVisible).to.be.false;
      expect(blobContent).not.to.be.undefined;
    });
  });
});
