import { expect } from 'chai';
import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import PayInteractor from '../interactors/user-pay';
import setupApplication from '../helpers/setup-application';

describe('Pay fines', () => {
  setupApplication({
    scenarios: ['pay'],
  });

  describe('visit users-details: accounts', () => {
    beforeEach(async function () {
      this.visit('users/1ad737b0-d847-11e6-bf26-cec0c932ce02/accounts/open');

      await PayInteractor.whenLoaded().timeout(5000);
      await PayInteractor.whenVisibled();
    });

    describe('click on pay button', () => {
      beforeEach(async () => {
        await PayInteractor.selectCheckbox();
        await PayInteractor.payButton();
        await PayInteractor.ownerSelect.selectOption('Main Admin1');
      });

      it('display empty value for actions select', () => {
        expect(PayInteractor.actionSelect.val).to.equal('');
      });
    });
  });
});
