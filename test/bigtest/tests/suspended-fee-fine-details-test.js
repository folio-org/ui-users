import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import translations from '../../../translations/ui-users/en';
import setupApplication from '../helpers/setup-application';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';
import FeeFineDetails from '../interactors/fee-fine-details';
import { refundClaimReturned } from '../../../src/constants';

describe('Test Suspended Fee/Fine details', () => {
  setupApplication({
    scenarios: ['suspended-fee-fine-details'],
    currentUser: {
      curServicePoint: { id: 1 },
    },
  });
  describe('visit Fee/fine details', () => {
    beforeEach(async function () {
      this.visit('/users/preview/ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd');
      await FeeFineHistoryInteractor.whenSectionLoaded();
      await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
      await FeeFineHistoryInteractor.openAccounts.click();
      await FeeFineHistoryInteractor.rows(3).click();
    });

    it('displays account actions section', () => {
      expect(FeeFineDetails.isPresent).to.be.true;
    });

    it('displays fee/fine details latest payment status', () => {
      expect(FeeFineDetails.latestPaymentStatus.label.text).to.equal(translations['details.field.latest']);
      expect(FeeFineDetails.latestPaymentStatus.value.text).to.string(refundClaimReturned.PAYMENT_STATUS);
    });
  });
});
