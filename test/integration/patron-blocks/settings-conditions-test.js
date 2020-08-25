import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../../helpers/setup-application';
import ConditionSettings from '../../interactors/parton-blocks/settings-conditions';

describe('Patron block conditions ', () => {
  setupApplication();

  describe('Settings -> Users -> Conditions', () => {
    beforeEach(function () {
      this.server.createList('patronBlockCondition', 6);
      this.visit('/settings/users/conditions');
    });

    it('has conditions list', () => {
      expect(ConditionSettings.hasList).to.be.true;
    });

    it('has 6 conditions and names', () => {
      expect(ConditionSettings.conditionsCount).to.equal(6);
    });
  });
});
