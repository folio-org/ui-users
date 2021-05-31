import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import translations from '../../../translations/ui-users/en';
import setupApplication from '../helpers/setup-application';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';
import FeeFineDetails from '../interactors/fee-fine-details';

describe('Test Fee/Fine details', () => {
  setupApplication({
    scenarios: ['fee-fine-details'],
    currentUser: {
      curServicePoint: { id: 1, value: 'Test Point' },
    },
  });
  describe('visit Fee/fine details', () => {
    beforeEach(async function () {
      this.visit('/users/preview/ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd');
      await FeeFineHistoryInteractor.whenSectionLoaded();
      await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
      await FeeFineHistoryInteractor.openAccounts.click();
      await FeeFineHistoryInteractor.rows(3).click();
    });

    it('displays account actions section', () => {
      expect(FeeFineDetails.isPresent).to.be.true;
    });

    it('displays fee/fine details overdue policy', () => {
      expect(FeeFineDetails.overduePolicy.label.text).to.equal(translations['loans.details.overduePolicy']);
      expect(FeeFineDetails.overduePolicy.value.text).to.equal('Overdue Fine Policy name');
    });

    it('displays fee/fine details lost item policy', () => {
      expect(FeeFineDetails.lostItemPolicy.label.text).to.equal(translations['loans.details.lostItemPolicy']);
      expect(FeeFineDetails.lostItemPolicy.value.text).to.equal('Lost Item Policy name');
    });

    it('displays fee/fine item instance and material type', () => {
      expect(FeeFineDetails.instanceAndType.label.text).to.equal(translations['details.field.instance.type']);
      expect(FeeFineDetails.instanceAndType.value.text).to.equal('GROẞE DUDEN3 (book)');
    });

    it('displays fee/fine item contributors', () => {
      expect(FeeFineDetails.contributors.label.text).to.equal(translations['reports.overdue.item.contributors']);
      expect(FeeFineDetails.contributors.value.text).to.equal('-');
    });

    it('displays loan details', () => {
      expect(FeeFineDetails.loanDetails.label.text).to.equal(translations['details.label.loanDetails']);
      expect(FeeFineDetails.loanDetails.value.text).to.equal(translations['details.field.loan']);
    });

    describe('Loan details link', () => {
      beforeEach(async function () {
        await FeeFineDetails.loanDetailsClick();
      });

      it('should navigate to', function () {
        const path = '/users/ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd/loans/view/8e9f211b-6024-4828-8c14-ace39c6c2863';
        expect(this.location.pathname.endsWith(path)).to.be.true;
      });
    });

    describe('Overdue policy link', () => {
      beforeEach(async function () {
        await FeeFineDetails.overduePolicyClick();
      });

      it('should navigate to', function () {
        const path = '/settings/circulation/fine-policies/a6130d37-0468-48ca-a336-c2bde575768d';
        expect(this.location.pathname.endsWith(path)).to.be.true;
      });
    });

    describe('Lost item policy link', () => {
      beforeEach(async () => {
        await FeeFineDetails.lostItemPolicyClick();
      });

      it('should navigate to', function () {
        const path = '/settings/circulation/lost-item-fee-policy/48a3115d-d476-4582-b6a8-55c09eed7ec7';
        expect(this.location.pathname.endsWith(path)).to.be.true;
      });
    });
  });

  describe('visit Fee/fine details', () => {
    beforeEach(async function () {
      this.visit('/users/preview/ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd');
      await FeeFineHistoryInteractor.whenSectionLoaded();
      await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
      await FeeFineHistoryInteractor.openAccounts.click();
      await FeeFineHistoryInteractor.rows(4).click();
    });

    it('displays account actions section', () => {
      expect(FeeFineDetails.isPresent).to.be.true;
    });

    describe('Pay fee/fine', () => {
      beforeEach(async () => {
        await FeeFineDetails.payButton.click();
      });

      it('displays payment modal', () => {
        expect(FeeFineDetails.actionModal.isPresent).to.be.true;
      });

      it('displays payment modal amount field', () => {
        expect(FeeFineDetails.actionModalAmountField.value).to.equal('500.00');
      });

      describe('Choose payment method', () => {
        beforeEach(async () => {
          await FeeFineDetails.actionModalAmountField.pressTab();
          await FeeFineDetails.actionModalSelect.selectAndBlur('visa');
        });

        it('displays payment modal select option', () => {
          expect(FeeFineDetails.actionModalSelect.value).to.equal('visa');
        });

        it('displays pay button', () => {
          expect(FeeFineDetails.actionModalSubmitButton.isPresent).to.be.true;
          expect(FeeFineDetails.actionModalSubmitButtonIsDisabled).to.be.false;
        });

        describe('pay fine', () => {
          beforeEach(async () => {
            await FeeFineDetails.actionModalSubmitButton.click();
          });

          it('displays confirmation modal', () => {
            expect(FeeFineDetails.actionConfirmationModal.body.isPresent).to.be.true;
          });

          describe('confirm fine payment', () => {
            beforeEach(async () => {
              await FeeFineDetails.actionConfirmationModal.confirmButton.click();
            });

            it('show successfull callout', () => {
              expect(FeeFineDetails.callout.successCalloutIsPresent).to.be.true;
            });
          });
        });
      });
    });

    describe('Waive fee/fine', () => {
      beforeEach(async () => {
        await FeeFineDetails.waiveButton.click();
      });

      it('displays waive modal', () => {
        expect(FeeFineDetails.actionModal.isPresent).to.be.true;
      });

      it('displays waive modal amount field', () => {
        expect(FeeFineDetails.actionModalAmountField.value).to.equal('500.00');
      });

      describe('Choose waive reason', () => {
        beforeEach(async () => {
          await FeeFineDetails.actionModalAmountField.pressTab();
          await FeeFineDetails.actionModalSelect.selectAndBlur('waiveReason');
        });

        it('displays waive modal select option', () => {
          expect(FeeFineDetails.actionModalSelect.value).to.equal('waiveReason');
        });

        it('displays waive button', () => {
          expect(FeeFineDetails.actionModalSubmitButton.isPresent).to.be.true;
          expect(FeeFineDetails.actionModalSubmitButtonIsDisabled).to.be.false;
        });

        describe('waive fine', () => {
          beforeEach(async () => {
            await FeeFineDetails.actionModalSubmitButton.click();
          });

          it('displays confirmation modal', () => {
            expect(FeeFineDetails.actionConfirmationModal.body.isPresent).to.be.true;
          });

          describe('confirm fine waivement', () => {
            beforeEach(async () => {
              await FeeFineDetails.actionConfirmationModal.confirmButton.click();
            });

            it('show successfull callout', () => {
              expect(FeeFineDetails.callout.successCalloutIsPresent).to.be.true;
            });
          });
        });
      });
    });

    describe('Transfer fee/fine', () => {
      beforeEach(async () => {
        await FeeFineDetails.transferButton.click();
      });

      it('displays transfer modal', () => {
        expect(FeeFineDetails.actionModal.isPresent).to.be.true;
      });

      it('displays transfer modal amount field', () => {
        expect(FeeFineDetails.actionModalAmountField.value).to.equal('500.00');
      });

      describe('Choose transfer account name', () => {
        beforeEach(async () => {
          await FeeFineDetails.actionModalAmountField.pressTab();
          await FeeFineDetails.actionModalSelect.selectAndBlur('transferAccount');
        });

        it('displays transfer modal select option', () => {
          expect(FeeFineDetails.actionModalSelect.value).to.equal('transferAccount');
        });

        it('displays transfer button', () => {
          expect(FeeFineDetails.actionModalSubmitButton.isPresent).to.be.true;
          expect(FeeFineDetails.actionModalSubmitButtonIsDisabled).to.be.false;
        });

        describe('transfer fine', () => {
          beforeEach(async () => {
            await FeeFineDetails.actionModalSubmitButton.click();
          });

          it('displays confirmation modal', () => {
            expect(FeeFineDetails.actionConfirmationModal.body.isPresent).to.be.true;
          });

          describe('confirm fine transfering', () => {
            beforeEach(async () => {
              await FeeFineDetails.actionConfirmationModal.confirmButton.click();
            });

            it('show successfull callout', () => {
              expect(FeeFineDetails.callout.successCalloutIsPresent).to.be.true;
            });
          });
        });
      });
    });

    describe('Refund fee/fine', () => {
      beforeEach(async () => {
        await FeeFineDetails.refundButton.click();
      });

      it('displays refund modal', () => {
        expect(FeeFineDetails.actionModal.isPresent).to.be.true;
      });

      it('displays refund modal amount field', () => {
        expect(FeeFineDetails.actionModalAmountField.value).to.equal('100.00');
      });

      describe('Choose refund reason name', () => {
        beforeEach(async () => {
          await FeeFineDetails.actionModalAmountField.pressTab();
          await FeeFineDetails.actionModalSelect.selectAndBlur('Overpaid');
        });

        it('displays refund modal select option', () => {
          expect(FeeFineDetails.actionModalSelect.value).to.equal('Overpaid');
        });

        it('displays refund button', () => {
          expect(FeeFineDetails.actionModalSubmitButton.isPresent).to.be.true;
          expect(FeeFineDetails.actionModalSubmitButtonIsDisabled).to.be.false;
        });

        describe('refund fine', () => {
          beforeEach(async () => {
            await FeeFineDetails.actionModalSubmitButton.click();
          });

          it('displays confirmation modal', () => {
            expect(FeeFineDetails.actionConfirmationModal.body.isPresent).to.be.true;
          });

          describe('confirm fine transfering', () => {
            beforeEach(async () => {
              await FeeFineDetails.actionConfirmationModal.confirmButton.click();
            });

            it('show successfull callout', () => {
              expect(FeeFineDetails.callout.successCalloutIsPresent).to.be.true;
            });
          });
        });
      });
    });
  });
});
