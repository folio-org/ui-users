import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import { Response } from 'miragejs';

import setupApplication from '../helpers/setup-application';
import DummyComponent from '../helpers/DummyComponent';
import OpenLoansInteractor from '../interactors/open-loans';
import LoanActionsHistory from '../interactors/loan-actions-history';

import translations from '../../../translations/ui-users/en';

describe('Declare Lost', () => {
  const requestsPath = '/requests';
  const requestsAmount = 5;

  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
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
    translations: {
      'requests': 'Requests'
    },
  });

  describe('Visiting open loans list page with not declared lost item', () => {
    let loan;

    beforeEach(async function () {
      loan = this.server.create('loan', { status: { name: 'Open' } });
      this.server.createList('request', requestsAmount, { itemId: loan.itemId });

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

        it('should display open requests number', () => {
          expect(OpenLoansInteractor.declareLostDialog.openRequestsNumber.text).to.equal(`${requestsAmount} open requests`);
        });

        describe('clicking on the open requests number link', () => {
          beforeEach(async () => {
            await OpenLoansInteractor.declareLostDialog.openRequestsNumber.click();
          });

          it('should redirect to "requests"', function () {
            expect(this.location.pathname).to.equal(requestsPath);
            expect(this.location.search).includes(loan.itemId);
          });
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

          describe('when no fee/fine owner found', () => {
            const errorMessage = 'No fee/fine owner found for item\'s permanent location';

            beforeEach(async function () {
              this.server.post(`/circulation/loans/${loan.id}/declare-item-lost`, () => {
                return new Response(422, { 'Content-Type': 'application/json' }, {
                  errors: [{
                    message: errorMessage,
                  }]
                });
              });

              await OpenLoansInteractor.declareLostDialog.confirmButton.click();
            });

            it('should display error modal', () => {
              expect(OpenLoansInteractor.errorModal.isPresent).to.be.true;
            });

            it('error modal should have title', () => {
              expect(OpenLoansInteractor.errorModal.headline).to.equal(translations['feefines.errors.notBilledTitle']);
            });

            it('error modal should have content', () => {
              expect(OpenLoansInteractor.errorModal.content).to.include(translations['feefines.errors.updateOwnerMessage']);
            });

            describe('clicking close button', () => {
              beforeEach(async () => {
                await OpenLoansInteractor.errorModal.closeButton.click();
              });

              it('should not display error modal', () => {
                expect(OpenLoansInteractor.errorModal.isPresent).to.be.false;
              });
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

  describe('Visiting loan details page with not declared lost item', () => {
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

      await LoanActionsHistory.resolveClaimMenu.click();
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

  describe('Fine incurred after marking item as lost', () => {
    let refreshCounter = 0;

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

      // This is ugly but it allows for moving forward without mocking up
      // too many other backend things.
      this.server.get('/accounts', () => {
        const accounts = (refreshCounter > 3) ? [{ id: 1, amount: 250 }] : [];
        refreshCounter++;
        return { accounts };
      });

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);

      await LoanActionsHistory.whenLoaded();
    });

    it('should show empty fine incurred amount', () => {
      expect(LoanActionsHistory.feeFines.text).to.equal('-');
    });

    describe('Update fine incurred', () => {
      beforeEach(async function () {
        await LoanActionsHistory.declareLostButton.click();
        await OpenLoansInteractor.declareLostDialog.additionalInfoTextArea.focus();
        await OpenLoansInteractor.declareLostDialog.additionalInfoTextArea.fill('item lost');
        await OpenLoansInteractor.declareLostDialog.confirmButton.click();
      });
    });

    it('should update fine incurred amount', () => {
      expect(LoanActionsHistory.feeFines.text).to.equal('-');
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

      this.server.create('loanaction', {
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

    it('should hide declare lost button', () => {
      expect(LoanActionsHistory.declareLostButton.isPresent).to.be.false;
    }).timeout(5000);

    it('should display the lost date in lost field', () => {
      expect(LoanActionsHistory.lostDate.value.text).to.not.equal('-');
    });
  });

  describe('Visiting loan details page with checked out item', () => {
    beforeEach(async function () {
      const loan = this.server.create('loan', {
        status: { name: 'Open' },
        loanPolicyId: 'test',
        action: 'checkedOut',
        actionComment: 'Checked out confirmation',
        item: { status: { name: 'Checked out' } },
        itemStatus: 'Checked out',
      });

      this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
    });

    describe('clicking on declare lost button twice', () => {
      beforeEach(async function () {
        await LoanActionsHistory.declareLostButton.click();
        await OpenLoansInteractor.declareLostDialog.additionalInfoTextArea.focus();
        await OpenLoansInteractor.declareLostDialog.additionalInfoTextArea.fill('some text');
        await OpenLoansInteractor.declareLostDialog.confirmButton.click();
        await LoanActionsHistory.declareLostButton.click();
      });

      it('should display disabled declare lost button', () => {
        expect(LoanActionsHistory.isDeclareLostButtonDisabled).to.be.true;
      });

      it('should not display declare lost dialog', () => {
        expect(OpenLoansInteractor.declareLostDialog.isPresent).to.be.false;
      });
    });
  });
});
