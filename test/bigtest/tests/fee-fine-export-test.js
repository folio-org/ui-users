import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { visit } from '@bigtest/react';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import FeeFineDetails from '../interactors/fee-fine-details';

describe('Export fee/fine', () => {
  setupApplication();

  describe('visit Fee/Fine details page', () => {
    let user;
    let account;

    beforeEach(async function () {
      user = this.server.create('user');
      account = this.server.create('account', { userId: user.id });

      this.server.create('feefineaction');
      this.server.get('/accounts');

      visit(`/users/${user.id}/accounts/view/${account.id}`);
    });

    it('should display export fee fine report button', () => {
      expect(FeeFineDetails.exportAccountActionsHistoryReport.isPresent).to.be.true;
    });

    describe('Export Fees/Fines report', () => {
      beforeEach(async () => {
        await FeeFineDetails.exportAccountActionsHistoryReportButton.click();
      });

      it('show successfull callout', () => {
        expect(FeeFineDetails.callout.successCalloutIsPresent).to.be.true;
      });
    });
  });
});
