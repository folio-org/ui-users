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
    beforeEach(function () {
      openLoan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        overdueFinePolicyId: 'test',
        lostItemPolicyId: 'test',
        overdueFinePolicy: {
          'name': 'One Hour1'
        },
        lostItemPolicy: {
          'name': 'One Hour2'
        },
        item: {
          callNumberComponents: {
            prefix: 'prefix',
            callNumber: 'callNumber',
            suffix: 'suffix',
          },
          enumeration: 'enumeration',
          chronology: 'chronology',
          volume: 'volume',
        },
      });

      this.server.createList('loanaction', 5, { loan: { ...openLoan.attrs } });
      this.server.createList('request', requestsAmount, { itemId: openLoan.itemId });
    });

    describe('loans without fees/fines', () => {
      beforeEach(function () {
        this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
      });

      it('should be presented', () => {
        expect(LoanActionsHistory.isPresent).to.be.true;
      });

      it('having loan without fees/fines incurred should display the "-"', () => {
        expect(LoanActionsHistory.feeFines.text).to.equal('-');
      });

      it('loan call number should display the string', () => {
        const callNumber = 'prefix callNumber suffix enumeration chronology volume';

        expect(LoanActionsHistory.effectiveCallNumber.text).to.equal(callNumber);
      });

      it('should display close button', () => {
        expect(LoanActionsHistory.closeButton.isPresent).to.be.true;
      });
    });

    describe('loans with fees/fines', () => {
      beforeEach(function () {
        this.server.get('/accounts', {
          accounts: [{ amount: 200 }],
          totalRecords: 1,
        });

        this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
      });

      it('fields should be presented', () => {
        expect(LoanActionsHistory.overduePolicy.isPresent).to.be.true;
        expect(LoanActionsHistory.lostItemPolicy.isPresent).to.be.true;
      });

      it('should display the field name', () => {
        expect(LoanActionsHistory.overduePolicy.text).to.equal('One Hour1');
        expect(LoanActionsHistory.lostItemPolicy.text).to.equal('One Hour2');
      });

      describe('click Overdue Fine Policy link', () => {
        beforeEach(async () => {
          await LoanActionsHistory.clickLinkOverduePolicy();
        });

        it('should navigate to the user open loans list page', function () {
          expect(LoanActionsHistory.overduePolicy.isPresent).to.be.false;
          expect(this.location.pathname.endsWith(`/settings/circulation/fine-policies/${openLoan.overdueFinePolicyId}`)).to.be.true;
        });
      });

      describe('click Lost Item Fee Policy link', () => {
        beforeEach(async () => {
          await LoanActionsHistory.clickLinkLostItemPolicy();
        });

        it('should navigate to the user open loans list page', function () {
          expect(LoanActionsHistory.lostItemPolicy.isPresent).to.be.false;
          expect(this.location.pathname.endsWith(`/settings/circulation/lost-item-fee-policy/${openLoan.lostItemPolicyId}`)).to.be.true;
        });
      });
    });

    describe('having loan with fees/fines incurred', () => {
      beforeEach(function () {
        this.server.get('/accounts', {
          accounts: [{ amount: 200 }],
          totalRecords: 1,
        });

        this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
      });

      it('should display the fees/fines value', () => {
        expect(LoanActionsHistory.feeFines.text).to.equal('200.00');
      });
    });

    describe('requests', () => {
      describe('loan without loanPolicy', () => {
        beforeEach(function () {
          this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
        });

        it('should be presented', () => {
          expect(LoanActionsHistory.requests.isPresent).to.be.true;
        });

        it('should have proper value', () => {
          expect(LoanActionsHistory.requests.value.text).to.equal(requestsAmount.toString());
        });

        it('should have proper label', () => {
          expect(LoanActionsHistory.requests.label.text).to.equal(translations['loans.details.requestQueue']);
        });
      });

      describe('loan without loanPolicy', () => {
        beforeEach(function () {
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
      beforeEach(async function () {
        this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
        await LoanActionsHistory.closeButton.click();
      });

      it('should navigate to the user open loans list page', function () {
        expect(OpenLoansInteractor.isPresent).to.be.true;
        expect(this.location.pathname.endsWith(`/users/${openLoan.userId}/loans/open`)).to.be.true;
      });
    });

    describe('visiting the actions history of the closed loans', () => {
      let closedLoan;

      beforeEach(function () {
        closedLoan = this.server.create('loan', {
          status: { name: 'Closed' },
          loanPolicyId: 'test'
        });

        this.server.createList('loanaction', 5, { loan: { ...closedLoan.attrs } });
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
