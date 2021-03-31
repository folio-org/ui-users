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
      const owner = this.server.create('owner', { owner: 'testOwner' });
      this.server.create('feefine',
        { feeFineType: 'testFineType',
          createdAt: 'CircDesc',
          ownerId: owner.id,
          defaultAmount: 500.00 });
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

      describe('cancel the charge', () => {
        beforeEach(async () => {
          await chargeForm.clickCancel();
        });

        it('navigate to previous page', function () {
          expect(this.location.pathname).to.equal(`/users/${loan.userId}/accounts/open`);
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

  describe('create fine not assosiated with loan', () => {
    let user;

    beforeEach(async function () {
      const owner = this.server.create('owner', { owner: 'testOwner' });
      user = this.server.create('user');
      this.server.create('feefine',
        {
          feeFineType: 'testFineType',
          createdAt: 'CircDesc',
          ownerId: owner.id,
          defaultAmount: 500.00
        });
      visit(`/users/${user.id}/charge`);
      await chargeForm.whenLoaded();
    });

    it('should display fees/fines form', () => {
      expect(chargeForm.isPresent).to.be.true;
    });

    describe('fill fine info', () => {
      beforeEach(async () => {
        await chargeForm.ownerSelect.selectAndBlur('testOwner');
        await chargeForm.typeSelect.selectAndBlur('testFineType');
      });

      it('should fill amountField', () => {
        expect(chargeForm.amountField.value).to.equal('500.00');
      });

      it('charge and pay buttons should be active', () => {
        expect(chargeForm.isDisabledChargeButton).to.be.false;
        expect(chargeForm.isDisabledChargeAndPayButton).to.be.false;
      });

      describe('charge only new fine', () => {
        beforeEach(async () => {
          await chargeForm.clickSubmitCharge();
        });

        it('should show success callout', () => {
          expect(chargeForm.callout.successCalloutIsPresent).to.be.true;
        });

        it('should reset form values (fee/fine type and amount)', () => {
          expect(chargeForm.typeSelect.value).to.equal('');
          expect(chargeForm.amountField.value).to.equal('');
        });
      });
    });
  });
});
