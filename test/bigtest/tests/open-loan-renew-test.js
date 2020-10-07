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
        });

        describe("overriding when renew won't change due date", () => {
          beforeEach(async function() {
            server.post('/circulation/renew-by-barcode', {
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
