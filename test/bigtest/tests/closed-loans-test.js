import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import ClosedLoansInteractor from '../interactors/closed-loans';

function setupAnonymizationAPIResponse(server, errors) {
  server.post('/loan-anonymization/by-user/:id', { errors });
}

describe('Closed Loans', () => {
  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    },
  });

  beforeEach(async function () {
    const user = this.server.create('user');
    const loans = this.server.createList('loan', 5, 'feesAndFines', {
      userId: user.id,
      item: (i) => ({ ...this.item, barcode: i }),
      status: { name: 'Closed' }
    });

    setupAnonymizationAPIResponse(this.server, [{
      message: 'haveAssociatedFeesAndFines',
      parameters: [{
        key: 'loanIds',
        value: JSON.stringify([loans[0]]),
      }]
    }]);

    this.visit(`/users/${loans[0].userId}/loans/closed`);

    await ClosedLoansInteractor.whenLoaded();
  });

  it('should be presented', () => {
    expect(ClosedLoansInteractor.isPresent).to.be.true;
  });

  describe('loan list', () => {
    it('should be presented', () => {
      expect(ClosedLoansInteractor.list.isPresent).to.be.true;
    });
  });

  describe('sorting loan list', () => {
    let firstRowValue;
    beforeEach(async () => {
      firstRowValue = ClosedLoansInteractor.list.rows(0).cells(2).text;
      await ClosedLoansInteractor.list.headers(2).click();
      await ClosedLoansInteractor.list.headers(2).click();
    });

    it('re-orders the rows', () => {
      expect(firstRowValue).to.not.equal(ClosedLoansInteractor.list.rows(0).cells(2).text);
    });
  });

  describe('anonymizing loans without fee/fines', () => {
    beforeEach(async function () {
      setupAnonymizationAPIResponse(this.server, []);
      await ClosedLoansInteractor.anonymizeButton.click();
    });

    it('should not be prevented and error modal should not be shown', () => {
      expect(ClosedLoansInteractor.anonymizationFeesFinesErrorModal.isPresent).to.be.false;
    });
  });

  describe('anonymizing loans with fee/fines', () => {
    beforeEach(async () => {
      await ClosedLoansInteractor.anonymizeButton.click();
    });

    it('should be prevented and error modal should be shown', () => {
      expect(ClosedLoansInteractor.anonymizationFeesFinesErrorModal.isPresent).to.be.true;
    });

    describe('clicking on the confirmation button in the error modal', () => {
      beforeEach(async () => {
        await ClosedLoansInteractor.anonymizationConfirmButton.click();
      });

      it('should close the error modal', () => {
        expect(ClosedLoansInteractor.anonymizationFeesFinesErrorModal.isPresent).to.be.false;
      });
    });
  });
});
