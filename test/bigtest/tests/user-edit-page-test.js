import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import translations from '../../../translations/ui-users/en';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import InstanceViewPage from '../interactors/user-view-page';
import UsersInteractor from '../interactors/users';

describe('User Edit Page', () => {
  const users = new UsersInteractor();
  let user1;
  let user2;

  setupApplication();

  beforeEach(async function () {
    user1 = this.server.create('user');
    user2 = this.server.create('user');
    this.server.create('requestPreference', {
      userId: user1.id,
      delivery: true,
      defaultServicePointId: 'servicepointId1',
      defaultDeliveryAddressTypeId: 'Type1',
      fulfillment: 'Delivery',
    });

    this.visit(`/users/${user1.id}/edit`);
    await UserFormPage.whenLoaded();
  });

  it('displays the title in the pane header', () => {
    expect(UserFormPage.title).to.equal(user1.username);
  });

  it('should display create password link', () => {
    expect(UserFormPage.resetPasswordLink.isPresent).to.be.true;
    expect(UserFormPage.resetPasswordLink.text).to.equal(translations['extended.sendCreatePassword']);
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

  describe('when custom fields are in stock', () => {
    it('should show custom fields accordion', () => {
      expect(UserFormPage.customFieldsSection.isPresent).to.be.true;
    });

    it('should display correct accordion label', () => {
      expect(UserFormPage.customFieldsSection.label).to.equal('Custom Fields Test');
    });

    it('should display all visible custom fields', () => {
      expect(UserFormPage.customFieldsSection.fields().length).to.equal(3);
    });

    it('should display popover for the first field', () => {
      expect(UserFormPage.customFieldsSection.fields(0).popoverIsPresent).to.be.true;
    });

    describe('when set empty falue to required field', () => {
      beforeEach(async () => {
        await UserFormPage.customFieldsSection.fields(0).input.fillAndBlur('');
      });

      it('should show validation message', () => {
        expect(UserFormPage.customFieldsSection.fields(0).validationMessage).to.equal('Textbox 1 is required');
      });
    });

    describe('when set value to textbox out of length limit', () => {
      beforeEach(async () => {
        await UserFormPage.customFieldsSection.fields(0).input.fillAndBlur((new Array(151)).fill('a').join(''));
      });

      it('should show validation message', () => {
        expect(UserFormPage.customFieldsSection.fields(0).validationMessage)
          .to.equal('Textbox 1 character limit has been exceeded. Please revise.');
      });
    });

    describe('when set to textarea value out of length limit', () => {
      beforeEach(async () => {
        await UserFormPage.customFieldsSection.fields(2).input.fillAndBlur((new Array(1501)).fill('a').join(''));
      });

      it('should show validation message', () => {
        expect(UserFormPage.customFieldsSection.fields(2).validationMessage)
          .to.equal('Textarea 4 character limit has been exceeded. Please revise.');
      });
    });
  });

  describe('changing status field', () => {
    describe('changing status to inactive', () => {
      beforeEach(async function () {
        await UserFormPage.statusField.selectAndBlur('Inactive');
        await UserFormPage.submitButton.click();
        await InstanceViewPage.whenLoaded();
      });

      it('should display inactive status', () => {
        expect(InstanceViewPage.userInfo.keyValues(5).text).to.equal('Inactive');
      }).timeout(6000);
    });

    describe('clearing expirationDate field', () => {
      beforeEach(async function () {
        await UserFormPage.statusField.selectAndBlur('Active');
        await UserFormPage.clearExpirationDate();
        await UserFormPage.submitButton.click();
        await InstanceViewPage.whenLoaded();
      });

      it('should display active status', () => {
        expect(InstanceViewPage.userInfo.keyValues(5).text).to.equal('Active');
      }).timeout(6000);
    });
  });
});

describe('when custom fields are not in stock', () => {
  setupApplication();

  beforeEach(async function () {
    const user = this.server.create('user');

    this.server.get('/custom-fields', {
      customFields: [],
    });

    this.visit(`/users/${user.id}/edit`);
    await UserFormPage.whenLoaded();
  });

  it('should custom fields accordion does not present', () => {
    expect(UserFormPage.customFieldsSection.isPresent).to.be.false;
  });
});
