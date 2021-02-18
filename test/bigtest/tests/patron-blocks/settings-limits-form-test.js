import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { feeFineBalanceId } from '../../../../src/constants';

import setupApplication from '../../helpers/setup-application';
import SettingsLimitsForm from '../../interactors/parton-blocks/settings-limits-form';

describe('Patron blocks limits form', () => {
  let condition;
  let conditionData;

  const validationMessage = 'Must be blank or a number from 0 to 999,999';
  const feeFineValidationMessage = 'Must be blank or a number from 0.00 to 999,999.99';

  setupApplication();

  describe('Visit patron blocks limits form', () => {
    beforeEach(async function () {
      condition = await this.server.createList('patronBlockCondition', 5);
      await this.server.create('patronBlockCondition', { id: feeFineBalanceId });
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
      expect(SettingsLimitsForm.limitField().length).to.equal(condition.length + 1);
    });

    it('should have limit label', () => {
      expect(SettingsLimitsForm.limitFieldLabel(0).text).to.equal(conditionData[0].name);
    });

    it('should have Save button', () => {
      expect(SettingsLimitsForm.saveButton.isPresent).to.be.true;
      expect(SettingsLimitsForm.isSaveButtonDisabled).to.equal(true);
    });

    describe('create limit value', () => {
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
        expect(SettingsLimitsForm.errorMessage.text).to.equal(validationMessage);
      });
    });

    describe('set float limit value', () => {
      beforeEach(async function () {
        await SettingsLimitsForm.limitField(0)
          .fillAndBlur(12.5);
      });

      it('should show error message', () => {
        expect(SettingsLimitsForm.errorMessage.isPresent).to.be.true;
        expect(SettingsLimitsForm.errorMessage.text).to.equal(validationMessage);
      });
    });

    describe('set invalid limit value for fee fine limit', () => {
      beforeEach(async function () {
        await SettingsLimitsForm.limitField(5)
          .fillAndBlur(-12);
      });

      it('should show error message', () => {
        expect(SettingsLimitsForm.errorMessage.isPresent).to.be.true;
        expect(SettingsLimitsForm.errorMessage.text).to.equal(feeFineValidationMessage);
      });
    });

    describe('save float limit value for fee fine limit', () => {
      beforeEach(async function () {
        await SettingsLimitsForm.limitField(5).fillAndBlur(12.5);
        await SettingsLimitsForm.saveButton.click();
      });

      it('should appear callout message', () => {
        expect(SettingsLimitsForm.calloutMessage.successCalloutIsPresent).to.be.true;
      });
    });
  });

  describe('Visit patron blocks limits form with existed limits', () => {
    const groupId = 'group4';

    beforeEach(async function () {
      condition = await this.server.createList('patronBlockCondition', 6);
      conditionData = condition.map((c) => c.attrs);

      await this.server.create('patronBlockLimit', {
        conditionId: conditionData[0].id,
        patronGroupId: groupId,
        value: 12,
      });

      this.visit(`/settings/users/limits/${groupId}`);

      await SettingsLimitsForm.whenLoaded();
    });

    it('has limits form', () => {
      expect(SettingsLimitsForm.form.isPresent).to.be.true;
    });

    describe('remove limit value', () => {
      beforeEach(async function () {
        await SettingsLimitsForm.limitField(0)
          .fillAndBlur('');
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
  });

  describe('Visit patron blocks limits form with existed limits', () => {
    const groupId = 'group4';

    beforeEach(async function () {
      condition = await this.server.createList('patronBlockCondition', 6);
      conditionData = condition.map((c) => c.attrs);

      await this.server.create('patronBlockLimit', {
        conditionId: conditionData[0].id,
        patronGroupId: groupId,
        value: 12,
      });

      this.visit(`/settings/users/limits/${groupId}`);

      await SettingsLimitsForm.whenLoaded();
    });

    it('has limits form', () => {
      expect(SettingsLimitsForm.form.isPresent).to.be.true;
    });

    describe('update limit value', () => {
      beforeEach(async function () {
        await SettingsLimitsForm.limitField(0)
          .fillAndBlur(5);
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
  });
});
