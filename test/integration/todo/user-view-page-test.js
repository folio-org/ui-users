import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import InstanceViewPage from '../interactors/user-view-page';

describe('User view', () => {
  setupApplication();

  let user;

  describe('visit users-details', () => {
    beforeEach(async function () {
      user = this.server.create('user');
      this.server.create('requestPreference', {
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

    it('should display empty department name', () => {
      expect(InstanceViewPage.departmentName).to.equal('-');
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

    describe('when custom fields are in stock', () => {
      it('should display custom fields accordion', () => {
        expect(InstanceViewPage.customFieldsSection.isPresent).to.be.true;
      });

      it('should display correct accordion title', () => {
        expect(InstanceViewPage.customFieldsSection.label).to.equal('Custom Fields Test');
      });
    });
  });

  describe('when custom fields are not in stock', () => {
    beforeEach(async function () {
      user = this.server.create('user');
      this.server.get('/custom-fields', {
        customFields: [],
      });

      this.visit(`/users/view/${user.id}`);
      await InstanceViewPage.whenLoaded();
    });

    it('should not display custom fields accordion', () => {
      expect(InstanceViewPage.customFieldsSection.isPresent).to.be.false;
    });
  });

  describe('when user has departments', () => {
    beforeEach(async function () {
      const departments = this.server.createList('department', 2);

      this.server.get('/departments', { departments });
      user = this.server.create('user', {
        departments: departments.map(({ id }) => id),
      });

      this.visit(`/users/view/${user.id}`);
      await InstanceViewPage.whenLoaded();
    });

    it('should display department name value', () => {
      expect(InstanceViewPage.departmentName).to.equal('TestName0, TestName1');
    });
  });
});
