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
    const loan = this.server.create('loan', {
      status: { name: 'Closed' },
      feesAndFines : { amountRemainingToPay: 200 },
      userId: user.id
    });

    setupAnonymizationAPIResponse(this.server, [{
      message: 'haveAssociatedFeesAndFines',
      parameters: [{
        key: 'loanIds',
        value: JSON.stringify([loan]),
      }]
    }]);

    this.visit(`/users/${user.id}/loans/closed`);

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
