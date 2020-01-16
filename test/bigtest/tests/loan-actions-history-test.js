import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import LoanActionsHistory from '../interactors/loan-actions-history';
import OpenLoansInteractor from '../interactors/open-loans';
import ClosedLoansInteractor from '../interactors/closed-loans';

import translations from '../../../translations/ui-users/en';

describe('loans actions history', () => {
  const requestsAmount = 2;

  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    }
  });

  let openLoan;

  describe('visit open loan details', () => {
    beforeEach(async function () {
      openLoan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test'
      });

      this.server.createList('loanactions', 5, { loan: { ...openLoan.attrs } });
      this.server.createList('request', requestsAmount, { itemId: openLoan.itemId });

      this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
    });

    it('should be presented', () => {
      expect(LoanActionsHistory.isPresent).to.be.true;
    });

    it('having loan without fees/fines incurred should display the "-"', () => {
      expect(LoanActionsHistory.feeFines.text).to.equal('-');
    });

    it('should display close button', () => {
      expect(LoanActionsHistory.closeButton.isPresent).to.be.true;
    });

    describe('having loan with fees/fines incurred', () => {
      beforeEach(async function () {
        this.server.get('/accounts', {
          accounts: [{ amount: 200 }],
          totalRecords: 1,
        });
      });

      it('should display the fees/fines value', () => {
        expect(LoanActionsHistory.feeFines.text).to.equal('200.00');
      });
    });

    describe('requests', () => {
      it('should be presented', () => {
        expect(LoanActionsHistory.requests.isPresent).to.be.true;
      });

      it('should have proper value', () => {
        expect(LoanActionsHistory.requests.value.text).to.equal(requestsAmount.toString());
      });

      it('should have proper label', () => {
        expect(LoanActionsHistory.requests.label.text).to.equal(translations['loans.details.requestQueue']);
      });

      describe('loan without loanPolicy', () => {
        beforeEach(async function () {
          const loan = this.server.create('loan', { status: { name: 'Open' } });

          this.server.createList('request', requestsAmount, { itemId: loan.itemId });
          this.visit(`/users/${loan.userId}/loans/${loan.id}`);
        });

        it('should not be presented', () => {
          expect(LoanActionsHistory.requests.isPresent).to.be.false;
        });
      });
    });

    describe('clicking the close button', () => {
      beforeEach(async () => {
        await LoanActionsHistory.closeButton.click();
      });

      it('should navigate to the user open loans list page', function () {
        expect(OpenLoansInteractor.isPresent).to.be.true;
        expect(this.location.pathname.endsWith(`/users/${openLoan.userId}/loans/open`)).to.be.true;
      });
    });

    describe('visiting the actions history of the closed loans', () => {
      let closedLoan;

      beforeEach(async function () {
        closedLoan = this.server.create('loan', {
          status: { name: 'Closed' },
          loanPolicyId: 'test'
        });

        this.server.createList('loanactions', 5, { loan: { ...closedLoan.attrs } });
        this.server.createList('request', requestsAmount, { itemId: closedLoan.itemId });

        this.visit(`/users/${closedLoan.userId}/loans/view/${closedLoan.id}`);
      });

      it('should display the close button', () => {
        expect(LoanActionsHistory.closeButton.isPresent).to.be.true;
      });

      describe('clicking the close button', () => {
        beforeEach(async () => {
          await LoanActionsHistory.closeButton.click();
        });

        it('should navigate to the user closed loans list page', function () {
          expect(ClosedLoansInteractor.isPresent).to.be.true;
          expect(this.location.pathname.endsWith(`/users/${closedLoan.userId}/loans/closed`)).to.be.true;
        });
      });
    });
  });
});
