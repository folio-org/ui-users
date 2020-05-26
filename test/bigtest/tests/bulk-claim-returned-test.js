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

  describe('visit open loans', () => {
    beforeEach(async function () {
      const user = this.server.create('user');

      this.server.createList('loan', 3, { status: { name: 'Open' }, userId: user.id });
      this.visit(`/users/${user.id}/loans/open`);

      await LoansInteractor.whenLoaded();
      await LoansInteractor.selectAllCheckboxes();
      await LoansInteractor.clickClaimReturned();
    });

    it('should show bulk claim returned modal', () => {
      expect(LoansInteractor.bulkClaimReturnedModal.isPresent).to.be.true;
    });
  });
});
