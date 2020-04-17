import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../../helpers/setup-application';
import LimitSettings from '../../interactors/parton-blocks/settings-limits';

describe('Patron block limits ', () => {
  setupApplication();

  describe('Settings -> Users -> Conditions', () => {
    beforeEach(function () {
      this.visit('/settings/users/limits');
    });

    it('has limits list', () => {
      expect(LimitSettings.hasList).to.be.true;
    });

    it('has 7 patron groups', () => {
      expect(LimitSettings.limitsCount).to.equal(7);
    });
  });
});
