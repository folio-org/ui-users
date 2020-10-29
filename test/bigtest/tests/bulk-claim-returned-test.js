import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import DummyComponent from '../helpers/DummyComponent';
import LoansInteractor from '../interactors/open-loans';

describe('Bulk claim returned modal', () => {
  const requestsPath = '/requests';
  const requestsAmount = 2;

  setupApplication({
    permissions: {
      'circulation.loans.collection.get': true,
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
});
