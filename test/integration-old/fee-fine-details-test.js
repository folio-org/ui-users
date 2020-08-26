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

describe('Test Fee/Fine details', () => {
  setupApplication({ scenarios: ['fee-fine-details'] });
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

    it('displays fee/fine details overdue policy', () => {
      expect(FeeFineDetails.overduePolicy.label.text).to.equal(translations['loans.details.overduePolicy']);
      expect(FeeFineDetails.overduePolicy.value.text).to.equal('Overdue Fine Policy name');
    });

    it('displays fee/fine details lost item policy', () => {
      expect(FeeFineDetails.lostItemPolicy.label.text).to.equal(translations['loans.details.lostItemPolicy']);
      expect(FeeFineDetails.lostItemPolicy.value.text).to.equal('Lost Item Policy name');
    });

    it('displays fee/fine item instance and material type', () => {
      expect(FeeFineDetails.instanceAndType.label.text).to.equal(translations['details.field.instance.type']);
      expect(FeeFineDetails.instanceAndType.value.text).to.equal('GROẞE DUDEN3 (book)');
    });

    it('displays fee/fine item contributors', () => {
      expect(FeeFineDetails.contributors.label.text).to.equal(translations['reports.overdue.item.contributors']);
      expect(FeeFineDetails.contributors.value.text).to.equal('-');
    });

    describe('Overdue policy link', () => {
      beforeEach(async function () {
        await FeeFineDetails.overduePolicyClick();
      });

      it('should navigate to', function () {
        const path = '/settings/circulation/fine-policies/a6130d37-0468-48ca-a336-c2bde575768d';
        expect(this.location.pathname.endsWith(path)).to.be.true;
      });
    });

    describe('Lost item policy link', () => {
      beforeEach(async () => {
        await FeeFineDetails.lostItemPolicyClick();
      });

      it('should navigate to', function () {
        const path = '/settings/circulation/lost-item-fee-policy/48a3115d-d476-4582-b6a8-55c09eed7ec7';
        expect(this.location.pathname.endsWith(path)).to.be.true;
      });
    });
  });
});
