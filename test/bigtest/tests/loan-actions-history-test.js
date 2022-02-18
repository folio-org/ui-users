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
  let accounts;

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

      accounts = [{
        amount : '200.0',
        remaining : '200.0',
        status : { name : 'Open' },
        paymentStatus : { name : 'Outstanding' },
        metadata: { createdDate: '2021-03-02T13:19:32.316+00:00' },
        barcode : openLoan.item.barcode,
        loanId : openLoan.id,
        userId : openLoan.userId,
        itemId : openLoan.item.id,
        id: 'account1',
      },
      {
        amount : '20.0',
        remaining : '20.0',
        status : { name : 'Open' },
        paymentStatus : { name : 'Outstanding' },
        metadata: { createdDate: '2021-03-02T13:19:33.316+00:00' },
        barcode : openLoan.item.barcode,
        loanId : openLoan.id,
        userId : openLoan.userId,
        itemId : openLoan.item.id,
        id: 'account2',
      }];

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

      it('having loan without fees/fines incurred should display the -', () => {
        expect(LoanActionsHistory.feeFineIncurredButton.isPresent).to.be.false;
        expect(LoanActionsHistory.feeFines.text).to.equal('-');
      });

      it('loan call number should display the string', () => {
        const callNumber = 'prefix callNumber suffix volume enumeration chronology';

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
          accounts: [{
            ...accounts[0],
            remaining : '0.0',
            status : { name : 'Closed' },
            paymentStatus : { name : 'Paid fully' },
          }],
          totalRecords: 1,
        });

        this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
      });

      it('should display the fees/fines value', () => {
        expect(LoanActionsHistory.feeFineIncurredButton.isPresent).to.be.true;
        expect(LoanActionsHistory.feeFineIncurredButton.text).to.equal('200.00');
      });

      describe('click on the fees/fines incurred value', () => {
        beforeEach(async () => {
          await LoanActionsHistory.feeFineIncurredButton.click();
          await LoanActionsHistory.whenFeesFinesDetailsPageLoaded();
        });

        it('should navigate to closed Fees/fines page', function () {
          const path = `/users/${openLoan.userId}/accounts/view/${accounts[0].id}`;

          expect(this.location.pathname.endsWith(path)).to.be.true;
        });
      });
    });

    describe('having loan with fees/fines incurred with Suspended payment status', () => {
      beforeEach(function () {
        this.server.get('/accounts', {
          accounts: [{
            ...accounts[0],
            status : { name : 'Open' },
            paymentStatus : { name : 'Suspended claim returned' },
          }],
          totalRecords: 1,
        });

        this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
      });

      it('should display the fees/fines value', () => {
        expect(LoanActionsHistory.feeFines.text).to.equal('200.00Suspended');
      });
    });

    describe('having loan with few close and open fees/fines', () => {
      beforeEach(function () {
        this.server.get('/accounts', {
          accounts: [{
            ...accounts[0],
            remaining : '0.0',
            status : { name : 'Closed' },
            paymentStatus : { name : 'Paid fully' },
          },
          {
            ...accounts[1],
            remaining : '20.0',
          }],
          totalRecords: 2,
        });

        this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
      });

      it('should display the fees/fines value', () => {
        expect(LoanActionsHistory.feeFineIncurredButton.isPresent).to.be.true;
        expect(LoanActionsHistory.feeFineIncurredButton.text).to.equal('220.00');
      });

      describe('click on the fees/fines incurred value', () => {
        beforeEach(async () => {
          await LoanActionsHistory.feeFineIncurredButton.click();
          await LoanActionsHistory.whenFeesFinesHistoryPageLoaded();
        });

        it('should navigate to all Fees/fines page', function () {
          const path = `/users/${openLoan.userId}/accounts/all`;

          expect(this.location.pathname.endsWith(path)).to.be.true;
        });
      });
    });

    describe('having loan with few closed fees/fines', () => {
      beforeEach(function () {
        this.server.get('/accounts', {
          accounts: [{
            ...accounts[0],
            remaining : '0.0',
            status : { name : 'Closed' },
            paymentStatus : { name : 'Paid fully' },
          },
          {
            ...accounts[1],
            remaining : '0.0',
            status : { name : 'Closed' },
            paymentStatus : { name : 'Transferred fully' },
          }],
          totalRecords: 2,
        });

        this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
      });

      it('should display the fees/fines value', () => {
        expect(LoanActionsHistory.feeFineIncurredButton.isPresent).to.be.true;
        expect(LoanActionsHistory.feeFineIncurredButton.text).to.equal('220.00');
      });

      describe('click on the fees/fines incurred value', () => {
        beforeEach(async () => {
          await LoanActionsHistory.feeFineIncurredButton.click();
          await LoanActionsHistory.whenFeesFinesHistoryPageLoaded();
        });

        it('should navigate to closed Fees/fines page', function () {
          const path = `/users/${openLoan.userId}/accounts/closed`;

          expect(this.location.pathname.endsWith(path)).to.be.true;
        });
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

  describe('Loans without action', () => {
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

      this.server.createList('loanaction', 2, { loan: { ...openLoan.attrs } });
      this.server.createList('loanaction', 2, { loan: { ...openLoan.attrs, action: '' } });
      this.server.createList('request', 2, { itemId: openLoan.itemId });
      this.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
    });

    it('only renders loan actions with action present', () => {
      expect(LoanActionsHistory.loanActions.rowCount).to.equal(2);
    });
  });
});
