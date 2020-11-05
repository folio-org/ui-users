import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';

describe('Refund multiple Fees/Fines', () => {
  setupApplication({
    scenarios: ['refund-fees-fines'],
    currentUser: {
      curServicePoint: { id: 1 },
    },
  });
  describe('visit user details', () => {
    beforeEach(async function () {
      this.visit('/users/preview/user1');
      await FeeFineHistoryInteractor.whenSectionLoaded();
    });

    it('displays section Fees/Fines', () => {
      expect(FeeFineHistoryInteractor.sectionIsPresent).to.be.true;
    });

    describe('select all open fees/fines', () => {
      beforeEach(async () => {
        await FeeFineHistoryInteractor.openAccounts.click();
        await FeeFineHistoryInteractor.selectAllCheckbox();
      });

      it('displays open fees/fines', () => {
        expect(FeeFineHistoryInteractor.isViewOpen).to.be.true;
      });

      it('displays refund button', () => {
        expect(FeeFineHistoryInteractor.refundButton.text).to.equal('Refund');
      });

      describe('open refund modal', () => {
        beforeEach(async () => {
          await FeeFineHistoryInteractor.refundButton.click();
        });

        it('displays refund modal', () => {
          expect(FeeFineHistoryInteractor.refundModal.isPresent).to.be.true;
        });

        it('displays refund amount', () => {
          expect(FeeFineHistoryInteractor.actionModalAmountField.value).to.equal('400.00');
        });

        describe('fill refund modal', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.actionModalAmountField.blurInput();
            await FeeFineHistoryInteractor.actionModalSelect.selectAndBlur('Overpaid');
          });

          it('displays refund button active', () => {
            expect(FeeFineHistoryInteractor.actionModalSubmitButtonIsDisabled).to.be.false;
          });

          describe('refund all open fees/fines', () => {
            beforeEach(async () => {
              await FeeFineHistoryInteractor.actionModalSubmitButton.click();
            });

            it('displays confirmation modal', () => {
              expect(FeeFineHistoryInteractor.actionConfirmationModal.body.isPresent).to.be.true;
            });

            describe('confirm fees/fines refunding', () => {
              beforeEach(async () => {
                await FeeFineHistoryInteractor.actionConfirmationModal.confirmButton.click();
              });

              it('show successfull callout', () => {
                expect(FeeFineHistoryInteractor.callout.successCalloutIsPresent).to.be.true;
              });
            });
          });
        });
      });
    });
  });
});
