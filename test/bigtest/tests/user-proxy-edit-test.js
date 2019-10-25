import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import {
  Interactor
} from '@bigtest/interactor';
import { expect } from 'chai';

import findUser from '@folio/plugin-find-user';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';
import InstanceViewPage from '../interactors/user-view-page';
import UsersInteractor from '../interactors/users';
import FindUserInteractor from '@folio/plugin-find-user/test/bigtest/interactors/findUser';

describe.only('User Edit: Proxy/Sponsor', () => {
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

  const users = new UsersInteractor();
  const findUserPlugin = new FindUserInteractor();

  beforeEach(async function () {
    this.visit('/users/preview/test-user-proxy-unique-id');
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
      expect(UserFormPage.title).to.not.equal('loading');
    });

    describe('Edit sponsor', () => {
      beforeEach(async () => {
        await findUserPlugin.button.click();
      });

      it('should display the sponsor modal', () => {
        expect(findUserPlugin.modal.isPresent).to.be.true;
      });

      describe('Edit sponsor', () => {
        beforeEach(async () => {
          await findUserPlugin.modal.searchField.fill('sponsor');
          await findUserPlugin.modal.searchButton.click();
          await findUserPlugin.modal.instances(1).click();
        });

        it('form should list a selected sponsor', () => {
          expect(UserFormPage.proxySection.sponsorCount).to.equal(1);
        });

        describe('Saving a sponsor', () => {
          beforeEach(async () => {
            await UserFormPage.submitButton.click();
            await InstanceViewPage.whenLoaded();
          });

          it('should navigate to the detail view', () => {
            expect(users.$root).to.exist;
          });

          it.only('should display proxies in detail view', () => {
            expect(InstanceViewPage.proxySection.sponsorCount).to.equal(1);
          });
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
});
