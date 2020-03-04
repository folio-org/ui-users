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
  setupApplication();

  describe('when there are custom fields saved', () => {
    beforeEach(async function () {
      this.server.get('/custom-fields', () => ({
        'customFields': [
          {
            id: 'daf98472-7311-487d-a018-65fb2496e3e4',
            name: 'Custom field 1',
            refId: 'custom-field-_1',
            type: 'TEXTBOX_LONG',
            entityType: 'user',
            visible: false,
            required: false,
            order: 1,
            helpText: 'Very helpful text',
            metadata: {
              createdDate: '2020-02-25T09:06:16.182+0000',
              createdByUserId: '6be4382b-cfa9-5571-a7ed-cb89536de85b',
              createdByUsername: 'diku_admin',
              updatedDate: '2020-02-25T09:06:16.182+0000',
              updatedByUserId: '6be4382b-cfa9-5571-a7ed-cb89536de85b'
            }
          },
          {
            id: '4e8f8e16-8fd2-4d69-8d64-3ee8c0bb385f',
            name: 'Custom field 2',
            refId: 'custom-field-_2',
            type: 'TEXTBOX_SHORT',
            entityType: 'user',
            visible: true,
            required: true,
            order: 2,
            helpText: '',
            metadata: {
              createdDate: '2020-02-25T09:06:16.182+0000',
              createdByUserId: '6be4382b-cfa9-5571-a7ed-cb89536de85b',
              createdByUsername: 'diku_admin',
              updatedDate: '2020-02-25T09:06:16.182+0000',
              updatedByUserId: '6be4382b-cfa9-5571-a7ed-cb89536de85b'
            }
          },
        ],
        'totalRecords': 2
      }));

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
      expect(CustomFieldsInteractor.customFieldsList.set().length).to.equal(2);
    });
  });

  describe('when there are no custom fields saved', () => {
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
    beforeEach(async function () {
      this.server.get('/custom-fields', () => ({
        'customFields': [],
        'totalRecords': 0
      }));

      this.visit('/settings/users/custom-fields');
      await CustomFieldsInteractor.whenLoaded();
      await CustomFieldsInteractor.clickEditFieldsButton();
    });

    it('should redirect to Custom Fields edit page', function () {
      expect(this.location.pathname).to.equal('/users/custom-fields/edit');
    });
  });

  describe('permissions', () => {
    const customFields = [
      {
        id: 'daf98472-7311-487d-a018-65fb2496e3e4',
        name: 'Custom field 1',
        refId: 'custom-field-_1',
        type: 'TEXTBOX_LONG',
        entityType: 'user',
        visible: false,
        required: false,
        order: 1,
        helpText: 'Very helpful text',
        metadata: {
          createdDate: '2020-02-25T09:06:16.182+0000',
          createdByUserId: '6be4382b-cfa9-5571-a7ed-cb89536de85b',
          createdByUsername: 'diku_admin',
          updatedDate: '2020-02-25T09:06:16.182+0000',
          updatedByUserId: '6be4382b-cfa9-5571-a7ed-cb89536de85b'
        }
      },
      {
        id: '4e8f8e16-8fd2-4d69-8d64-3ee8c0bb385f',
        name: 'Custom field 2',
        refId: 'custom-field-_2',
        type: 'TEXTBOX_SHORT',
        entityType: 'user',
        visible: true,
        required: true,
        order: 2,
        helpText: '',
        metadata: {
          createdDate: '2020-02-25T09:06:16.182+0000',
          createdByUserId: '6be4382b-cfa9-5571-a7ed-cb89536de85b',
          createdByUsername: 'diku_admin',
          updatedDate: '2020-02-25T09:06:16.182+0000',
          updatedByUserId: '6be4382b-cfa9-5571-a7ed-cb89536de85b'
        }
      },
    ];

    beforeEach(function () {
      this.server.get('/custom-fields', () => ({
        'customFields': customFields,
        'totalRecords': 2
      }));
    });

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
          expect(CustomFieldsInteractor.deleteCustomFieldButtonsCount).to.equal(customFields.length);
        });
      });
    });
  });
});
