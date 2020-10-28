import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import { Response } from 'miragejs';
import setupApplication from '../helpers/setup-application';
import OpenLoansInteractor from '../interactors/open-loans';
import LoanActionsHistory from '../interactors/loan-actions-history';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';

describe('Claim returned', () => {
  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    },
    currentUser: {
      curServicePoint: { id: 1 },
    },
  });

  describe('Visiting open loans list page with not claimed returned item', () => {
    let loan;

    beforeEach(async function () {
      loan = this.server.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Checked out' } }
      });

      this.visit(`/users/${loan.userId}/loans/open`);

      await OpenLoansInteractor.whenLoaded();
    });

    it('should display open loans list', () => {
      expect(OpenLoansInteractor.isPresent).to.be.true;
    });

    it('icon button should be presented', () => {
      expect(OpenLoansInteractor.actionDropdowns(0).isPresent).to.be.true;
    });

    describe('opening dropdown for not claimed returned item', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.actionDropdowns(0).click('button');
      });

      it('should display claim returned button', () => {
        expect(OpenLoansInteractor.actionDropdownClaimReturnedButton.isPresent).to.be.true;
      });

      describe('clicking claim returned button', () => {
        beforeEach(async () => {
          await OpenLoansInteractor.actionDropdownClaimReturnedButton.click();
        });

        it('should display claim returned dialog', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.isVisible).to.be.true;
        });

        it('should display disabled confirm button', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.confirmButton.isPresent).to.be.true;
          expect(OpenLoansInteractor.claimReturnedDialog.isConfirmButtonDisabled).to.be.true;
        });

        it('should display cancel button', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.cancelButton.isPresent).to.be.true;
        });

        it('should display additional information textarea', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.isPresent).to.be.true;
        });

        describe('clicking cancel button', () => {
          beforeEach(async () => {
            await OpenLoansInteractor.claimReturnedDialog.cancelButton.click();
          });

          it('should hide claim returned dialog', () => {
            expect(OpenLoansInteractor.claimReturnedDialog.isPresent).to.be.false;
          });
        });

        describe('filling additional information textarea', () => {
          const additionalInfoText = 'text';
          let parsedRequestBody;

          beforeEach(async () => {
            await OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.focus();
            await OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.fill(additionalInfoText);
          });

          it('should enable confirm button', () => {
            expect(OpenLoansInteractor.claimReturnedDialog.isConfirmButtonDisabled).to.be.false;
          });

          describe('clicking confirm button', () => {
            beforeEach(async function () {
              this.server.post(`/circulation/loans/${loan.id}/claim-item-returned`, (_, request) => {
                parsedRequestBody = JSON.parse(request.requestBody);
                return new Response(204, {});
              });

              await OpenLoansInteractor.claimReturnedDialog.confirmButton.click();
            });
            it('should send correct request body', () => {
              expect(parsedRequestBody.comment).to.equal(additionalInfoText);
            });
            it('should hide claim returned dialog', () => {
              expect(OpenLoansInteractor.claimReturnedDialog.isPresent).to.be.false;
            });
          });
        });
      });
    });
  });

  describe('Visiting open loans list page with claimed returned item', () => {
    beforeEach(async function () {
      const user = this.server.create('user');

      this.server.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Checked out' } },
        userId: user.id,
      });

      this.server.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Claimed returned' } },
        userId: user.id,
      });

      this.visit(`/users/${user.id}/loans/open`);

      await OpenLoansInteractor.whenLoaded();
    });

    it('should display claimed returned count', () => {
      expect(OpenLoansInteractor.loanCount).to.equal('2 records found (1 claimed returned)');
    });

    describe('opening dropdown for claimed returned item', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.actionDropdowns(1).click('button');
      });

      it('should not display renew button', () => {
        expect(OpenLoansInteractor.actionDropdownRenewButton.isVisible).to.be.false;
      });

      it('should not display change due date button', () => {
        expect(OpenLoansInteractor.actionDropdownChangeDueDateButton.isVisible).to.be.false;
      });

      it('should not display claim returned button', () => {
        expect(OpenLoansInteractor.actionDropdownClaimReturnedButton.isVisible).to.be.false;
      });
    });

    describe('when check the claimed returned item', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.checkboxes(1).clickInput();
      });

      it('should display disabled bulk renew button', () => {
        expect(OpenLoansInteractor.isBulkRenewButtonDisabled).to.be.true;
      });

      it('should display disabled bulk change due date button', () => {
        expect(OpenLoansInteractor.isBulkChangeDueDateButtonDisabled).to.be.true;
      });

      describe('when check the checked out item', () => {
        beforeEach(async () => {
          await OpenLoansInteractor.checkboxes(0).clickInput();
        });

        it('should display enabled bulk renew button', () => {
          expect(OpenLoansInteractor.isBulkRenewButtonDisabled).to.be.false;
        });

        it('should display enabled bulk change due date button', () => {
          expect(OpenLoansInteractor.isBulkChangeDueDateButtonDisabled).to.be.false;
        });
      });
    });
  });

  describe('Visiting loan details page with not claimed returned item', () => {
    beforeEach(async function () {
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test'
      });

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
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

      it('should display claim returned dialog', () => {
        expect(OpenLoansInteractor.claimReturnedDialog.isVisible).to.be.true;
      });
    });
  });

  describe('Visiting loan details page with claimed returned item', () => {
    beforeEach(async function () {
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'claimedReturned',
        actionComment: 'Claim returned confirmation',
        item: { status: { name: 'Claimed returned' } },
        itemStatus: 'Claimed returned',
        claimedReturnedDate: new Date().toISOString(),
      });

      this.server.create('user', { id: loan.userId });

      this.server.create('loanaction', {
        loan: {
          ...loan.attrs,
        },
      });

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    });

    it('should display disabled renew button', () => {
      expect(LoanActionsHistory.isRenewButtonDisabled).to.be.true;
    });

    it('should hide claim returned button', () => {
      expect(LoanActionsHistory.claimReturnedButton.isPresent).to.be.false;
    });

    it('should display disabled change due date button', () => {
      expect(LoanActionsHistory.isChangeDueDateButtonDisabled).to.be.true;
    });

    it('should display the claimed returned date in `Claimed returned` field', () => {
      expect(LoanActionsHistory.claimedReturnedDate.value.text).to.not.equal('-');
    });

    describe('show resolve claim menu with actions', () => {
      beforeEach(async function () {
        await LoanActionsHistory.resolveClaimMenu.click();
      });

      it('should show declare lost button', () => {
        expect(LoanActionsHistory.declareLostButton.isPresent).to.be.true;
      }).timeout(5000);
    });
  });

  describe('Visiting open loans list page with declared lost item', () => {
    let user;
    beforeEach(async function () {
      user = this.server.create('user', { id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd' });

      const loan = this.server.create('loan', {
        id:'64a57e60-f54a-474c-800d-469c601f0cb2',
        userId: user.id,
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'Declared Lost',
        item: {
          id: '4428a37c-8bae-4f0d-865d-970d83d5ad55',
          status: { name: 'Declared Lost' }
        },
      });

      this.server.create('account', {
        id:'f2881912-899b-490b-9433-f38a0ec15476',
        userId: loan.userId,
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
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 200,
        balance: 200
      });
      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Transferred partially',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 180,
        balance: 20
      });

      this.server.get('/accounts');
      this.server.get('/feefineactions');

      this.visit(`/users/${loan.userId}/loans/open`);
      await OpenLoansInteractor.whenLoaded();
    });

    it('should display open loans list', () => {
      expect(OpenLoansInteractor.isPresent).to.be.true;
    });

    it('icon button should be presented', () => {
      expect(OpenLoansInteractor.actionDropdowns(0).isPresent).to.be.true;
    });

    describe('opening dropdown for not claimed returned item', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.actionDropdowns(0).click('button');
      });

      it('should display claim returned button', () => {
        expect(OpenLoansInteractor.actionDropdownClaimReturnedButton.isPresent).to.be.true;
      });

      describe('clicking claim returned button', () => {
        beforeEach(async () => {
          await OpenLoansInteractor.actionDropdownClaimReturnedButton.click();
        });

        it('should display claim returned dialog', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.isVisible).to.be.true;
        });

        it('should display disabled confirm button', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.confirmButton.isPresent).to.be.true;
          expect(OpenLoansInteractor.claimReturnedDialog.isConfirmButtonDisabled).to.be.true;
        });

        it('should display cancel button', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.cancelButton.isPresent).to.be.true;
        });

        it('should display additional information textarea', () => {
          expect(OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.isPresent).to.be.true;
        });

        describe('clicking cancel button', () => {
          beforeEach(async () => {
            await OpenLoansInteractor.claimReturnedDialog.cancelButton.click();
          });

          it('should hide claim returned dialog', () => {
            expect(OpenLoansInteractor.claimReturnedDialog.isPresent).to.be.false;
          });
        });

        describe('filling additional information textarea', () => {
          const additionalInfoText = 'text';
          let parsedRequestBody;
          let body;

          beforeEach(async () => {
            await OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.focus();
            await OpenLoansInteractor.claimReturnedDialog.additionalInfoTextArea.fill(additionalInfoText);
          });

          it('should enable confirm button', () => {
            expect(OpenLoansInteractor.claimReturnedDialog.isConfirmButtonDisabled).to.be.false;
          });

          describe('clicking confirm button', () => {
            beforeEach(async function () {
              this.server.get('/feefineactions');

              this.server.post('/feefineactions', (schema, request) => {
                body = JSON.parse(request.requestBody);

                return schema.feefineactions.create(body);
              });

              this.server.post('/circulation/loans/64a57e60-f54a-474c-800d-469c601f0cb2/claim-item-returned', (_, request) => {
                parsedRequestBody = JSON.parse(request.requestBody);
                return new Response(204, {});
              });

              await OpenLoansInteractor.claimReturnedDialog.confirmButton.click();
            });
            it('should send correct request body', () => {
              expect(parsedRequestBody.comment).to.equal(additionalInfoText);
            });
            it('should hide claim returned dialog', () => {
              expect(OpenLoansInteractor.claimReturnedDialog.isPresent).to.be.false;
            });
          });
        });
      });
    });
  });

  describe('Visiting loan details page with claimed returned ítem, fee fine incurred and transferred actions', () => {
    let user;
    beforeEach(async function () {
      user = this.server.create('user', { id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd' });
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'claimedReturned',
        actionComment: 'Claim returned confirmation',
        item: { status: { name: 'Claimed returned' } },
        itemStatus: 'Claimed returned',
        claimedReturnedDate: new Date().toISOString(),
        userId: user.id,
      });


      this.server.create('loanaction', {
        loan: {
          ...loan.attrs,
        },
      });

      this.server.create('account', {
        id:'f2881912-899b-490b-9433-f38a0ec15476',
        userId: loan.userId,
        status: {
          name: 'Open',
        },
        paymentStatus: {
          name: 'Suspended claim returned',
        },
        amount: 200,
        remaining: 20,
        feeFineType: 'Lost item fee',
        loanId: loan.id,
      });

      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Lost item fee',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 200,
        balance: 200
      });
      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Transferred partially',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 180,
        balance: 20
      });
      this.server.create('feefineaction', {
        userId: user.id,
        transactionInformation: 'Refunded to Community',
        typeAction: 'Refunded fully-Claim returned',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amount: 100,
        remaining: 100,
      });
      this.server.create('feefineaction', {
        userId: user.id,
        transactionInformation: 'Refunded to Community',
        typeAction: 'Credited fully-Claim returned',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amount: 0,
        remaining: 0,
      });

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    });

    it('should display disabled renew button', () => {
      expect(LoanActionsHistory.isRenewButtonDisabled).to.be.true;
    });

    it('should hide claim returned button', () => {
      expect(LoanActionsHistory.claimReturnedButton.isPresent).to.be.false;
    });

    it('should display disabled change due date button', () => {
      expect(LoanActionsHistory.isChangeDueDateButtonDisabled).to.be.true;
    });

    it('should display the claimed returned date in `Claimed returned` field', () => {
      expect(LoanActionsHistory.claimedReturnedDate.value.text).to.not.equal('-');
    });

    it('loan action should be Claimed Returned', () => {
      expect(LoanActionsHistory.loanActions.rows(0).cells(1).text).to.equal('Claimed returned');
    });


    describe('show resolve claim menu with actions', () => {
      beforeEach(async function () {
        await LoanActionsHistory.resolveClaimMenu.click();
      });

      it('should show declare lost button', () => {
        expect(LoanActionsHistory.declareLostButton.isPresent).to.be.true;
      }).timeout(5000);
    });
  });


  describe('Visiting fee fine (credit and refund) when incurred after claim returned item', () => {
    let user;
    beforeEach(async function () {
      user = this.server.create('user', { id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd' });
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'claimedReturned',
        actionComment: 'Claim returned confirmation',
        item: { status: { name: 'Claimed returned' } },
        itemStatus: 'Claimed returned',
        claimedReturnedDate: new Date().toISOString(),
        userId: user.id,
      });


      this.server.create('loanaction', {
        loan: {
          ...loan.attrs,
        },
      });

      this.server.create('account', {
        id:'f2881912-899b-490b-9433-f38a0ec15476',
        userId: loan.userId,
        status: {
          name: 'Open',
        },
        paymentStatus: {
          name: 'Suspended claim returned',
        },
        amount: 200,
        remaining: 20,
        feeFineType: 'Lost item fee',
        loanId: loan.id,
      });

      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Lost item fee',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 200,
        balance: 200
      });
      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Transferred partially',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 180,
        balance: 20
      });
      this.server.create('feefineaction', {
        userId: user.id,
        transactionInformation: 'Refunded to Community',
        typeAction: 'Refunded fully-Claim returned',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amount: 100,
        remaining: 100,
      });
      this.server.create('feefineaction', {
        userId: user.id,
        transactionInformation: 'Refunded to Community',
        typeAction: 'Credited fully-Claim returned',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amount: 0,
        remaining: 0,
      });
      this.server.get('/accounts');
      this.server.get('/feefineactions');


      this.visit('/users/preview/ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd');
      await FeeFineHistoryInteractor.whenSectionLoaded();
      await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
      await FeeFineHistoryInteractor.openAccounts.click();
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineHistoryInteractor.mclViewFeesFines.rowCount).to.equal(1);
    });

    it('Suspended claim returned payment status', () => {
      expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(0).cells(6).text).to.equal('Suspended claim returned');
    });
  });

  describe('visit Fee/fine details', () => {
    let user;
    beforeEach(async function () {
      user = this.server.create('user', { id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd' });
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'claimedReturned',
        actionComment: 'Claim returned confirmation',
        item: { status: { name: 'Claimed returned' } },
        itemStatus: 'Claimed returned',
        claimedReturnedDate: new Date().toISOString(),
        userId: user.id,
      });


      this.server.create('loanaction', {
        loan: {
          ...loan.attrs,
        },
      });

      this.server.create('account', {
        id:'f2881912-899b-490b-9433-f38a0ec15476',
        userId: loan.userId,
        status: {
          name: 'Open',
        },
        paymentStatus: {
          name: 'Suspended claim returned',
        },
        amount: 200,
        remaining: 20,
        feeFineType: 'Lost item fee',
        loanId: loan.id,
      });

      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Lost item fee',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 200,
        balance: 200
      });
      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Transferred partially',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 180,
        balance: 20
      });
      this.server.create('feefineaction', {
        userId: user.id,
        transactionInformation: 'Refunded to Community',
        typeAction: 'Refunded fully-Claim returned',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 180,
        balance: 200,
      });
      this.server.create('feefineaction', {
        userId: user.id,
        transactionInformation: 'Refund to Community',
        typeAction: 'Credited fully-Claim returned',
        accountId: 'f2881912-899b-490b-9433-f38a0ec15476',
        amountAction: 180,
        balance: 0
      });


      this.server.get('/accounts');
      this.server.get('/feefineactions');
      this.visit('/users/preview/ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd');
      await FeeFineHistoryInteractor.whenSectionLoaded();
      await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
      await FeeFineHistoryInteractor.openAccounts.click();
      await FeeFineHistoryInteractor.rows(0).click();
    });
    it('Refunded fully-Claim returned  Action', () => {
      expect(FeeFineHistoryInteractor.mclAccountActions.rows(2).cells(1).text).to.equal('Refunded fully-Claim returned');
    });

    it('Credited fully-Claim returned  Action', () => {
      expect(FeeFineHistoryInteractor.mclAccountActions.rows(3).cells(1).text).to.equal('Credited fully-Claim returned');
    });
    it('Credited fully-Claim returned Balance', () => {
      expect(FeeFineHistoryInteractor.mclAccountActions.rows(3).cells(3).text).to.equal('-');
    });
    it('Credited fully-Claim returned  Amount', () => {
      expect(FeeFineHistoryInteractor.mclAccountActions.rows(3).cells(2).text).to.equal('180.00');
    });
  });
});
