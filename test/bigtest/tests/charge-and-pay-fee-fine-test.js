import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import {
  visit
} from '@bigtest/react';
import { expect } from 'chai';

import translations from '../../../translations/ui-users/en';
import setupApplication from '../helpers/setup-application';
import ChargeFeeFineInteractor from '../interactors/charge-fee-fine';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';
import FeeFineDetails from '../interactors/fee-fine-details';

describe('Charge and pay fee/fine', () => {
  const chargeFeeFine = new ChargeFeeFineInteractor();
  setupApplication({
    currentUser: {
      curServicePoint: { id: 1 },
    },
  });

  describe('from the user detail view', () => {
    let user;
    let account;
    beforeEach(async function () {
      const owner = this.server.create('owner', {
        owner: 'testOwner',
        id: 'testOwner'
      });
      this.server.create('payment', {
        nameMethod: 'visa',
        ownerId: owner.id,
      });
      const feeFine = this.server.create('feefine', {
        feeFineType: 'testFineType',
        id: 'testFineType',
        ownerId: owner.id,
        defaultAmount: 500
      });
      user = this.server.create('user');
      account = this.server.create('account', { userId: user.id, loanId: '' });
      this.server.create('feefineaction', {
        accountId: account.id,
        amountAction: 500,
        balance: 500,
        userId: user.id,
        typeAction: feeFine.feeFineType,
      });
      this.server.create('check-pay', {
        accountId: account.id,
        amount: '500.00',
        allowed: true,
        remainingAmount: '0.00'
      });
      this.server.get('/payments');
      this.server.get('/accounts');
      this.server.get('/accounts/:id', (schema, request) => {
        return schema.accounts.find(request.params.id).attrs;
      });
      this.server.get('/feefines');

      visit(`/users/${user.id}/charge`);
      await chargeFeeFine.whenLoaded();
    });

    it('should display charge form', () => {
      expect(chargeFeeFine.form.isPresent).to.be.true;
    });

    describe('Set Fee/Fine data', async () => {
      beforeEach(async () => {
        await chargeFeeFine.ownerSelect.whenLoaded();
        await chargeFeeFine.ownerSelect.selectAndBlur('testOwner');
      });

      it('should select owner options', () => {
        expect(chargeFeeFine.ownerSelect.optionCount).to.equal(2);
      });

      describe('Set Fee/Fine data', async () => {
        beforeEach(async () => {
          await chargeFeeFine.typeSelect.whenLoaded();
          await chargeFeeFine.typeSelect.selectAndBlur('testFineType');
        });

        it('should select fee fine type options', () => {
          expect(chargeFeeFine.typeSelect.optionCount).to.equal(2);
        });

        it('should display amount', () => {
          expect(chargeFeeFine.amountField.val).to.equal('500.00');
        });

        describe('Charge and pay fee/fine', () => {
          beforeEach(async () => {
            await chargeFeeFine.submitChargeAndPay.click();
          });

          it('displays payment modal', () => {
            expect(chargeFeeFine.paymentModal.isPresent).to.be.true;
          });

          it('displays payment modal amount field', () => {
            expect(chargeFeeFine.paymentModalAmountField.value).to.equal('500.00');
          });

          describe('Choose payment method', () => {
            beforeEach(async () => {
              await chargeFeeFine.paymentModalAmountField.pressTab();
              await chargeFeeFine.paymentModalSelect.selectAndBlur('visa');
            });

            it('displays payment modal select option', () => {
              expect(chargeFeeFine.paymentModalSelect.value).to.equal('visa');
            });

            it('displays pay button', () => {
              expect(chargeFeeFine.paymentModalButton.isPresent).to.be.true;
              expect(chargeFeeFine.paymentModalButtonIsDisabled).to.be.false;
            });

            describe('pay fine', () => {
              beforeEach(async () => {
                await chargeFeeFine.paymentModalButton.click();
              });

              it('displays confirmation modal', () => {
                expect(chargeFeeFine.confirmationModal.body.isPresent).to.be.true;
              });

              describe.skip('confirm fine payment', () => {
                beforeEach(async () => {
                  await chargeFeeFine.confirmationModal.confirmButton.click();
                });

                it('show successfull callout', () => {
                  expect(chargeFeeFine.callout.successCalloutIsPresent).to.be.true;
                });

                describe('visit created Fee/Fine details page', () => {
                  beforeEach(function () {
                    visit(`/users/${user.id}/accounts/view/${account.id}`);
                  });

                  it('displays source of fee/fine', () => {
                    expect(FeeFineHistoryInteractor.mclAccountActions.rows(0).cells(6).content).to.equal('User, Test');
                    expect(FeeFineHistoryInteractor.mclAccountActions.rows(1).cells(6).content).to.equal('User, Test');
                  });

                  it('displays loan details', () => {
                    expect(FeeFineDetails.loanDetails.label.text).to.equal(translations['details.label.loanDetails']);
                    expect(FeeFineDetails.loanDetails.value.text).to.equal('-');
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
