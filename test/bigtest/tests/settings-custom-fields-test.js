import { expect } from 'chai';

import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import CustomFieldsInteractor from '../interactors/settings-custom-fields';

describe('Settings custom fields', () => {
  describe('when there are custom fields saved', () => {
    before(() => {
      setupApplication({
        permissions: ['ui-users.settings.customfields.edit'],
      });
    });

    beforeEach(async function () {
      this.visit('/settings/users/custom-fields');

      await CustomFieldsInteractor.whenCustomFieldsLoaded();
    });

    it('should render New/Edit button', () => {
      expect(CustomFieldsInteractor.editFieldsButtonPresent).to.be.true;
    });

    it('should render list of custom field accordions', () => {
      expect(CustomFieldsInteractor.customFieldsList.isPresent);
    });

    it('should render all available custom fields', () => {
      expect(CustomFieldsInteractor.customFieldsList.set().length).to.equal(4);
    });
  });

  describe('when there are no custom fields saved', () => {
    before(() => {
      setupApplication({
        permissions: ['ui-users.settings.customfields.edit'],
      });
    });

    beforeEach(async function () {
      this.server.get('/custom-fields', () => ({
        'customFields': [],
        'totalRecords': 0
      }));

      this.visit('/settings/users/custom-fields');
      await CustomFieldsInteractor.whenLoaded();
    });

    it('should render no custom fields message', () => {
      expect(CustomFieldsInteractor.noCustomFieldsMessagePresent).to.be.true;
    });
  });

  describe('when clicking on Edit button', () => {
    before(() => {
      setupApplication({
        permissions: ['ui-users.settings.customfields.edit'],
      });
    });

    beforeEach(async function () {
      this.visit('/settings/users/custom-fields');
      await CustomFieldsInteractor.whenLoaded();
      await CustomFieldsInteractor.clickEditFieldsButton();
    });

    it('should redirect to Custom Fields edit page', function () {
      expect(this.location.pathname).to.equal('/settings/users/custom-fields/edit');
    });
  });

  describe('permissions', () => {
    describe('when user does not have view permissions', () => {
      beforeEach(async function () {
        this.visit('/settings/users/custom-fields');
      });

      it('should not display Custom fields pane', () => {
        expect(CustomFieldsInteractor.viewCustomFieldsPaneIsPresent).to.be.false;
      });
    });

    describe('when user does have view permissions', () => {
      before(() => {
        setupApplication({
          permissions: ['ui-users.settings.customfields.view'],
        });
      });

      beforeEach(async function () {
        this.visit('/settings/users/custom-fields');
        await CustomFieldsInteractor.whenLoaded();
      });

      it('should display Custom fields pane', () => {
        expect(CustomFieldsInteractor.viewCustomFieldsPaneIsPresent).to.be.true;
      });
    });

    describe('when user does not have edit permissions', () => {
      before(() => {
        setupApplication({
          permissions: ['ui-users.settings.customfields.view'],
        });
      });

      describe('and visits Settings > Users > Custom Fields page', () => {
        beforeEach(async function () {
          this.visit('/settings/users/custom-fields');
          await CustomFieldsInteractor.whenLoaded();
        });

        it('should not render Edit button', () => {
          expect(CustomFieldsInteractor.editFieldsButtonPresent).to.be.false;
        });
      });

      describe('and visits Edit Custom Fields page', () => {
        beforeEach(async function () {
          this.visit('/user/custom-fields/edit');
          await CustomFieldsInteractor.whenLoaded();
        });

        it('should not display edit custom fields form', () => {
          expect(CustomFieldsInteractor.editCustomFieldsPaneIsPresent).to.be.false;
        });
      });
    });

    describe('when user has edit permissions', () => {
      before(() => {
        setupApplication({
          permissions: ['ui-users.settings.customfields.edit'],
        });
      });

      describe('and visits Settings > Users > Custom Fields page', () => {
        beforeEach(async function () {
          this.visit('/settings/users/custom-fields');
          await CustomFieldsInteractor.whenLoaded();
        });

        it('should render Edit button', () => {
          expect(CustomFieldsInteractor.editFieldsButtonPresent).to.be.true;
        });
      });

      describe('and visits Edit Custom Fields page', () => {
        beforeEach(async function () {
          this.visit('/settings/users/custom-fields');
          await CustomFieldsInteractor.whenLoaded();
          await CustomFieldsInteractor.clickEditFieldsButton();
        });

        it('should display edit custom fields form', () => {
          expect(CustomFieldsInteractor.editCustomFieldsPaneIsPresent).to.be.true;
        });
      });
    });

    describe('when user does not have delete permissions', () => {
      before(() => {
        setupApplication({
          permissions: ['ui-users.settings.customfields.edit'],
        });
      });

      describe('and visits Edit Custom Fields page', () => {
        beforeEach(async function () {
          this.visit('/settings/users/custom-fields');
          await CustomFieldsInteractor.whenLoaded();
          await CustomFieldsInteractor.clickEditFieldsButton();
        });

        it('should not render delete buttons', () => {
          expect(CustomFieldsInteractor.deleteCustomFieldButtonsCount).to.equal(0);
        });
      });
    });

    describe('when user does have delete permissions', () => {
      before(() => {
        setupApplication({
          permissions: ['ui-users.settings.customfields.delete'],
        });
      });

      describe('and visits Edit Custom Fields page', () => {
        beforeEach(async function () {
          this.visit('/settings/users/custom-fields');
          await CustomFieldsInteractor.whenLoaded();
          await CustomFieldsInteractor.clickEditFieldsButton();
        });

        it('should render all delete buttons', () => {
          expect(CustomFieldsInteractor.deleteCustomFieldButtonsCount).to.equal(4);
        });
      });
    });
  });
});
