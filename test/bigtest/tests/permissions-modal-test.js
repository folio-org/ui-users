import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import PermissionSetForm from '../interactors/permission-set-form';
import translation from '../../../translations/ui-users/en';

describe('Permission set form', () => {
  setupApplication({ scenarios: ['comments'] });
  const permissionsAmount = 10;
  let permissions;

  beforeEach(async function () {
    permissions = this.server.createList('permissions', permissionsAmount);
    await this.visit('/settings/users/perms?layer=add');
    await PermissionSetForm.whenLoaded();
  });

  it('permission set form should be displayed', () => {
    expect(PermissionSetForm.isPresent).to.be.true;
  });

  describe('add permission button', () => {
    it('should be displayed', () => {
      expect(PermissionSetForm.addPermissionButton.isPresent).to.be.true;
    });

    it('should be 0 permissions', () => {
      expect(PermissionSetForm.permissions().length).to.equal(0);
    });

    describe('add permission button click', () => {
      beforeEach(async function () {
        await PermissionSetForm.addPermissionButton.click();
      });

      describe('permissions modal', () => {
        it('should be displayed', () => {
          expect(PermissionSetForm.permissionsModal.isPresent).to.be.true;
        });

        it('should have proper label', () => {
          expect(PermissionSetForm.permissionsModal.modalHeader.text).to.equal(translation['permissions.modal.header']);
        });

        describe('search form', () => {
          describe('search field', () => {
            it('should be presented', () => {
              expect(PermissionSetForm.permissionsModal.searchForm.searchField.isPresent).to.be.true;
            });

            it('should be empty', () => {
              expect(PermissionSetForm.permissionsModal.searchForm.searchField.text).to.equal('');
            });

            describe('permission search', () => {
              beforeEach(async function () {
                await PermissionSetForm.permissionsModal.searchForm.searchField.fill(permissions[0].displayName);
                await PermissionSetForm.permissionsModal.searchForm.submitButton.click();
              });

              it('should be one permission', () => {
                expect(PermissionSetForm.permissionsModal.permissionsList.permissions().length).to.equal(1);
              });

              it('should be proper permission', () => {
                expect(PermissionSetForm.permissionsModal.permissionsList.permissions(0).name.text).to.equal(permissions[0].displayName);
              });
            });

            describe('status filter', () => {
              describe('assigned checkbox', () => {
                it('should be presented', () => {
                  expect(PermissionSetForm.permissionsModal.searchForm.assignedCheckbox.isPresent).to.be.true;
                });

                it('should not be checked', () => {
                  expect(PermissionSetForm.permissionsModal.searchForm.assignedCheckboxChecked).to.be.false;
                });
              });

              describe('unassigned checkbox', () => {
                it('should be presented', () => {
                  expect(PermissionSetForm.permissionsModal.searchForm.unassignedCheckbox.isPresent).to.be.true;
                });

                it('should be checked', () => {
                  expect(PermissionSetForm.permissionsModal.searchForm.unassignedCheckboxChecked).to.be.true;
                });
              });
            });

            describe('reset button', () => {
              beforeEach(async function () {
                await PermissionSetForm.permissionsModal.searchForm.searchField.fill(permissions[0].displayName);
              });

              it('search field should have proper text', () => {
                expect(PermissionSetForm.permissionsModal.searchForm.searchField.value).to.equal(permissions[0].displayName);
              });

              it('should be presented', () => {
                expect(PermissionSetForm.permissionsModal.searchForm.resetAllButton.isPresent).to.be.true;
              });

              describe('reset button click', () => {
                beforeEach(async function () {
                  await PermissionSetForm.permissionsModal.searchForm.resetAllButton.click();
                });

                it('search field should be empty', () => {
                  expect(PermissionSetForm.permissionsModal.searchForm.searchField.value).to.equal('');
                });
              });
            });
          });
        });

        describe('assign 2 permissions', () => {
          const assignedPermissionsAmount = 2;

          beforeEach(async function () {
            await PermissionSetForm.permissionsModal.permissionsList.permissions(1).checkBox.click();
            await PermissionSetForm.permissionsModal.permissionsList.permissions(2).checkBox.click();
          });

          it('permissions list should be displayed', () => {
            expect(PermissionSetForm.permissionsModal.permissionsList.isPresent).to.be.true;
          });

          it('only unassigned permissions should be displayed', () => {
            expect(PermissionSetForm.permissionsModal.permissionsList.permissions().length).to.equal(
              permissionsAmount - assignedPermissionsAmount
            );
          });

          describe('show all permissions', () => {
            beforeEach(async function () {
              await PermissionSetForm.permissionsModal.searchForm.assignedCheckbox.click();
            });

            it('permissions list should be displayed', () => {
              expect(PermissionSetForm.permissionsModal.permissionsList.isPresent).to.be.true;
            });

            it('all permissions should be displayed', () => {
              expect(PermissionSetForm.permissionsModal.permissionsList.permissions().length).to.equal(
                permissionsAmount - assignedPermissionsAmount
              );
            });
          });

          describe('cancel adding permissions', () => {
            beforeEach(async function () {
              await PermissionSetForm.permissionsModal.cancelButton.click();
            });

            it('should be 0 permissions', () => {
              expect(PermissionSetForm.permissions().length).to.equal(0);
            });
          });

          describe('adding permissions', () => {
            beforeEach(async function () {
              await PermissionSetForm.permissionsModal.saveButton.click();
            });

            it('should be 0 permissions', () => {
              expect(PermissionSetForm.permissions().length).to.equal(assignedPermissionsAmount);
            });
          });
        });

        describe('assign all permissions', () => {
          beforeEach(async function () {
            await PermissionSetForm.permissionsModal.permissionsList.selectAllPermissions.click();
          });

          it('permissions list should be displayed', () => {
            expect(PermissionSetForm.permissionsModal.permissionsList.isPresent).to.be.true;
          });

          it('should be 0 unassigned permissions', () => {
            expect(PermissionSetForm.permissionsModal.permissionsList.permissions().length).to.equal(0);
          });
        });
      });
    });
  });
});
