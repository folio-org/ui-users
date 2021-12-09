import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application';
import OpenLoansInteractor from '../interactors/open-loans';
import LoanActionsHistory from '../interactors/loan-actions-history';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';
import { refundClaimReturned } from '../../../src/constants';

describe('Claim returned with multiple refunds', () => {
  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    },
    currentUser: {
      curServicePoint: { id: 1 },
    },
  });

  describe('Visiting open loans list page with declared to lost item with separate refund for each Transfer Account', () => {
    let user;
    let loan;
    beforeEach(async function () {
      user = this.server.create('user');

      loan = this.server.create('loan', {
        userId: user.id,
        status: { name: 'Open' },
        loanPolicyId: 'test',
        item: {
          status: { name: 'Declared lost' }
        },
      });
      this.server.create('loanaction', {
        loan: {
          ...loan.attrs,
        },
      });

      const lostItemFee1 = this.server.create('account', {
        userId: loan.userId,
        id: 1,
        status: {
          name: 'Open',
        },
        paymentStatus: {
          name: 'Paid partially',
        },
        amount: 200,
        remaining: 10,
        feeFineType: 'Lost item fee',
        loanId: loan.id,
      });

      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Lost item fee',
        accountId: lostItemFee1.id,
        amountAction: 200,
        balance: 200
      });
      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Transferred partially',
        accountId: lostItemFee1.id,
        paymentMethod: 'Bursar',
        amountAction: 80,
        balance: 120
      });
      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Transferred partially',
        accountId: lostItemFee1.id,
        paymentMethod: 'Bursar',
        amountAction: 100,
        balance: 20
      });
      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Paid partially',
        accountId: lostItemFee1.id,
        paymentMethod: 'cash',
        amountAction: 10,
        balance: 10
      });

      this.server.get('/accounts');
      this.server.get('/feefineactions');

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
      await LoanActionsHistory.whenLoaded();
    });

    it('should display enabled claim returned button', () => {
      expect(LoanActionsHistory.claimReturnedButton.isPresent).to.be.true;
      expect(LoanActionsHistory.isClaimReturnedButtonDisabled).to.be.false;
    });

    it('should display dash in `Claimed returned` field', () => {
      expect(LoanActionsHistory.claimedReturnedDate.value.text).to.equal('-');
    });

    describe('clicking on claim returned button', () => {
      beforeEach(async function () {
        await LoanActionsHistory.claimReturnedButton.click();
      });

      describe('filling additional information textarea', () => {
        const additionalInfoText = 'text';

        beforeEach(async () => {
          await OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.focus();
          await OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.fill(additionalInfoText);
        });

        it('should enable confirm button', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.isConfirmButtonDisabled).to.be.false;
        });

        describe('clicking confirm button', () => {
          beforeEach(async function () {
            await OpenLoansInteractor.claimReturnedDialog.confirmButton.click();
          });
          it('should hide claim returned dialog', () => {
            expect(OpenLoansInteractor.claimReturnedDialog.isPresent).to.be.false;
          });

          describe('Visiting fee fine (credit and refund) when incurred after claim returned item', () => {
            beforeEach(async function () {
              this.server.create('loanaction', {
                loan: {
                  ...loan.attrs,
                },
              });
              this.server.get('/accounts');
              this.visit(`/users/preview/${loan.userId}`);
              await FeeFineHistoryInteractor.whenSectionLoaded();
              await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
              await FeeFineHistoryInteractor.openAccounts.click();
            });

            it('renders proper amount of rows', () => {
              expect(FeeFineHistoryInteractor.mclViewFeesFines.rowCount).to.equal(1);
            });

            it('Suspended claim returned payment status', () => {
              expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(0).cells(6).text).to.equal(refundClaimReturned.PAYMENT_STATUS);
            });
            it('Remaining claim returned', () => {
              expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(0).cells(5).text).to.equal('200.00');
            });

            describe('visit Fee/fine details', () => {
              beforeEach(async function () {
                this.server.get('/feefineactions');
                await FeeFineHistoryInteractor.rows(0).click();
              });
              it('renders proper amount of rows', () => {
                expect(FeeFineHistoryInteractor.mclAccountActions.rowCount).to.equal(8);
              });
            });
          });
        });
      });
    });
  });

  describe('Visiting open loans list page with declared to lost item with transfer action and manual refund', () => {
    let user;
    let loan;
    beforeEach(async function () {
      user = this.server.create('user');

      loan = this.server.create('loan', {
        userId: user.id,
        status: { name: 'Open' },
        loanPolicyId: 'test',
        item: {
          status: { name: 'Declared lost' }
        },
      });
      this.server.create('loanaction', {
        loan: {
          ...loan.attrs,
        },
      });

      const lostItemFee1 = this.server.create('account', {
        userId: loan.userId,
        id: 1,
        status: {
          name: 'Open',
        },
        paymentStatus: {
          name: 'Transferred partially',
        },
        amount: 200,
        remaining: 20,
        feeFineType: 'Lost item fee',
        loanId: loan.id,
      });

      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Lost item fee',
        accountId: lostItemFee1.id,
        amountAction: 200,
        balance: 200
      });

      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Transferred partially',
        accountId: lostItemFee1.id,
        paymentMethod: 'Bursar',
        amountAction: 100,
        balance: 20
      });

      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Refunded fully',
        accountId: lostItemFee1.id,
        paymentMethod: 'Bursar',
        amountAction: 100,
        balance: 20
      });

      this.server.get('/accounts');
      this.server.get('/feefineactions');

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
      await LoanActionsHistory.whenLoaded();
    });

    it('should display enabled claim returned button', () => {
      expect(LoanActionsHistory.claimReturnedButton.isPresent).to.be.true;
      expect(LoanActionsHistory.isClaimReturnedButtonDisabled).to.be.false;
    });

    it('should display dash in `Claimed returned` field', () => {
      expect(LoanActionsHistory.claimedReturnedDate.value.text).to.equal('-');
    });

    describe('clicking on claim returned button', () => {
      beforeEach(async function () {
        await LoanActionsHistory.claimReturnedButton.click();
      });

      describe('filling additional information textarea', () => {
        const additionalInfoText = 'text';

        beforeEach(async () => {
          await OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.focus();
          await OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.fill(additionalInfoText);
        });

        it('should enable confirm button', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.isConfirmButtonDisabled).to.be.false;
        });

        describe('clicking confirm button', () => {
          beforeEach(async function () {
            await OpenLoansInteractor.claimReturnedDialog.confirmButton.click();
          });
          it('should hide claim returned dialog', () => {
            expect(OpenLoansInteractor.claimReturnedDialog.isPresent).to.be.false;
          });

          describe('Visiting fee fine (credit and refund) when incurred after claim returned item', () => {
            beforeEach(async function () {
              this.server.create('loanaction', {
                loan: {
                  ...loan.attrs,
                },
              });
              this.server.get('/accounts');
              this.visit(`/users/preview/${loan.userId}`);
              await FeeFineHistoryInteractor.whenSectionLoaded();
              await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
              await FeeFineHistoryInteractor.openAccounts.click();
            });

            it('renders proper amount of rows', () => {
              expect(FeeFineHistoryInteractor.mclViewFeesFines.rowCount).to.equal(1);
            });

            it('Suspended claim returned payment status', () => {
              expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(0).cells(6).text).to.equal(refundClaimReturned.PAYMENT_STATUS);
            });
            it('Remaining claim returned', () => {
              expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(0).cells(5).text).to.equal('200.00');
            });

            describe('visit Fee/fine details', () => {
              beforeEach(async function () {
                this.server.get('/feefineactions');
                await FeeFineHistoryInteractor.rows(0).click();
              });
              it('renders proper amount of rows', () => {
                expect(FeeFineHistoryInteractor.mclAccountActions.rowCount).to.equal(3);
              });
            });
          });
        });
      });
    });
  });
});
