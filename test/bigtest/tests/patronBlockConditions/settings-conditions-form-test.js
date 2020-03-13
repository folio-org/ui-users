import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../../helpers/setup-application';
import SettingsConditionsForm from '../../interactors/patronBlockConditions/settings-conditions-form';

describe('Conditions form', () => {
  let condition;
  let conditionData;

  setupApplication();

  describe('Visit condition form', () => {
    beforeEach(async function () {
      condition = await this.server.createList('patronBlockCondition', 6);
      conditionData = condition.map((c) => c.attrs);

      this.visit(`/settings/users/conditions/${conditionData[0].id}`);
      console.log('conditionData');
      console.log(conditionData);
    });

    it('has conditions form', () => {
      expect(SettingsConditionsForm.form).to.be.true;
    });

    it('should have checkboxes', () => {
      expect(SettingsConditionsForm.blockBorrowing).to.equal(conditionData[0].blockBorrowing);
      expect(SettingsConditionsForm.blockRenewals).to.equal(conditionData[0].blockRenewals);
      expect(SettingsConditionsForm.blockRequests).to.equal(conditionData[0].blockRequests);
    });
  });
});
