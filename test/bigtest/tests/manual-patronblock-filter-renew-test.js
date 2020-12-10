import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import PatronBlocksInteractor from '../interactors/manual-blocks';
import LoansInteractor from '../interactors/open-loans';

describe('Test Patron Blocks Renewals', () => {
  setupApplication({
    scenarios: ['manual-blocks-filter-renew'],
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true
    },
  });

  describe('visit open loans', () => {
    beforeEach(async function () {
      const user = this.server.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });

      this.server.createList('loan', 3, { status: { name: 'Open' }, userId: user.id });
      this.visit(`/users/${user.id}/loans/open`);

      await LoansInteractor.whenLoaded();
    });

    describe('open modal block', () => {
      beforeEach(async function () {
        await PatronBlocksInteractor.selectAllCheckbox();
        await PatronBlocksInteractor.patronBlockModalRenewLoan();
      });

      it('check if the modal only shows blocks for renewals', () => {
        expect(PatronBlocksInteractor.patronBlockReasonLabel).to.equal('Block for renewals');
      }).timeout(4000);
    });
  });
});
