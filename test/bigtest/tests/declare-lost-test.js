import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import { Response } from '@bigtest/mirage';

import setupApplication from '../helpers/setup-application';
import OpenLoansInteractor from '../interactors/open-loans';
import LoanActionsHistory from '../interactors/loan-actions-history';

describe('Declare Lost', () => {
  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    },
  });

  describe('Visiting open loans list page with not declared lost item', () => {
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

    describe('opening dropdown for not declared lost item', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.actionDropdowns(0).click('button');
      });

      it('should display declare lost button', () => {
        expect(OpenLoansInteractor.actionDropdownDeclareLostButton.isPresent).to.be.true;
      });

      describe('clicking declare lost button', () => {
        beforeEach(async () => {
          await OpenLoansInteractor.actionDropdownDeclareLostButton.click();
        });

        it('should display declare lost dialog', () => {
          expect(OpenLoansInteractor.declareLostDialog.isVisible).to.be.true;
        });

        it('should display disabled confirm button', () => {
          expect(OpenLoansInteractor.declareLostDialog.confirmButton.isPresent).to.be.true;
          expect(OpenLoansInteractor.declareLostDialog.isConfirmButtonDisabled).to.be.true;
        });

        it('should display cancel button', () => {
          expect(OpenLoansInteractor.declareLostDialog.cancelButton.isPresent).to.be.true;
        });

        it('should display additional information textarea', () => {
          expect(OpenLoansInteractor.declareLostDialog.additionalInfoTextArea.isPresent).to.be.true;
        });

        describe('clicking cancel button', () => {
          beforeEach(async () => {
            await OpenLoansInteractor.declareLostDialog.cancelButton.click();
          });

          it('should hide declare lost dialog', () => {
            expect(OpenLoansInteractor.declareLostDialog.isPresent).to.be.false;
          });
        });

        describe('filling additional information textarea', () => {
          const additionalInfoText = 'text';

          beforeEach(async () => {
            await OpenLoansInteractor.declareLostDialog.additionalInfoTextArea.focus();
            await OpenLoansInteractor.declareLostDialog.additionalInfoTextArea.fill(additionalInfoText);
          });

          it('should enable confirm button', () => {
            expect(OpenLoansInteractor.declareLostDialog.isConfirmButtonDisabled).to.be.false;
          });

          describe('clicking confirm button', () => {
            let parsedRequestBody;

            beforeEach(async function () {
              this.server.post(`/circulation/loans/${loan.id}/declare-item-lost`, (_, request) => {
                parsedRequestBody = JSON.parse(request.requestBody);

                return new Response(204, {});
              });

              await OpenLoansInteractor.declareLostDialog.confirmButton.click();
            });

            it('should send correct request body', () => {
              expect(parsedRequestBody.comment).to.equal(additionalInfoText);
            });

            it('should hide declare lost dialog', () => {
              expect(OpenLoansInteractor.declareLostDialog.isPresent).to.be.false;
            });
          });
        });
      });
    });
  });

  describe('Visiting open loans list page with declared lost item', () => {
    beforeEach(async function () {
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Declared lost' } },
      });

      this.visit(`/users/${loan.userId}/loans/open`);

      await OpenLoansInteractor.whenLoaded();
    });

    describe('opening dropdown for declared lost item', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.actionDropdowns(0).click('button');
      });

      it('should not display declare lost button', () => {
        expect(OpenLoansInteractor.actionDropdownDeclareLostButton.isPresent).to.be.false;
      });
    });
  });

  describe('Visiting loan details  page with not declared lost item', () => {
    beforeEach(async function () {
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test'
      });

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    });

    it('should display enabled declare lost button', () => {
      expect(LoanActionsHistory.declareLostButton.isPresent).to.be.true;
      expect(LoanActionsHistory.isDeclareLostButtonDisabled).to.be.false;
    });

    it('should display dash in lost field', () => {
      expect(LoanActionsHistory.lostDate.value.text).to.equal('-');
    });

    describe('clicking on declare lost button', () => {
      beforeEach(async function () {
        await LoanActionsHistory.declareLostButton.click();
      });

      it('should display declare lost dialog', () => {
        expect(OpenLoansInteractor.declareLostDialog.isVisible).to.be.true;
      });
    });
  });

  describe('Visiting loan details page with declared lost item', () => {
    beforeEach(async function () {
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'declaredLost',
        actionComment: 'D',
        item: { status: { name: 'Declared lost' } },
      });

      this.server.create('user', { id: loan.userId });

      this.server.create('loanactions', {
        loan: {
          ...loan.attrs,
        },
        operation : 'U',
        action: 'declaredLost',
        actionComment: 'D',
        itemStatus: 'Declared lost',
      });

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    });


    it('should display disabled declare lost button', () => {
      expect(LoanActionsHistory.declareLostButton.isPresent).to.be.true;
      expect(LoanActionsHistory.isDeclareLostButtonDisabled).to.be.true;
    }).timeout(5000);

    it('should display the lost date in lost field', () => {
      expect(LoanActionsHistory.lostDate.value.text).to.not.equal('-');
    });
  });
});
