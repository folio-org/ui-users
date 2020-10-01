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

describe('Claim returned', () => {
  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    },
  });

  describe('Visiting open loans list page with not claimed returned item', () => {
    let loan;

    beforeEach(async function () {
      loan = this.server.create('loan', { status: { name: 'Open' } });

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
            describe('Refund transferred amount if necessary and submit claimed returned', () => {
              beforeEach(async function () {
                setupApplication({
                  scenarios: ['claim-returned'],
                });
                this.server.get('/feefineaction', (_, request) => {
                  parsedRequestFeeFineBody = JSON.parse(request.requestBody);
                  return new Response(204, {});
                });
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


            describe('Without Fees/Fines and submit claimed returned', () => {
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
});
