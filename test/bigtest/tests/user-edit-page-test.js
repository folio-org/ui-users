import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import InstanceViewPage from '../interactors/user-view-page';
import UsersInteractor from '../interactors/users';

describe('User Edit Page', () => {
  const users = new UsersInteractor();
  let user1;
  let user2;

  before(function () {
    setupApplication();
  });

  beforeEach(async function () {
    user1 = this.server.create('user');
    user2 = this.server.create('user');
    this.server.create('requestPreferences', {
      userId: user1.id,
      delivery: true,
      defaultServicePointId: 'servicepointId1',
      defaultDeliveryAddressTypeId: 'Type1',
      fulfillment: 'Delivery',
    });

    this.visit(`/users/preview/${user1.id}`);
    await InstanceViewPage.whenLoaded();
  });

  it('edit button is present', () => {
    expect(InstanceViewPage.editButtonPresent).to.be.true;
  });

  describe('visiting the edit user page', () => {
    beforeEach(async function () {
      await InstanceViewPage.clickEditButton();
      await UserFormPage.whenLoaded();
    });

    it('displays the title in the pane header', () => {
      expect(UserFormPage.title).to.equal(user1.username);
    });

    describe('validating user barcode', () => {
      beforeEach(async function () {
        await UserFormPage.barcodeField.fillAndBlur(user2.barcode);
        await UserFormPage.submitButton.click();
      });

      it('should display validation error', () => {
        expect(UserFormPage.feedbackError).to.equal('This barcode has already been taken');
      });
    });

    describe('validating empty user barcode', () => {
      beforeEach(async function () {
        await UserFormPage.barcodeField.fillAndBlur('');
        await UserFormPage.submitButton.click();
      });

      it('should show user detail view', () => {
        expect(InstanceViewPage.isVisible).to.equal(true);
      });
    });

    describe('validating username', () => {
      beforeEach(async function () {
        await UserFormPage.usernameField.fillAndBlur(user2.username);
        await UserFormPage.submitButton.click();
      });

      it('should display validation error', () => {
        expect(UserFormPage.feedbackError).to.equal('This username already exists');
      });
    });

    describe('pane header menu', () => {
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

      describe('when delivery is activated', () => {
        it('should display "delivery" checkbox as checked', () => {
          expect(UserFormPage.deliveryCheckboxIsChecked).to.be.true;
        });

        it('should display selected "Fulfillment preference"', () => {
          expect(UserFormPage.fulfillmentPreference.value).to.equal('Delivery');
        });

        it('should display selected default address type', () => {
          const CLAIM_ADDRESS_TYPE_VALUE = 'Type1';
          expect(UserFormPage.defaultAddressTypeField.value).to.equal(CLAIM_ADDRESS_TYPE_VALUE);
        });

        describe('and selected default address type was changed', () => {
          beforeEach(async () => {
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
            await UserFormPage.firstAddressTypeField.selectAndBlur('Home');
            await UserFormPage.defaultAddressTypeField.selectAndBlur('Home');
            await UserFormPage.deleteAddressType();
          });

          it('should reset default address type to empty value', () => {
            expect(UserFormPage.defaultAddressTypeField.value).to.equal('');
          });

          it('should display validation message of "Default delivery address field"', () => {
            expect(UserFormPage.defaultAddressTypeValidationMessage)
              .to.equal('Please, add at least one address inside "Addresses" section');
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

          it('should display validation message of "Default delivery address field"', () => {
            expect(UserFormPage.defaultAddressTypeValidationMessage)
              .to.equal('Please, add at least one address inside "Addresses" section');
          });
        });
      });
    });
  });
});
