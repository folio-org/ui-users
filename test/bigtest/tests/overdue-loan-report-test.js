import { beforeEach, afterEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('OverdueLoanReport', () => {
  const users = new UsersInteractor();
  let xhr;
  let requests = [];

  setupApplication();

  describe('visit user-list', () => {
    beforeEach(async function () {
      this.server.createList('loan', 5, 'borrower');
      this.visit('/users?sort=Name');
      await users.whenLoaded();
    });

    describe('Show export to CSV', function () {
      beforeEach(async function () {
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function (req) { requests.push(req); };
        await users.headerDropdown.click();
        await users.headerDropdownMenu.clickExportToCSV();
      });

      afterEach(async function () {
        await xhr.restore();
      });

      it('hides dropdown menu', () => {
        expect(users.headerDropdownMenu.exportBtnIsVisible).to.be.false;
      });

      it('requests data', () => {
        expect(requests.length).to.equal(1);
      });
    });

    describe('Double-clicking the item does not download twice/clicking while download in progress', function () {
      beforeEach(async function () {
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function (req) { requests.push(req); };
        await users.headerDropdown.click();
        await users.headerDropdownMenu.clickExportToCSV();
        await users.headerDropdownMenu.clickExportToCSV();
      });

      afterEach(async function () {
        await xhr.restore();
      });

      it('request only happens once', () => {
        expect(requests.length).to.equal(1);
      });
    });
  });

  describe('When patron has view loans permissions', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'module.users.enabled': true,
        'ui-users.loans.view': true,
      },
    });

    beforeEach(async function () {
      this.visit('/users?sort=Name');
      await users.whenLoaded();
      await users.headerDropdown.click();
    });

    it('Overdue loans report button should be present', () => {
      expect(users.headerDropdownMenu.isExportBtnPresent).to.be.true;
    });
  });

  describe('When patron does not have view loans permissions', () => {
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

    it('Overdue loans report button should not be present', () => {
      expect(users.headerDropdownMenu.isExportBtnPresent).to.be.false;
    });
  });
});
