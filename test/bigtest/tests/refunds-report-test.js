import sinon from 'sinon';

import { expect } from 'chai';
import {
  afterEach,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

import translations from '../../../translations/ui-users/en';

describe.only('RefundsReport', () => {
  const users = new UsersInteractor();

  setupApplication();

  describe('Visit user list', () => {
    beforeEach(async function () {
      this.visit('/users?sort=Name');
      await users.whenLoaded();
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
  });
});
