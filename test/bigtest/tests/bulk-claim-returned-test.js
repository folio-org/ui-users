import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import LoansInteractor from '../interactors/open-loans';

describe.only('Bulk claim returned modal', () => {
  setupApplication({
    permissions: {
      'circulation.loans.collection.get': true
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

  });

  describe('Working with checked out items', () => {
    beforeEach(async function () {
      const user = this.server.create('user');

      this.server.createList('loan', 3, { status: { name: 'Open' }, userId: user.id });
      this.visit(`/users/${user.id}/loans/open`);

      await LoansInteractor.whenLoaded();
      await LoansInteractor.selectAllCheckboxes();
      await LoansInteractor.clickClaimReturned();
    });

    it('shows the bulk claim returned modal', () => {
      expect(LoansInteractor.bulkClaimReturnedModal.isPresent).to.be.true;
    });
  });
});
