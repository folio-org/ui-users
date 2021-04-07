import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserNotFoundPage from '../interactors/user-not-found-page';

describe('User not found', () => {
  setupApplication();

  describe('visit users details for not existing user', () => {
    beforeEach(async function () {
      this.server.get('/users/not-found', () => {
        return new Response(404, {});
      }, 404);

      this.visit('/users/view/not-found');

      await UserNotFoundPage.whenLoaded();
    });

    it('shows user not found pane', () => {
      expect(UserNotFoundPage.userNotFoundPanePresent).to.equal(true);
    });
  });
});
