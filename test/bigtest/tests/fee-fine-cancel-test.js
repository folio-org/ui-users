import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';
import FeeFineDetails from '../interactors/fee-fine-details';

describe('Cancel fee/fine', () => {
  setupApplication({
    currentUser: {
      curServicePoint: { id: 1 },
    },
  });

  let user;
  beforeEach(async function () {
    const owner = this.server.create('owner', {
      owner: 'testOwner',
      id: 'testOwner'
    });
    const feeFine = this.server.create('feefine', {
      feeFineType: 'testFineType',
      id: 'testFineType',
      ownerId: owner.id,
      defaultAmount: 500
    });
    user = this.server.create('user');
    const account = this.server.create('account', { userId: user.id });
    this.server.create('feefineaction', {
      accountId: account.id,
      amountAction: 500,
      balance: 500,
      userId: user.id,
      typeAction: feeFine.feeFineType,
    });
    this.server.get('/accounts');
    this.server.get('/accounts/:id', (schema, request) => {
      return schema.accounts.find(request.params.id).attrs;
    });
    this.server.get('/feefines');

    this.visit(`/users/preview/${user.id}`);
  });

  beforeEach(async () => {
    await FeeFineHistoryInteractor.whenSectionLoaded();
    await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
    await FeeFineHistoryInteractor.openAccounts.click();
    await FeeFineHistoryInteractor.rows(0).click();
    await FeeFineDetails.whenLoaded();
  });

  it('displays account actions section', () => {
    expect(FeeFineDetails.isPresent).to.be.true;
  });

  it('displays error button active', () => {
    expect(FeeFineDetails.errorButtonIsDisabled).to.be.false;
  }).timeout(2000);

  describe('Click error button', () => {
    beforeEach(async () => {
      await FeeFineDetails.errorButton.click();
    });

    it('displays error modal', () => {
      expect(FeeFineDetails.errorModal.isPresent).to.be.true;
    });

    it('displays error modal submit button', () => {
      expect(FeeFineDetails.errorModalSubmit.isPresent).to.be.true;
    });

    it('displays error modal comment field', () => {
      expect(FeeFineDetails.errorComment.isPresent).to.be.true;
    });

    describe('Fill cancel reason', () => {
      beforeEach(async () => {
        await FeeFineDetails.errorComment.focusTextArea();
        await FeeFineDetails.errorComment.fillAndBlur('Cancellation reason');
      });

      it('displays cancel reason value', () => {
        expect(FeeFineDetails.errorComment.val)
          .to
          .equal('Cancellation reason');
      });

      it('displays active submit cancel button', () => {
        expect(FeeFineDetails.errorModalSubmitIsDisabled).to.be.false;
      });

      describe('cancel fine', () => {
        beforeEach(async () => {
          await FeeFineDetails.errorModalSubmit.click();
        });

        it('show successfull callout', () => {
          expect(FeeFineDetails.callout.successCalloutIsPresent).to.be.true;
        });
      });
    });
  });
});
