import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import OpenLoansInteractor from '../interactors/open-loans';

describe('Loans with Aged to lost items', () => {
  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    },
  });

  describe('Visiting open loans list page with Aged to lost item', () => {
    beforeEach(async function () {
      const user = this.server.create('user');

      this.server.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Checked out' } },
        userId: user.id,
      });

      this.server.create('loan', {
        status: { name: 'Open' },
        item: { status: { name: 'Aged to lost' } },
        userId: user.id,
      });

      this.visit(`/users/${user.id}/loans/open`);

      await OpenLoansInteractor.whenLoaded();
    });

    describe('opening dropdown for Aged to lost item', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.actionDropdowns(0).click('button');
      });

      it('should not display change due date button', () => {
        expect(OpenLoansInteractor.actionDropdownChangeDueDateButton.isVisible).to.be.false;
      });
    });

    describe('when an Aged to lost item is selected', () => {
      beforeEach(async () => {
        await OpenLoansInteractor.checkboxes(0).clickInput();
      });

      it('should disable the bulk change due date button', () => {
        expect(OpenLoansInteractor.isBulkChangeDueDateButtonDisabled).to.be.true;
      });

      describe('when a checked out item is selected', () => {
        beforeEach(async () => {
          await OpenLoansInteractor.checkboxes(1).clickInput();
        });

        it('should enable the bulk change due date button', () => {
          expect(OpenLoansInteractor.isBulkChangeDueDateButtonDisabled).to.be.false;
        });
      });
    });
  });
});
