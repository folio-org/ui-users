import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import InstanceViewPage from '../interactors/user-view-page';
import UserFormPage from '../interactors/user-form-page';

describe('User view', () => {
  before(function () {
    setupApplication();
  });

  let user;

  beforeEach(async function () {
    user = this.server.create('user');
    this.server.create('requestPreferences', {
      userId: user.id,
      delivery: true,
      defaultServicePointId: 'servicepointId1',
      defaultDeliveryAddressTypeId: 'Type1',
      fulfillment: 'Delivery',
    });

    this.visit(`/users/view/${user.id}`);
    await InstanceViewPage.whenLoaded();
  });

  it('displays the instance title in the pane header', () => {
    expect(InstanceViewPage.title).to.equal(user.username);
  });

  describe('pane header dropdown menu', () => {
    beforeEach(async () => {
      await InstanceViewPage.headerDropdown.click();
    });

    describe('clicking on edit', () => {
      beforeEach(async () => {
        await InstanceViewPage.headerDropdownMenu.clickEdit();
      });

      it('should redirect to instance edit page', () => {
        expect(UserFormPage.$root).to.exist;
      });
    });
  });

  describe('request preferences section', () => {
    it('should display hold shelf value', () => {
      expect(InstanceViewPage.holdShelf).to.equal('Hold shelf - Yes');
    });
    it('should display whether delivery is checked', () => {
      expect(InstanceViewPage.delivery).to.equal('Delivery - Yes');
    });
    it('should display fulfillment preference', () => {
      expect(InstanceViewPage.fulfillmentPreference).to.equal('Delivery');
    });
    it('should display default delivery address', () => {
      expect(InstanceViewPage.defaultDeliveryAddress).to.equal('Claim');
    });
  });
});
