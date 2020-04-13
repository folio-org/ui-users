import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import UsersInteractor from '../interactors/users';

describe('User Create Page', () => {
  const users = new UsersInteractor({ timeout: 5000 });
  setupApplication();

  describe('visit users', () => {
    beforeEach(async function () {
      this.visit('/users');
      await users.clickCreateUserButton();
      await UserFormPage.whenLoaded();
    });

    describe('visiting the create user page', () => {
      it('should display the title in the pane header', () => {
        expect(UserFormPage.title).to.equal('Create User');
      });

      it('should render a primary button', () => {
        expect(UserFormPage.submitButton.rendersPrimary).to.be.true;
      });

      it('should render a default button', () => {
        expect(UserFormPage.cancelButton.rendersDefault).to.be.true;
      });

      describe('clicking on cancel button', () => {
        beforeEach(async () => {
          await UserFormPage.cancelButton.click();
        });

        it('should redirect to view users page after click', () => {
          expect(users.$root).to.exist;
        });
      });

      describe('Extended information', () => {
        it('should not display "username" field as required', () => {
          expect(UserFormPage.isUsernameFieldRequired).to.be.false;
        });

        it('should not display "password" field as required', () => {
          expect(UserFormPage.isPasswordFieldRequired).to.be.false;
        });

        describe('filling "username" field', () => {
          beforeEach(async function () {
            await UserFormPage.usernameField.fillAndBlur('test');
          });

          it('should mark "username" and "password" fields as required', () => {
            expect(UserFormPage.isUsernameFieldRequired).to.be.true;
            expect(UserFormPage.isPasswordFieldRequired).to.be.true;
          });

          describe('clearing "username" field', () => {
            beforeEach(async function () {
              await UserFormPage.usernameField.fillAndBlur('');
            });

            it('should unmark "username" and "password" fields as required', () => {
              expect(UserFormPage.isUsernameFieldRequired).to.be.false;
              expect(UserFormPage.isPasswordFieldRequired).to.be.false;
            });
          });
        });

        describe('filling "password" field', () => {
          beforeEach(async function () {
            await UserFormPage.passwordField.fillAndBlur('test');
          });

          it('should mark "username" and "password" fields as required', () => {
            expect(UserFormPage.isUsernameFieldRequired).to.be.true;
            expect(UserFormPage.isPasswordFieldRequired).to.be.true;
          });

          describe('clearing "username" field', () => {
            beforeEach(async function () {
              await UserFormPage.passwordField.fillAndBlur('');
            });

            it('should unmark "username" and "password" fields as required', () => {
              expect(UserFormPage.isUsernameFieldRequired).to.be.false;
              expect(UserFormPage.isPasswordFieldRequired).to.be.false;
            });
          });
        });
      });

      describe('request preferences', () => {
        it('should display "hold shelf" checkbox as checked', () => {
          expect(UserFormPage.holdShelfCheckboxIsChecked).to.be.true;
        });

        it('should display "hold shelf" checkbox as disabled', () => {
          expect(UserFormPage.holdShelfCheckboxIsDisabled).to.be.true;
        });

        it('should display "delivery" checkbox as unchecked by default', () => {
          expect(UserFormPage.deliveryCheckboxIsChecked).to.be.false;
        });

        describe('when "delivery" is checked', () => {
          beforeEach(async () => {
            await UserFormPage.clickDeliveryCheckbox();
          });

          it('should display "Fulfillment preference" with selected "Hold shelf" option', () => {
            expect(UserFormPage.fulfillmentPreference.value).to.equal('Hold Shelf');
          });

          describe('and address type "Home" is selected and default address type is selected', () => {
            beforeEach(async () => {
              await UserFormPage.clickAddAddressButton();
              await UserFormPage.firstAddressTypeField.selectAndBlur('Home');
              await UserFormPage.defaultAddressTypeField.selectAndBlur('Home');
            });

            it('should display selected default address type as "Home"', () => {
              const HOME_ADDRESS_TYPE_VALUE = 'Type2';
              expect(UserFormPage.defaultAddressTypeField.value).to.equal(HOME_ADDRESS_TYPE_VALUE);
            });
          });

          describe('and selected default address type was changed', () => {
            beforeEach(async () => {
              await UserFormPage.clickAddAddressButton();
              await UserFormPage.firstAddressTypeField.selectAndBlur('Home');
              await UserFormPage.defaultAddressTypeField.selectAndBlur('Home');
              await UserFormPage.firstAddressTypeField.selectAndBlur('Order');
            });

            it('should reset default address type to empty value', () => {
              expect(UserFormPage.defaultAddressTypeField.value).to.equal('');
            });

            it('should display validation message of "Default delivery address field"', () => {
              expect(UserFormPage.defaultAddressTypeValidationMessage).to.equal('Please fill this in to continue');
            });
          });

          describe('and selected default address type was deleted', () => {
            beforeEach(async () => {
              await UserFormPage.clickAddAddressButton();
              await UserFormPage.clickAddAddressButton();
              await UserFormPage.firstAddressTypeField.selectAndBlur('Home');
              await UserFormPage.secondAddressTypeField.selectAndBlur('Order');
              await UserFormPage.defaultAddressTypeField.selectAndBlur('Home');
              await UserFormPage.deleteAddressType();
            });

            it('should reset default address type to empty value', () => {
              expect(UserFormPage.defaultAddressTypeField.value).to.equal('');
            });

            it('should display validation message of "Default delivery address field"', () => {
              expect(UserFormPage.defaultAddressTypeValidationMessage).to.equal('Please fill this in to continue');
            });
          });

          describe('and all address types were deleted', () => {
            beforeEach(async () => {
              await UserFormPage.clickAddAddressButton();
              await UserFormPage.clickAddAddressButton();
              await UserFormPage.firstAddressTypeField.selectAndBlur('Home');
              await UserFormPage.secondAddressTypeField.selectAndBlur('Order');
              await UserFormPage.defaultAddressTypeField.selectAndBlur('Order');
              await UserFormPage.deleteAddressType();
              await UserFormPage.deleteAddressType();
            });

            it('should reset default address type to empty value', () => {
              expect(UserFormPage.defaultAddressTypeField.value).to.equal('');
            });

            it('should display error message under "Default address type" field', () => {
              expect(UserFormPage.defaultAddressTypeValidationMessage).to.equal('Please, add at least one address inside "Addresses" section');
            });
          });
        });
      });
    });
  });
});
