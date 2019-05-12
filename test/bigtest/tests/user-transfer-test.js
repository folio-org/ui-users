import { expect } from 'chai';
import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import TransferInteractor from '../interactors/user-transfer';
import setupApplication from '../helpers/setup-application';

describe.only('Test transfer', () => {
  setupApplication({ scenarios: ['transfers'] });

  beforeEach(async function () {
    await this.visit('users/view/1ad737b0-d847-11e6-bf26-cec0c932ce02?filters=active.inactive&layer=all-accounts&sort=name');
  });

  describe('Test transfer', () => {
    beforeEach(async function () {
      await TransferInteractor.whenLoaded();
      await TransferInteractor.whenVisibled();
    });

    it('renders proper amount of rows', () => {
      expect(TransferInteractor.mclAll.rowCount).to.equal(5);
    });

    describe('check the rows of open accounts', () => {
      beforeEach(async () => {
        await TransferInteractor.openAccounts();
      });

      it('renders proper amount of rows', () => {
        expect(TransferInteractor.mclOpen.rowCount).to.equal(4);
      });

      it('renders appropriate headers', () => {
        expect(TransferInteractor.mclOpen.headers().length).to.be.greaterThan(0);
      });

      describe('active the transfer button', () => {
        beforeEach(async () => {
          await TransferInteractor.selectCheckbox();
          await TransferInteractor.transferButton();
          await TransferInteractor.amount.fillInput('200.00');
          await TransferInteractor.transferAccount.selectOption('USA Bank1');
          await TransferInteractor.comment.fillTextArea('Comment UNAM');
        });

        it('displays a value in the amount field', () => {
          expect(TransferInteractor.amount.val).to.equal('200.00');
        });

        it('updates the value', () => {
          expect(TransferInteractor.comment.val).to.equal('Comment UNAM');
        });

        it('updates the select value', () => {
          expect(TransferInteractor.transferAccount.val).to.equal('USA Bank1');
        });

        describe('cancel the transfer', () => {
          beforeEach(async () => {
            await TransferInteractor.cancel.click();
          });

          it('renders proper amount of rows in the openaccounts section', () => {
            expect(TransferInteractor.mclOpen.rowCount).to.equal(4);
          });
        });
      });

      describe('add a transfer', () => {
        beforeEach(async () => {
          await TransferInteractor.selectCheckbox();
          await TransferInteractor.transferButton();
          await TransferInteractor.amount.fillInput('200.00');
          await TransferInteractor.transferAccount.selectOption('USA Bank1');
          await TransferInteractor.comment.fillTextArea('Comment UNAM');
        });

        it('displays a value in the amount field', () => {
          expect(TransferInteractor.amount.val).to.equal('200.00');
        });

        it('updates the value', () => {
          expect(TransferInteractor.comment.val).to.equal('Comment UNAM');
        });

        it('updates the select value', () => {
          expect(TransferInteractor.transferAccount.val).to.equal('USA Bank1');
        });

        describe('submit and confirm the transfer', () => {
          beforeEach(async () => {
            await TransferInteractor.submit.click();
            await TransferInteractor.confirmation.confirmButton.click();
          });

          it('renders proper amount of rows', () => {
            expect(TransferInteractor.mclOpen.rowCount).to.equal(4);
          });
        });
      });

      describe('amount is less than zero', () => {
        beforeEach(async () => {
          await TransferInteractor.selectCheckbox();
          await TransferInteractor.transferButton();
          await TransferInteractor.amount.fillInput('-200.00');
          await TransferInteractor.transferAccount.selectOption('USA Bank1');
          await TransferInteractor.comment.fillTextArea('Comment UNAM');
        });

        it('show the amount field', () => {
          expect(TransferInteractor.amount.val).to.equal('-200.00');
        });
      });

      describe('transfer amount is greater than total amount', () => {
        beforeEach(async () => {
          await TransferInteractor.selectCheckbox();
          await TransferInteractor.transferButton();
          await TransferInteractor.amount.fillInput('700.00');
          await TransferInteractor.transferAccount.selectOption('USA Bank1');
          await TransferInteractor.notify.click();
        });

        it('show the amount field', () => {
          expect(TransferInteractor.amount.val).to.equal('700.00');
        });
      });

      describe('transfer amount is null', () => {
        beforeEach(async () => {
          await TransferInteractor.selectCheckbox();
          await TransferInteractor.transferButton();
          await TransferInteractor.amount.fillInput('');
          await TransferInteractor.transferAccount.selectOption('USA Bank1');
          await TransferInteractor.notify.click();
        });

        it('show the amount field', () => {
          expect(TransferInteractor.amount.val).to.equal('');
        });
      });
      // transfer many
      describe('go to all accounts', () => {
        beforeEach(async () => {
          await TransferInteractor.allAccounts();
        });

        describe('click on transfer button and close warning modal', () => {
          beforeEach(async () => {
            await TransferInteractor.selectCheckbox();
            await TransferInteractor.transferButton();
            await TransferInteractor.warningTransferCancel();
          });

          it('renders proper amount of rows', () => {
            expect(TransferInteractor.mclAll.rowCount).to.equal(5);
          });

          it('renders appropriate headers', () => {
            expect(TransferInteractor.mclAll.headers().length).to.be.greaterThan(0);
          });
        });

        describe('make the transfer', () => {
          beforeEach(async () => {
            await TransferInteractor.selectCheckbox();
            await TransferInteractor.transferButton();
            await TransferInteractor.rows(0).cells(0).selectOneWarning();
            await TransferInteractor.warningTransferContinue();
            await TransferInteractor.amount.fillInput('400.00');
            await TransferInteractor.transferAccount.selectOption('USA Bank1');
            await TransferInteractor.comment.fillTextArea('Comment UNAM');
            await TransferInteractor.submit.click();
            await TransferInteractor.confirmationModal.confirmButton.click();
          });

          it('renders proper amount of rows', () => {
            expect(TransferInteractor.mclAll.rowCount).to.equal(5);
          });

          it('validate the correct amount on each row after the transfer', () => {
            const dataKeys = ['0.00', '10.00', '20.00', '30.00', '0.00'];

            for (let i = 0; i < 5; i++) {
              expect(TransferInteractor.mclAll.rows(i).cells(5).content).to.equal(dataKeys[i]);
            }
          });
        });
      });
      // END transfer many

      // on sort
      describe('go to all accounts', () => {
        beforeEach(async () => {
          await TransferInteractor.allAccounts();
        });

        describe('testing all headers columns', () => {
          beforeEach(async () => {
            await TransferInteractor.selectCheckbox();
            await TransferInteractor.transferButton();
            await TransferInteractor.mclWarning.headers(1).click();
            await TransferInteractor.mclWarning.headers(2).click();
            await TransferInteractor.mclWarning.headers(3).click();
            await TransferInteractor.mclWarning.headers(4).click();
            await TransferInteractor.mclWarning.headers(5).click();
          });

          it('renders appropriate headers', () => {
            expect(TransferInteractor.mclWarning.headers().length).to.be.greaterThan(0);
          });
        });
      });

      describe('Test all select transfers', () => {
        beforeEach(async () => {
          await TransferInteractor.allAccounts();
        });

        describe('select and deselect all transfers', () => {
          beforeEach(async () => {
            await TransferInteractor.selectCheckbox();
            await TransferInteractor.transferButton();
            await TransferInteractor.selectCheckboxWarning();
            await TransferInteractor.selectCheckboxWarning();
          });

          it('renders appropriate headers', () => {
            expect(TransferInteractor.mclWarning.headers().length).to.be.greaterThan(0);
          });

          describe('click on cancel button in warning modal', () => {
            beforeEach(async () => {
              await TransferInteractor.warningTransferCancel();
            });

            it('renders proper amount of rows', () => {
              expect(TransferInteractor.mclAll.rowCount).to.equal(5);
            });

            it('renders appropriate headers', () => {
              expect(TransferInteractor.mclAll.headers().length).to.be.greaterThan(0);
            });
          });
        });
      });
      // END on sort
    });
  });
});
