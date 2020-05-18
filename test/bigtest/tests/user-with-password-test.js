import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import translations from '../../../translations/ui-users/en';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';

describe.skip('Edit Page, user with password', () => {
  setupApplication({ scenarios: ['user-with-password'] });

  beforeEach(async function () {
    this.visit('/users/userId/edit');
    await UserFormPage.whenLoaded();
  });

  it('should display reset password link', () => {
    expect(UserFormPage.resetPasswordLink.isPresent).to.be.true;
    expect(UserFormPage.resetPasswordLink.text).to.equal(translations['extended.sendResetPassword']);
  });
});
