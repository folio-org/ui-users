import { beforeEach, afterEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('OverdueLoanReport', () => {
  setupApplication();

  const users = new UsersInteractor();
  let xhr;
  let requests = [];
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
