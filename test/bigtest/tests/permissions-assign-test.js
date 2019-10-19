import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import InstanceViewPage from '../interactors/user-view-page';
import PermissionSetForm from '../interactors/permission-set-form';

describe('Permissions assign', () => {
  setupApplication({ permissions: { 'perms.users.get': true } });
  const permissionsAmount = 10;
  const permissionSetsAmount = 1;

  beforeEach(async function () {
    this.server.createList('permissions', permissionsAmount);
    this.server.createList('permissions', permissionSetsAmount, { mutable: true });
    const user = this.server.create('user');

    this.visit(`/users/preview/${user.id}`);
    await InstanceViewPage.whenLoaded();
  });

  it('edit button is present', () => {
    expect(InstanceViewPage.editButtonPresent).to.be.true;
  });

  describe('entering edit mode', () => {
    beforeEach(async function () {
      await InstanceViewPage.clickEditButton();
      await UserFormPage.whenLoaded();
    });

    describe('add permission button', () => {
      beforeEach(async () => {
        await UserFormPage.togglePermissionAccordionButton.click();
      });

      it('should be displayed', () => {
        expect(UserFormPage.addPermissionButton.isPresent).to.be.true;
      });

      it('should be 0 permissions', () => {
        expect(UserFormPage.permissions().length).to.equal(0);
      });

      describe('add permission button click', () => {
        beforeEach(async function () {
          await UserFormPage.addPermissionButton.click();
        });

        describe('permissions modal', () => {
          it('should be displayed', () => {
            expect(UserFormPage.permissionsModal.isPresent).to.be.true;
          });

          describe('assign all permissions', () => {
            beforeEach(async function () {
              await PermissionSetForm.permissionsModal.permissionsList.selectAllPermissions.click();
            });

            describe('submit button click', () => {
              beforeEach(async function () {
                await UserFormPage.permissionsModal.saveButton.click();
                await UserFormPage.submitButton.click();
              });

              it('user view page should be displayed', () => {
                expect(InstanceViewPage.isPresent).to.be.true;
              });
            });
          });
        });
      });
    });
  });
});
