import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application';
import LoanActionsHistory from '../interactors/loan-actions-history';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';
import OpenLoansInteractor from '../interactors/open-loans';
import { refundClaimReturned } from '../../../src/constants';
import DummyComponent from '../helpers/DummyComponent';


describe('Test autoclose feefine after missing or declare lost (claim returned)', () => {
  const requestsPath = '/requests';
  const requestsAmount = 5;

  setupApplication({
    permissions: {
      'circulation.loans.collection.get': true,
    },
    currentUser: {
      curServicePoint: { id: 1 },
    },
    modules: [{
      type: 'app',
      name: '@folio/ui-requests',
      displayName: 'requests',
      route: requestsPath,
      module: DummyComponent,
    }],
  });

  describe('Visiting loan details page with claimed returned item', () => {
    let loan;
    beforeEach(async function () {
      loan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'claimedReturned',
        actionComment: 'Claim returned confirmation',
        item: { status: { name: 'Claimed returned' } },
        itemStatus: 'Claimed returned',
        claimedReturnedDate: new Date().toISOString(),
      });
      this.server.createList('request', requestsAmount, { itemId: loan.itemId });


      this.server.create('user', { id: loan.userId });

      this.server.create('loanaction', {
        loan: {
          ...loan.attrs,
        },
      });

      const lostItemFee = this.server.create('account', {
        userId: loan.userId,
        status: {
          name: 'Open',
        },
        amount: 200,
        remaining: 200,
        feeFineType: 'Lost item fee',
        loanId: loan.id,
      });

      this.server.create('feefineaction', {
        userId: loan.userId,
        typeAction: 'Lost item fee',
        accountId: lostItemFee.id,
        amountAction: 200,
        balance: 200
      });

      const lostItemProcessingFee = this.server.create('account', {
        userId: loan.userId,
        status: {
          name: 'Open',
        },
        amount: 100,
        remaining: 100,
        feeFineType: 'Lost item processing fee',
        loanId: loan.id,
      });

      this.server.create('feefineaction', {
        userId: loan.userId,
        typeAction: 'Lost item processing fee',
        accountId: lostItemProcessingFee.id,
        amountAction: 100,
        balance: 100
      });

      this.server.get('/feefineactions');
      this.server.get('/accounts');
      this.visit(`/users/${loan.userId}/accounts/open`);
    });

    describe('Go to accounts', () => {
      beforeEach(async function () {
        await FeeFineHistoryInteractor.openMenu.click();
      });

      it('Check fee-fine, status LOST_ITEM_FEE', () => {
        expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(0).cells(3).text).to.equal(refundClaimReturned.LOST_ITEM_FEE);
      });

      it('Check fee-fine, status LOST_ITEM_PROCESSING_FEE', () => {
        expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(1).cells(3).text).to.equal(refundClaimReturned.LOST_ITEM_PROCESSING_FEE);
      });
    });

    describe('Check actions when item is claim returned', () => {
      describe('Select one feefine and chack actions', () => {
        beforeEach(async function () {
          await FeeFineHistoryInteractor.rows(0).cells(0).selectOne();
        });
        it('Check payButton is disable', () => {
          expect(FeeFineHistoryInteractor.payButton.isDisabled).to.be.true;
        });

        it('Check waiveButton is disable', () => {
          expect(FeeFineHistoryInteractor.waiveButton.isDisabled).to.be.true;
        });

        it('Check transferButton is disable', () => {
          expect(FeeFineHistoryInteractor.transferButton.isDisabled).to.be.true;
        });

        it('Check transferButton is disable', () => {
          expect(FeeFineHistoryInteractor.refundButton.isDisabled).to.be.true;
        });

        it('Check exportButton is enable', () => {
          expect(FeeFineHistoryInteractor.exportButton.isDisabled).to.be.false;
        });
      });

      describe('Select all checkboxes', () => {
        beforeEach(async function () {
          await FeeFineHistoryInteractor.selectAllCheckbox();
        });

        it('Check payButton is disable', () => {
          expect(FeeFineHistoryInteractor.payButton.isDisabled).to.be.true;
        });

        it('Check waiveButton is disable', () => {
          expect(FeeFineHistoryInteractor.waiveButton.isDisabled).to.be.true;
        });

        it('Check transferButton is disable', () => {
          expect(FeeFineHistoryInteractor.transferButton.isDisabled).to.be.true;
        });

        it('Check transferButton is disable', () => {
          expect(FeeFineHistoryInteractor.refundButton.isDisabled).to.be.true;
        });

        it('Check exportButton is enable', () => {
          expect(FeeFineHistoryInteractor.exportButton.isDisabled).to.be.false;
        });
      });
    });

    describe('Go to loan details', () => {
      beforeEach(async function () {
        await this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
      });

      it('should show declare lost button', () => {
        expect(LoanActionsHistory.declareLostButton.isPresent).to.be.true;
      });

      describe('click on declare lost button', () => {
        beforeEach(async function () {
          await LoanActionsHistory.declareLostButton.click();
          await OpenLoansInteractor.declareLostDialog.additionalInfoTextArea.focus();
          await OpenLoansInteractor.declareLostDialog.additionalInfoTextArea.fill('Click declare lost');
        });
        it('should display declare lost dialog', () => {
          expect(OpenLoansInteractor.declareLostDialog.isVisible).to.be.true;
        });

        describe('click confirm dialog', () => {
          beforeEach(async function () {
            await OpenLoansInteractor.declareLostDialog.confirmButton.click();
          });

          it('should display disabled declare lost button', () => {
            expect(LoanActionsHistory.isDeclareLostButtonDisabled).to.be.false;
          });
        });
      });
    });
  });
});
