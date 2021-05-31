import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import DummyComponent from '../helpers/DummyComponent';
import LoansInteractor from '../interactors/open-loans';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';
import { refundClaimReturned } from '../../../src/constants';

describe('Bulk claim returned modal', () => {
  const requestsPath = '/requests';
  const requestsAmount = 2;

  setupApplication({
    permissions: {
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

  describe('Bulk claim returned button', () => {
    beforeEach(async function () {
      const user = this.server.create('user');

      this.server.createList('loan', 3, { status: { name: 'Open' }, userId: user.id });
      this.visit(`/users/${user.id}/loans/open`);

      await LoansInteractor.whenLoaded();
    });

    it('Disables the button if no items are selected', () => {
      expect(LoansInteractor.isBulkClaimReturnedDisabled).to.be.true;
    });

    describe('Working with checked out items', () => {
      beforeEach(async function () {
        await LoansInteractor.selectAllCheckboxes();
        await LoansInteractor.clickClaimReturned();
      });

      it('shows the bulk claim returned modal', () => {
        expect(LoansInteractor.bulkClaimReturnedModal.isPresent).to.be.true;
      });
    });
  });

  describe('clicking bulk claim returned button', () => {
    let loan;

    beforeEach(async function () {
      loan = this.server.create('loan', { status: { name: 'Open' } });

      this.server.createList('request', requestsAmount, { itemId: loan.item.id });
      this.visit(`/users/${loan.userId}/loans/open`);

      await LoansInteractor.whenLoaded();
      await LoansInteractor.selectAllCheckboxes();
      await LoansInteractor.clickClaimReturned();
    });

    it('should display open requests number', () => {
      expect(LoansInteractor.bulkClaimReturnedModal.openRequestsNumber.text).to.equal(requestsAmount.toString());
    });

    describe('clicking on the open requests number link', () => {
      beforeEach(async () => {
        await LoansInteractor.bulkClaimReturnedModal.openRequestsNumber.click();
      });

      it('should redirect to "requests"', function () {
        expect(this.location.pathname).to.equal(requestsPath);
        expect(this.location.search).includes(loan.item.id);
      });
    });
  });

  describe('*****Bulk claim returned button with declare lost item', () => {
    let user;
    let loan;
    beforeEach(async function () {
      user = this.server.create('user');
      loan = this.server.create('loan', {
        userId: user.id,
        status: { name: 'Open' },
        loanPolicyId: 'test',
        item: {
          status: { name: 'Declared lost' }
        },
      });

      const lostItemFee = this.server.create('account', {
        userId: loan.userId,
        status: {
          name: 'Open',
        },
        paymentStatus: {
          name: 'Transferred partially',
        },
        amount: 200,
        remaining: 20,
        feeFineType: 'Lost item fee',
        loanId: loan.id,
      });

      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Lost item fee',
        accountId: lostItemFee.id,
        amountAction: 200,
        balance: 200
      });
      this.server.create('feefineaction', {
        userId: user.id,
        typeAction: 'Transferred partially',
        accountId: lostItemFee.id,
        amountAction: 180,
        balance: 20
      });

      this.server.get('/accounts');
      this.server.get('/feefineactions');

      this.visit(`/users/${user.id}/loans/open`);

      await LoansInteractor.whenLoaded();
    });

    it('Disables the button if no items are selected', () => {
      expect(LoansInteractor.isBulkClaimReturnedDisabled).to.be.true;
    });

    describe('Working with checked out items', () => {
      beforeEach(async function () {
        await LoansInteractor.selectAllCheckboxes();
        await LoansInteractor.clickClaimReturned();
      });

      it('shows the bulk claim returned modal', () => {
        expect(LoansInteractor.bulkClaimReturnedModal.isPresent).to.be.true;
      });

      describe('filling additional information textarea', () => {
        const additionalInfoText = 'text';

        beforeEach(async () => {
          await LoansInteractor.bulkClaimReturnedModal.additionalInfo.focus();
          await LoansInteractor.bulkClaimReturnedModal.additionalInfo.fill(additionalInfoText);
        });

        it('should enable confirm button', () => {
          expect(LoansInteractor.bulkClaimReturnedModal.isConfirmButtonDisabled).to.be.false;
        });

        describe('Clicking confirm button ', () => {
          beforeEach(async () => {
            await LoansInteractor.bulkClaimReturnedModal.confirmButton.click();
            await LoansInteractor.bulkClaimReturnedModal.closeButton.click();
          });

          it('should hide claim returned modal', () => {
            expect(LoansInteractor.bulkClaimReturnedModal.isPresent).to.be.false;
          });

          describe('Visiting fee fine (credit and refund) when incurred after claim returned item', () => {
            beforeEach(async function () {
              this.server.create('loanaction', {
                loan: {
                  ...loan.attrs,
                },
              });
              this.server.get('/accounts');
              this.visit(`/users/preview/${loan.userId}`);
              await FeeFineHistoryInteractor.whenSectionLoaded();
              await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
              await FeeFineHistoryInteractor.openAccounts.click();
            });

            it('renders proper amount of rows', () => {
              expect(FeeFineHistoryInteractor.mclViewFeesFines.rowCount).to.equal(1);
            });

            it('Suspended claim returned payment status', () => {
              expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(0).cells(6).text).to.equal(refundClaimReturned.PAYMENT_STATUS);
            });

            it('Remaining claim returned', () => {
              expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(0).cells(5).text).to.equal('200.00');
            });
          });
        });
      });
    });
  });
});
