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

describe('Mark as missing', () => {
  describe('Visiting open loans list page with not claimed returned item', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'module.users.enabled': true,
        'ui-users.loans.view': true,
        'manualblocks.collection.get': true,
        'circulation.loans.collection.get': true,
      },
    });

    beforeEach(async function () {
      const loan = this.server.create('loan', { status: { name: 'Open' } });

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

      it('should not display mark as missing button', () => {
        expect(OpenLoansInteractor.actionDropdownMarkAsMissingButton.isPresent).to.be.false;
      });
    });
  });

  describe('Visiting open loans list page with claimed returned item without permissions', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'module.users.enabled': true,
        'ui-users.loans.view': true,
        'manualblocks.collection.get': true,
        'circulation.loans.collection.get': true,
      },
    });

    beforeEach(async function () {
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Claimed returned' } },
      });

      this.visit(`/users/${loan.userId}/loans/open`);

      await OpenLoansInteractor.whenLoaded();
    });

    describe('opening dropdown for claimed returned item', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.actionDropdowns(0).click('button');
      });

      it('should not display mark as missing button', () => {
        expect(OpenLoansInteractor.actionDropdownMarkAsMissingButton.isPresent).to.be.false;
      });
    });
  });

  describe('Visiting open loans list page with claimed returned item and correct permissions', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'ui-users.loans.declare-claimed-returned-item-as-missing': true,
        'module.users.enabled': true,
        'ui-users.loans.view': true,
        'manualblocks.collection.get': true,
        'circulation.loans.collection.get': true,
      },
    });

    let loan;

    beforeEach(async function () {
      loan = this.server.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Claimed returned' } },
      });

      this.visit(`/users/${loan.userId}/loans/open`);

      await OpenLoansInteractor.whenLoaded();
    });

    describe('opening dropdown for claimed returned item', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.actionDropdowns(0).click('button');
      });

      it('should display mark as missing button', () => {
        expect(OpenLoansInteractor.actionDropdownMarkAsMissingButton.isPresent).to.be.true;
      });

      describe('clicking mark as missing button', () => {
        beforeEach(async () => {
          await OpenLoansInteractor.actionDropdownMarkAsMissingButton.click();
        });

        it('should display mark as missing dialog', () => {
          expect(OpenLoansInteractor.markAsMissingDialog.isVisible).to.be.true;
        });

        it('should display disabled confirm button', () => {
          expect(OpenLoansInteractor.markAsMissingDialog.confirmButton.isPresent).to.be.true;
          expect(OpenLoansInteractor.markAsMissingDialog.isConfirmButtonDisabled).to.be.true;
        });

        it('should display cancel button', () => {
          expect(OpenLoansInteractor.markAsMissingDialog.cancelButton.isPresent).to.be.true;
        });

        it('should display additional information textarea', () => {
          expect(OpenLoansInteractor.markAsMissingDialog.additionalInfoTextArea.isPresent).to.be.true;
        });

        describe('clicking cancel button', () => {
          beforeEach(async () => {
            await OpenLoansInteractor.markAsMissingDialog.cancelButton.click();
          });

          it('should hide claim returned dialog', () => {
            expect(OpenLoansInteractor.markAsMissingDialog.isPresent).to.be.false;
          });
        });

        describe('filling additional information textarea', () => {
          const additionalInfoText = 'text';

          beforeEach(async () => {
            await OpenLoansInteractor.markAsMissingDialog.additionalInfoTextArea.focus();
            await OpenLoansInteractor.markAsMissingDialog.additionalInfoTextArea.fill(additionalInfoText);
          });

          it('should enable confirm button', () => {
            expect(OpenLoansInteractor.markAsMissingDialog.isConfirmButtonDisabled).to.be.false;
          });

          describe('clicking confirm button', () => {
            let parsedRequestBody;

            beforeEach(async function () {
              this.server.post(`/circulation/loans/${loan.id}/declare-claimed-returned-item-as-missing`, (_, request) => {
                parsedRequestBody = JSON.parse(request.requestBody);

                return new Response(204, {});
              });

              await OpenLoansInteractor.markAsMissingDialog.confirmButton.click();
            });

            it('should send correct request body', () => {
              expect(parsedRequestBody.comment).to.equal(additionalInfoText);
            });

            it('should hide mark as missing dialog', () => {
              expect(OpenLoansInteractor.markAsMissingDialog.isPresent).to.be.false;
            });
          });
        });
      });
    });
  });

  describe('Visiting loan details page with marked as missing item', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'module.users.enabled': true,
        'ui-users.loans.view': true,
        'manualblocks.collection.get': true,
        'circulation.loans.collection.get': true,
      },
    });

    beforeEach(async function () {
      const loan = this.server.create('loan', {
        status: { name: 'Closed' },
        loanPolicyId: 'test',
        action: 'markedMissing',
        actionComment: 'Missing confirmation',
        item: { status: { name: 'Missing' } },
        itemStatus: 'Missing',
      });

      this.server.create('user', { id: loan.userId });

      this.server.create('loanaction', {
        loan: {
          ...loan.attrs,
        },
      });

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);

      await LoanActionsHistory.whenLoaded();
    });

    it('loan action should be Marked as missing', () => {
      expect(LoanActionsHistory.loanActions.rows(0).cells(1).text).to.equal('Marked as missing');
    });

    it('item status should be Missing', () => {
      expect(LoanActionsHistory.loanActions.rows(0).cells(3).text).to.equal('Missing');
    });
  });
});
