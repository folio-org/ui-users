import faker from 'faker';
import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import findUser from '@folio/plugin-find-user';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import UsersInteractor from '../interactors/users';
import FindUserInteractor from '../interactors/find-user';
import FindUserInstancesInteractor from '../interactors/FindUserInstances';
import translations from '../../../translations/ui-users/en';

describe('User Edit: Proxy/Sponsor', function () {
  setupApplication({
    scenarios: ['user-proxy-edit'],
    modules: [{
      type: 'plugin',
      name: '@folio/ui-plugin-find-user',
      pluginType: 'find-user',
      displayName: 'ui-plugin-find-user.meta.title',
      module: findUser,
    }],
    translations: {
      'ui-plugin-find-user': 'ui-plugin-find-user'
    },
  });

  const users = new UsersInteractor({ timeout: 5000 });
  const findUserPlugin = new FindUserInteractor({ timeout: 5000 });
  const findUserInstances = new FindUserInstancesInteractor({ timeout: 5000 });

  beforeEach(async function () {
    this.visit('/users/test-user-proxy-unique-id/edit');
    await UserFormPage.whenLoaded();
  });

  it('displays the title in the pane header', () => {
    expect(UserFormPage.title).to.not.equal('Edit User');
  });

  describe('Add sponsor', () => {
    beforeEach(async () => {
      await UserFormPage.when(() => UserFormPage.proxySection.isPresent);
      await findUserPlugin.when(() => findUserPlugin.button.isPresent);
      await findUserPlugin.button.click();
    });

    it('should display the sponsor modal', () => {
      expect(findUserPlugin.modal.isPresent).to.be.true;
    });

    describe('Find a valid sponsor', () => {
      beforeEach(async () => {
        await findUserPlugin.modal.searchField.fill('sponsor');
        await findUserPlugin.modal.searchButton.click();
        await findUserInstances.whenInstancesLoaded();
        await findUserPlugin.modal.instances(0).click();
      });

      it('form should list a selected sponsor', () => {
        expect(UserFormPage.proxySection.sponsorCount).to.equal(1);
      });

      it('sponsor status should have two options', () => {
        expect(UserFormPage.proxySection.statusCount).to.equal(2);
      });

      describe('Expire the relationship', () => {
        beforeEach(async () => {
          await UserFormPage.proxySection.expirationDate.fillAndBlur(faker.date.past(1).toJSON().substring(0, 10));
        });

        it('relationship statuses should be correct', () => {
          expect(UserFormPage.proxySection.statusCount).to.equal(1);
          expect(UserFormPage.proxySection.relationshipStatus.val).to.equal('inactive');
          expect(UserFormPage.proxySection.relationshipStatus.hasWarningStyle).to.be.true;
        });

        it('should be the correct warning', () => {
          expect(UserFormPage.proxySection.relationshipStatus.warningText).to.equal(translations['errors.proxyrelationship.expired']);
        });
      });

      describe('Expire the user', () => {
        beforeEach(async () => {
          await UserFormPage.expirationDate.fillAndBlur('2019-01-01');
        });

        it('relationship statuses should be correct', () => {
          expect(UserFormPage.proxySection.statusCount).to.equal(1);
          expect(UserFormPage.proxySection.relationshipStatus.val).to.equal('inactive');
          expect(UserFormPage.proxySection.relationshipStatus.hasWarningStyle).to.be.true;
        });

        it('should be the correct warning', () => {
          expect(UserFormPage.proxySection.relationshipStatus.warningText).to.equal(translations['errors.currentUser.expired']);
        });
      });
    });

    describe('Find an expired sponsor', () => {
      beforeEach(async () => {
        await findUserPlugin.modal.searchField.fill('expired');
        await findUserPlugin.modal.searchButton.click();
        await findUserInstances.whenInstancesLoaded();
        await findUserPlugin.modal.instances(0).click();
      });

      it('relationship statuses should be correct', () => {
        expect(UserFormPage.proxySection.sponsorCount).to.equal(1);
        expect(UserFormPage.proxySection.statusCount).to.equal(1);
        expect(UserFormPage.proxySection.relationshipStatus.val).to.equal('inactive');
        expect(UserFormPage.proxySection.relationshipStatus.hasWarningStyle).to.be.true;
      });

      it('should be the correct warning', () => {
        expect(UserFormPage.proxySection.relationshipStatus.warningText).to.equal(translations['errors.sponsors.expired']);
      });
    });

    describe('Adding user as own sponsor should fail', () => {
      beforeEach(async () => {
        await findUserPlugin.modal.searchField.fill('self');
        await findUserPlugin.modal.searchButton.click();
        await findUserInstances.whenInstancesLoaded();
        await findUserPlugin.modal.instances(0).click();
      });

      it('sponsor list should be empty', () => {
        expect(UserFormPage.proxySection.sponsorCount).to.equal(0);
      });

      it('error modal should be present', () => {
        expect(UserFormPage.errorModal.isPresent).to.be.true;
        expect(UserFormPage.errorModal.label).to.equal(translations['errors.sponsors.invalidUserLabel']);
        expect(UserFormPage.errorModal.text).to.include(translations['errors.sponsors.invalidUserMessage']);
      });
    });

    describe('Adding the same user as sponsor should fail', () => {
      beforeEach(async () => {
        await findUserPlugin.modal.searchField.fill('sponsor');
        await findUserPlugin.modal.searchButton.click();
        await findUserInstances.whenInstancesLoaded();
        await findUserPlugin.modal.instances(0).click();

        await findUserPlugin.modal.searchField.fill('sponsor');
        await findUserPlugin.modal.searchButton.click();
        await findUserInstances.whenInstancesLoaded();
        await findUserPlugin.modal.instances(0).click();
      });

      it('error modal should be present', () => {
        expect(UserFormPage.errorModal.isPresent).to.be.true;
        expect(UserFormPage.errorModal.label).to.equal(translations['errors.sponsors.invalidUserLabel']);
        expect(UserFormPage.errorModal.text).to.include(translations['errors.sponsors.duplicateUserMessage']);
      });
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
});
