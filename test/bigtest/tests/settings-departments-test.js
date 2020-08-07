import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import DepartmentsInteractor from '../interactors/settings-departments';

import translation from '../../../translations/ui-users/en';

describe('Settings departments', () => {
  setupApplication();

  describe('visit users-settings: departments', () => {
    beforeEach(async function () {
      this.visit('/settings/users/departments');

      await DepartmentsInteractor.whenLoaded();
      await DepartmentsInteractor.whenListLoaded();
    });

    it('should display departments page', () => {
      expect(DepartmentsInteractor.isPresent).to.be.true;
    });

    it('should display correct pane title', () => {
      expect(DepartmentsInteractor.paneTitle).to.equal('Departments');
    });

    it('should display departments list', () => {
      expect(DepartmentsInteractor.list.rowCount).to.equal(2);
    });

    it('delete option should be disabled for second department', () => {
      expect(DepartmentsInteractor.list.rows(1).deleteButtonPresent).to.be.false;
    });

    describe('when clicking New button', () => {
      beforeEach(async () => {
        await DepartmentsInteractor.clickNewButton();
      });

      it('should display department form', () => {
        expect(DepartmentsInteractor.list.rows(0).nameInput.isPresent).to.be.true;
        expect(DepartmentsInteractor.list.rows(0).codeInput.isPresent).to.be.true;
      });

      describe('when setting already presented name value', () => {
        beforeEach(async () => {
          await DepartmentsInteractor.list.rows(0).nameInput.fillAndBlur('Test1');
        });

        it('should display validation message', () => {
          expect(DepartmentsInteractor.list.rows(0).nameValidationMessage).to.equal(translation['settings.departments.name.error']);
        });
      });

      describe('when setting already presented code value', () => {
        beforeEach(async () => {
          await DepartmentsInteractor.list.rows(0).codeInput.fillAndBlur('test1');
        });

        it('should display validation message', () => {
          expect(DepartmentsInteractor.list.rows(0).codeValidationMessage).to.equal(translation['settings.departments.code.error']);
        });
      });

      describe('when setting empty code value', () => {
        beforeEach(async () => {
          await DepartmentsInteractor.list.rows(0).codeInput.fillAndBlur('');
        });

        it('should display validation message', () => {
          expect(DepartmentsInteractor.list.rows(0).codeValidationMessage).to.equal(translation['settings.departments.code.required']);
        });
      });
    });
  });
});
