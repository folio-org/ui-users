import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../../helpers/setup-application';
import SettingsLimitsForm from '../../interactors/parton-blocks/settings-limits-form';

describe('Patron blocks limits form', () => {
  let condition;
  let conditionData;

  setupApplication();

  describe('Visit patron blocks limits form', () => {
    beforeEach(async function () {
      condition = await this.server.createList('patronBlockCondition', 6);
      conditionData = condition.map((c) => c.attrs);

      this.visit('/settings/users/limits/group4');

      await SettingsLimitsForm.whenLoaded();
    });

    it('has limits form', () => {
      expect(SettingsLimitsForm.form.isPresent).to.be.true;
    });

    it('has form title', () => {
      expect(SettingsLimitsForm.formHeader).to.equal('Faculty');
    });

    it('should have limit inputs', () => {
      expect(SettingsLimitsForm.limitField().length).to.equal(condition.length);
    });

    it('should have limit label', () => {
      expect(SettingsLimitsForm.limitFieldLabel(0).text).to.equal(conditionData[0].name);
    });

    it('should have Save button', () => {
      expect(SettingsLimitsForm.saveButton.isPresent).to.be.true;
      expect(SettingsLimitsForm.isSaveButtonDisabled).to.equal(true);
    });

    describe('set limit value', () => {
      beforeEach(async function () {
        await SettingsLimitsForm.limitField(0)
          .fillAndBlur(12);
      });

      it('should be active Save button', () => {
        expect(SettingsLimitsForm.isSaveButtonDisabled).to.equal(false);
      });

      describe('Save limits form value', () => {
        beforeEach(async function () {
          await SettingsLimitsForm.saveButton.click();
        });

        it('should appear callout message', () => {
          expect(SettingsLimitsForm.calloutMessage.successCalloutIsPresent).to.be.true;
        });
      });
    });

    describe('set invalid limit value', () => {
      beforeEach(async function () {
        await SettingsLimitsForm.limitField(0)
          .fillAndBlur(-12);
      });

      it('should show error message', () => {
        expect(SettingsLimitsForm.errorMessage.isPresent).to.be.true;
      });
    });
  });
});
