import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import UsersInteractor from '../interactors/users';

describe('User Create Page', () => {
  const users = new UsersInteractor();

  before(function () {
    setupApplication();
  });

  beforeEach(async function () {
    this.visit('/users');
    await users.clickCreateUserButton();
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
