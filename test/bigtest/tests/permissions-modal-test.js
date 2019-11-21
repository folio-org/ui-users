import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import PermissionSetForm from '../interactors/permission-set-form';
import UserFormPage from '../interactors/user-form-page';
import translation from '../../../translations/ui-users/en';

describe('Permissions modal', () => {
  const permissionsAmount = 10;
  const permissionSetsAmount = 1;
  let permissionSets;
  let user;

  before(function () {
    setupApplication({ scenarios: ['comments'] });
  });

  beforeEach(async function () {
    this.server.createList('permissions', permissionsAmount);
    permissionSets = this.server.createList('permissions', permissionSetsAmount, { mutable: true });
    user = this.server.create('user');

    this.visit(`/users/${user.id}/edit`);
    await UserFormPage.whenLoaded();
    await UserFormPage.togglePermissionAccordionButton.click();
  });

  describe('add permission button', () => {
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

        it('should have proper label', () => {
          expect(UserFormPage.permissionsModal.modalHeader.text).to.equal(translation['permissions.modal.header']);
        });

        describe('sort permissions by type', () => {
          beforeEach(async function () {
            await UserFormPage.permissionsModal.permissionsList.sortByTypeButton.click();
            await UserFormPage.permissionsModal.permissionsList.sortByTypeButton.click();
          });

          it('permission set should be first', () => {
            expect(UserFormPage.permissionsModal.permissionsList.permissions(0).name.text).to.equal(
              permissionSets[0].displayName
            );
          });
        });

        describe('type filter', () => {
          describe('permission sets checkbox', () => {
            it('should be presented', () => {
              expect(UserFormPage.permissionsModal.searchForm.permissionSetsCheckbox.isPresent).to.be.true;
            });

            it('should not be checked', () => {
              expect(UserFormPage.permissionsModal.searchForm.permissionSetsCheckboxChecked).to.be.false;
            });

            describe('permission sets checkbox click', () => {
              beforeEach(async function () {
                await UserFormPage.permissionsModal.searchForm.permissionSetsCheckbox.click();
              });

              it('should be 0 permissions', () => {
                expect(UserFormPage.permissionsModal.permissionsList.permissions().length).to.equal(permissionSetsAmount);
              });
            });
          });

          describe('permissions checkbox', () => {
            it('should be presented', () => {
              expect(UserFormPage.permissionsModal.searchForm.permissionsCheckbox.isPresent).to.be.true;
            });

            it('should not be checked', () => {
              expect(UserFormPage.permissionsModal.searchForm.permissionsCheckboxChecked).to.be.false;
            });

            describe('permission checkbox click', () => {
              beforeEach(async function () {
                await UserFormPage.permissionsModal.searchForm.permissionsCheckbox.click();
              });

              it(`should be ${permissionsAmount + permissionSetsAmount} permissions`, () => {
                expect(UserFormPage.permissionsModal.permissionsList.permissions().length).to.equal(permissionsAmount);
              });
            });
          });
        });
      });
    });
  });
});

describe('Permission set form', () => {
  const permissionsAmount = 10;
  let permissions;

  before(async function () {
    setupApplication({ scenarios: ['comments'] });
  });

  beforeEach(async function () {
    permissions = this.server.createList('permissions', permissionsAmount);
    this.visit('/settings/users/perms?layer=add');
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

                it('should not be checked', () => {
                  expect(PermissionSetForm.permissionsModal.searchForm.unassignedCheckboxChecked).to.be.false;
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
            await PermissionSetForm.permissionsModal.searchForm.unassignedCheckbox.click();
            await PermissionSetForm.permissionsModal.permissionsList.permissions(1).checkBox.click();
            await PermissionSetForm.permissionsModal.permissionsList.permissions(2).click();
          });

          it('permissions list should be displayed', () => {
            expect(PermissionSetForm.permissionsModal.permissionsList.isPresent).to.be.true;
          });

          it('unassigned permissions should be displayed', () => {
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
              expect(PermissionSetForm.permissionsModal.permissionsList.permissions().length).to.equal(permissionsAmount);
            });

            describe('sort permissions by status', () => {
              beforeEach(async function () {
                await PermissionSetForm.permissionsModal.permissionsList.sortByStatusButton.click();
              });

              it('assigned permission should be first', () => {
                expect(PermissionSetForm.permissionsModal.permissionsList.permissions(0).assigned).to.be.true;
              });
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

            it(`should be ${assignedPermissionsAmount} permissions`, () => {
              expect(PermissionSetForm.permissions().length).to.equal(assignedPermissionsAmount);
            });
          });
        });

        describe('assign all permissions', () => {
          beforeEach(async function () {
            await PermissionSetForm.permissionsModal.searchForm.unassignedCheckbox.click();
            await PermissionSetForm.permissionsModal.permissionsList.selectAllPermissions.click();
          });

          it('permissions list should be displayed', () => {
            expect(PermissionSetForm.permissionsModal.permissionsList.isPresent).to.be.true;
          });

          it('should be 0 unassigned permissions', () => {
            expect(PermissionSetForm.permissionsModal.permissionsList.permissions().length).to.equal(0);
          });

          describe('unassign all permissions', () => {
            beforeEach(async function () {
              await PermissionSetForm.permissionsModal.searchForm.assignedCheckbox.click();
              await PermissionSetForm.permissionsModal.searchForm.unassignedCheckbox.click();
              await PermissionSetForm.permissionsModal.permissionsList.selectAllPermissions.click();
            });

            it('should be 0 assigned permissions', () => {
              expect(PermissionSetForm.permissionsModal.permissionsList.permissions().length).to.equal(0);
            });
          });
        });
      });
    });
  });
});
