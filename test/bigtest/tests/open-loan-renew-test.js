import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import OpenLoansInteractor from '../interactors/open-loans';
import LoanActionsHistory from '../interactors/loan-actions-history';

describe('Renew loan', () => {
  describe('Patron has an automated patron block on renewing', () => {
    setupApplication({
      permissions: {
        'automated-patron-blocks.collection.get': true,
        'circulation.loans.collection.get': true,
      },
    });

    const blockReason = 'Patron has reached maximum allowed number of items charged out';
    let userId = '';
    let loanId = '';

    describe('visit open loans', () => {
      beforeEach(async function () {
        const loan = this.server.create('loan', {
          status: { name: 'Open' },
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
        const patronBlock = {
          automatedPatronBlocks: {
            patronBlockConditionId: '1',
            blockBorrowing: true,
            blockRenewals: true,
            blockRequests: false,
            message: blockReason
          },
          totalRecords: 1,
        };

        userId = loan.userId;
        loanId = loan.id;

        this.server.get(`/automated-patron-blocks/${userId}`, patronBlock);
      });

      describe('action dropdown click', () => {
        beforeEach(async function () {
          this.visit(`/users/${userId}/loans/open?query=%20&sort=requests`);

          await OpenLoansInteractor.actionDropdowns(0).click('button');
        });

        it('override button should be presented', () => {
          expect(OpenLoansInteractor.actionDropdownRenewButton.isPresent).to.be.true;
        });

        describe('renew button click', () => {
          beforeEach(async () => {
            await OpenLoansInteractor.actionDropdownRenewButton.click();
          });

          it('patron block modal should be present', () => {
            expect(OpenLoansInteractor.patronBlockModal.isPresent).to.be.true;
          });

          it('patron block modal content should have the reason', () => {
            expect(OpenLoansInteractor.patronBlockModal.modalContent(0).text).to.be.equal(blockReason);
          });

          it('should be present override button', () => {
            expect(OpenLoansInteractor.patronBlockModal.overrideButton.isPresent).to.be.true;
          });

          describe('Override patron block modal', () => {
            beforeEach(async () => {
              await OpenLoansInteractor.patronBlockModal.overrideButton.click();
            });

            it('should be hidden patron block modal', () => {
              expect(OpenLoansInteractor.patronBlockModal.isPresent).to.be.false;
            });

            it('should open override patron block modal', () => {
              expect(OpenLoansInteractor.overridePatronBlockModal.isPresent).to.be.true;
            });

            it('should be presented comment field', () => {
              expect(OpenLoansInteractor.overridePatronBlockModal.comment.isPresent).to.be.true;
            });

            it('should be present close button', () => {
              expect(OpenLoansInteractor.overridePatronBlockModal.closeButton.isPresent).to.be.true;
            });

            it('should be present save button', () => {
              expect(OpenLoansInteractor.overridePatronBlockModal.saveButton.isPresent).to.be.true;
            });

            it('should be disabled save button', () => {
              expect(OpenLoansInteractor.overridePatronBlockModal.saveButtonDisabled).to.equal(true);
            });

            describe('Comment', () => {
              const comment = 'comment';

              beforeEach(async () => {
                await OpenLoansInteractor.overridePatronBlockModal.comment.fillAndBlur(comment);
              });

              it('should set comment', () => {
                expect(OpenLoansInteractor.overridePatronBlockModal.comment.val).to.equal(comment);
              });

              it('should not be disabled save button', () => {
                expect(OpenLoansInteractor.overridePatronBlockModal.saveButtonDisabled).to.be.false;
              });

              describe('Click close button', () => {
                beforeEach(async () => {
                  await OpenLoansInteractor.overridePatronBlockModal.closeButton.click();
                });

                it('should open patron block modal', () => {
                  expect(OpenLoansInteractor.patronBlockModal.isPresent).to.be.true;
                });

                it('should hidden override patron block modal', () => {
                  expect(OpenLoansInteractor.overridePatronBlockModal.isPresent).to.be.false;
                });
              });

              describe('Click save button', () => {
                beforeEach(async () => {
                  await OpenLoansInteractor.overridePatronBlockModal.saveButton.click();
                });

                it('should hidden patron block modal', () => {
                  expect(OpenLoansInteractor.patronBlockModal.isPresent).to.be.false;
                });

                it('should hidden override patron block modal', () => {
                  expect(OpenLoansInteractor.overridePatronBlockModal.isPresent).to.be.false;
                });
              });
            });
          });
        });

        describe("overriding when renew won't change due date", () => {
          beforeEach(async function () {
            this.server.post('/circulation/renew-by-barcode', {
              'errors' : [{
                'message' : 'renewal would not change the due date',
                'parameters' : [{
                  'key' : 'request id',
                  'value' : 'b67e73a8-b6b7-46fd-a918-77ce907dd3aa'
                }]
              }]
            }, 422);
            this.visit(`/users/${userId}/loans/open?query=%20&sort=requests`);

            await OpenLoansInteractor.actionDropdowns(0).click('button');
          });

          it('allows an override', () => {
            expect(OpenLoansInteractor.actionDropdownRenewButton.isPresent).to.be.true;
          });
        });
      });

      describe('loan detail page', () => {
        beforeEach(async function () {
          this.visit(`/users/${userId}/loans/view/${loanId}`);
        });

        describe('renew button click', () => {
          beforeEach(async () => {
            await LoanActionsHistory.renewButton.click();
          });

          it('patron block modal should be present', () => {
            expect(LoanActionsHistory.patronBlockModal.isPresent).to.be.true;
          });

          it('patron block modal content should have the reason', () => {
            expect(LoanActionsHistory.patronBlockModal.modalContent(0).text).to.be.equal(blockReason);
          });
        });
      });
    });
  });
});
