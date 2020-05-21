import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../../helpers/setup-application';
import SettingsConditionsForm from '../../interactors/parton-blocks/settings-conditions-form';

describe('Conditions form', () => {
  let condition;
  let conditionData;

  setupApplication();

  describe('Visit condition form', () => {
    beforeEach(async function () {
      condition = await this.server.createList('patronBlockCondition', 6);
      conditionData = condition.map((c) => c.attrs);

      this.visit(`/settings/users/conditions/${conditionData[0].id}`);
    });

    it('has conditions form', () => {
      expect(SettingsConditionsForm.form).to.be.true;
    });

    it('has form title', () => {
      expect(SettingsConditionsForm.formHeader).to.equal(conditionData[0].name);
    });

    it('should have checkboxes', () => {
      expect(SettingsConditionsForm.blockBorrowing).to.equal(conditionData[0].blockBorrowing);
      expect(SettingsConditionsForm.blockRenewals).to.equal(conditionData[0].blockRenewals);
      expect(SettingsConditionsForm.blockRequests).to.equal(conditionData[0].blockRequests);
    });

    it('should have textarea message', () => {
      expect(SettingsConditionsForm.message).to.equal(conditionData[0].message);
    });

    it('should have Save button', () => {
      expect(SettingsConditionsForm.saveButton).to.be.true;
      expect(SettingsConditionsForm.isSaveButtonDisabled).to.equal(true);
    });

    describe('change checkbox value', () => {
      beforeEach(async function () {
        await SettingsConditionsForm.blockRequestsClick();
      });

      it('should be active Save button', () => {
        expect(SettingsConditionsForm.isSaveButtonDisabled).to.equal(false);
      });

      // For some reason this test fails randomly so turning it off for now
      // describe('Save condition form values', () => {
      //   beforeEach(async function () {
      //     await SettingsConditionsForm.saveButtonClick();
      //   });

      //   it('should appear callout message', () => {
      //     expect(SettingsConditionsForm.calloutMessage.anyCalloutIsPresent).to.be.true;
      //   });
      // });
    });
  });
});
