import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import {
  visit
} from '@bigtest/react';
import {
  Interactor
} from '@bigtest/interactor';
import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor'; // eslint-disable-line
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import InstanceViewPage from '../interactors/user-view-page';
import ChargeFeeFineInteractor from '../interactors/charge-fee-fine';

describe('Charge fee/fine', () => {
  const chargeForm = new ChargeFeeFineInteractor();
  setupApplication({
    currentUser: {
      curServicePoint: { id: 1 },
    },
  });

  describe('from the user detail view', () => {
    const userDetail = InstanceViewPage;
    const accountsSect = new AccordionInteractor('#accountsSection');
    const actionButton = new Interactor('a[href*=charge]');
    let loan;
    beforeEach(async function () {
      const owner = this.server.create('owner', { owner: 'testOwner', id: '1', servicePointOwner: [{ value: 1, label: 'Test Point' }] });
      this.server.create('feefine',
        { feeFineType: 'testFineType',
          ownerId: owner.id,
          defaultAmount: 500.00 });
      this.server.create('feefine', {
        feeFineType: 'automaticFineType',
        automatic: true,
        ownerId: owner.id,
        defaultAmount: 10.00
      });
      loan = this.server.create('loan', { status: { name: 'Open' } });
      visit(`/users/preview/${loan.userId}`);
      await userDetail.whenLoaded();
    });

    it('displays the fees and fines accordion', () => {
      expect(accountsSect.isPresent).to.be.true;
    });

    describe('click the add fee fine action', () => {
      beforeEach(async () => {
        await accountsSect.clickHeader();
        await actionButton.click();
      });

      it('displays the "Charge fee fine" form', () => {
        expect(chargeForm.form.isPresent).to.be.true;
      });

      it('should show only manual fee.fine types', () => {
        expect(chargeForm.typeSelect.optionCount).to.equal(1);
      });

      describe('cancel the charge', () => {
        beforeEach(async () => {
          await chargeForm.clickCancel();
        });

        it('navigate to previous page', function () {
          expect(this.location.pathname).to.equal(`/users/${loan.userId}/accounts/open`);
        });
      });

      describe('initial owner desk', () => {
        it('should show owner desk', () => {
          expect(chargeForm.ownerSelect.value).to.equal('1');
        });
      });

      describe('set the owner', () => {
        beforeEach(async () => {
          await chargeForm.ownerSelect.selectAndBlur('testOwner');
        });

        it('populates the fee/fine type select', () => {
          expect(chargeForm.typeSelect.optionCount).to.be.greaterThan(1);
        });

        describe('set the type', () => {
          beforeEach(async () => {
            await chargeForm.typeSelect.selectAndBlur('testFineType');
          });

          it('should apply the amount', () => {
            expect(chargeForm.amountField.value).to.equal('500.00');
          });

          describe('submit the charge', () => {
            beforeEach(async () => {
              await chargeForm.clickSubmitCharge();
            });

            it('navigate to previous page', function () {
              expect(this.location.pathname).to.equal(`/users/${loan.userId}/charge`);
            });
          });
        });
      });
    });
  });
});
