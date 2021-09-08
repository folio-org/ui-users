import { expect } from 'chai';
import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

import translations from '../../../translations/ui-users/en';

describe('RefundsReport', () => {
  const users = new UsersInteractor();

  setupApplication({
    scenarios: 'feefine-refund',
  });

  describe('Visit user list', () => {
    beforeEach(async function () {
      this.server.createList('owner', 2);
      this.visit('/users?sort=Name');
      await users.whenLoaded();
    });

    describe('Show refunds report modal', function () {
      beforeEach(async function () {
        await users.headerDropdown.click();
        await users.headerDropdownMenu.clickRefundsReportCSV();
      });

      it('save button should not be disabled', () => {
        expect(users.refundsReportModal.isSaveButtonDisabled).to.be.false;
      });
    });

    describe('Click refunds report button', function () {
      beforeEach(async function () {
        await users.headerDropdown.click();
        await users.headerDropdownMenu.clickRefundsReportCSV();
        await users.refundsReportModal.startDate.calendarButton.click();
        await users.refundsReportModal.startDate.calendar.days(1).click();
        await users.refundsReportModal.endDate.calendarButton.click();
        await users.refundsReportModal.endDate.calendar.days(2).click();
        await users.refundsReportModal.saveButton.click();
      });

      it('hides dropdown menu', () => {
        expect(users.headerDropdownMenu.isRefundReportBtnVisible).to.be.false;
      });
    });

    describe('Validation: end date after start date', function () {
      beforeEach(async function () {
        await users.headerDropdown.click();
        await users.headerDropdownMenu.clickRefundsReportCSV();
        await users.refundsReportModal.startDate.calendarButton.click();
        await users.refundsReportModal.startDate.calendar.days(2).click();
        await users.refundsReportModal.endDate.calendarButton.click();
        await users.refundsReportModal.endDate.calendar.days(1).click();
        await users.refundsReportModal.endDate.input.blur();
      });

      it('show validation message', () => {
        expect(users.refundsReportModal.endDateError).to.equal(translations['reports.refunds.validation.endDate']);
      });

      it('save button should be disabled', () => {
        expect(users.refundsReportModal.isSaveButtonDisabled).to.be.true;
      });
    });

    describe('Validation: missed start date', function () {
      beforeEach(async function () {
        await users.headerDropdown.click();
        await users.headerDropdownMenu.clickRefundsReportCSV();
        await users.refundsReportModal.startDate.input.blur();
        await users.refundsReportModal.endDate.calendarButton.click();
        await users.refundsReportModal.endDate.calendar.days(1).click();
        await users.refundsReportModal.endDate.input.blur();
      });

      it('show validation message', () => {
        expect(users.refundsReportModal.startDateError).to.equal(translations['reports.refunds.validation.startDate']);
      });

      it('save button should be disabled', () => {
        expect(users.refundsReportModal.isSaveButtonDisabled).to.be.true;
      });
    });

    describe('Submit form', function () {
      beforeEach(async function () {
        await users.headerDropdown.click();
        await users.headerDropdownMenu.clickRefundsReportCSV();
        await users.refundsReportModal.startDate.calendarButton.click();
        await users.refundsReportModal.startDate.calendar.days(1).click();
        await users.refundsReportModal.endDate.calendarButton.click();
        await users.refundsReportModal.endDate.calendar.days(2).click();
        await users.refundsReportModal.endDate.input.blur();
        await users.refundsReportModal.owners.clickOption(1);
        await users.refundsReportModal.saveButton.click();
      });

      it('should hide refund modal', () => {
        expect(users.isRefundsReportModalPresent).to.be.false;
      });

      it('show successfull callout', () => {
        expect(users.callout.successCalloutIsPresent).to.be.true;
      });
    });
  });

  describe('Handle error case', () => {
    describe('Data not found', () => {
      setupApplication({
        scenarios: 'feefine-refund-not-found',
      });

      beforeEach(async function () {
        this.server.createList('owner', 2);
        this.visit('/users?sort=Name');
        await users.whenLoaded();
      });

      describe('Submit form', function () {
        beforeEach(async function () {
          await users.headerDropdown.click();
          await users.headerDropdownMenu.clickRefundsReportCSV();
          await users.refundsReportModal.owners.clickOption(1);
          await users.refundsReportModal.saveButton.click();
        });

        it('show error callout', () => {
          expect(users.callout.errorCalloutIsPresent).to.be.true;
        });
      });
    });

    describe('Generation error', () => {
      setupApplication({
        scenarios: 'feefine-refund-error',
      });

      beforeEach(async function () {
        this.server.createList('owner', 2);
        this.visit('/users?sort=Name');
        await users.whenLoaded();
      });

      describe('Submit form', function () {
        beforeEach(async function () {
          await users.headerDropdown.click();
          await users.headerDropdownMenu.clickRefundsReportCSV();
          await users.refundsReportModal.owners.clickOption(1);
          await users.refundsReportModal.saveButton.click();
        });

        it('show error callout', () => {
          expect(users.callout.errorCalloutIsPresent).to.be.true;
        });
      });
    });
  });

  describe('When patron has view manual-process refunds report permissions', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'module.users.enabled': true,
        'ui-users.manualProcessRefundsReport': true,
      },
    });

    beforeEach(async function () {
      this.visit('/users?sort=Name');
      await users.whenLoaded();
      await users.headerDropdown.click();
    });

    it('"Refunds to process manually" should be present', () => {
      expect(users.headerDropdownMenu.isRefundsReportButtonPresent).to.be.true;
    });
  });

  describe('When patron does not have view manual-process refunds report permissions', () => {
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

    it('"Refunds to process manually" should not be present', () => {
      expect(users.headerDropdownMenu.isRefundsReportButtonPresent).to.be.false;
    });
  });
});
