import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import PatronBlocksInteractor from '../interactors/manual-blocks';
import LoansInteractor from '../interactors/open-loans';

describe('Test Patron Blocks renewals', () => {
  before(function () {
    setupApplication({
      scenarios: ['manual-blocks'],
      permissions: {
        'manualblocks.collection.get': true,
        'circulation.loans.collection.get': true
      },
    });
  });

  beforeEach(async function () {
    const user = this.server.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });

    this.server.createList('loan', 3, { status: { name: 'Open' }, userId: user.id });
    this.visit(`/users/${user.id}/loans/open`);

    await LoansInteractor.whenLoaded();
    await PatronBlocksInteractor.selectAllCheckbox();
    await PatronBlocksInteractor.patronBlockModalRenewLoan();
  });

  it('displays loans section', () => {
    expect(PatronBlocksInteractor.mclPatronBlockLoan.rowCount).to.equal(3);
  }).timeout(4000);

  describe('displays patron blocks rows', () => {
    beforeEach(async function () {
      await PatronBlocksInteractor.patronBlockModalDetailsLoan();
      this.visit('/users/view/1ad737b0-d847-11e6-bf26-cec0c932ce02');
      await PatronBlocksInteractor.whenSectionLoaded();
      await PatronBlocksInteractor.clickOnPatronBlockSection();
    });

    it('renders proper amount of rows', () => {
      expect(PatronBlocksInteractor.mclPatronBlock.rowCount).to.equal(3);
    });

    describe('onsort view', async () => {
      beforeEach(async () => {
        await PatronBlocksInteractor.mclPatronBlock.headers(0).click();
      });

      it('renders proper amount of rows', () => {
        expect(PatronBlocksInteractor.mclPatronBlock.rowCount).to.equal(3);
      }).timeout(4000);
    });
  });
});
