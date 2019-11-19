import { beforeEach, describe, it } from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

const usersAmount = 8;

describe('Users', () => {
  setupApplication();

  const users = new UsersInteractor({ timeout: 5000 });

  beforeEach(async function () {
    this.server.createList('user', usersAmount);
    this.visit('/users?sort=Name');

    await users.activeUserCheckbox.clickActive();
    await users.activeUserCheckbox.clickInactive();
  });

  it('shows the list of user items', () => {
    expect(users.isVisible).to.equal(true);
  });

  it('renders each user instance', () => {
    expect(users.instances().length).to.be.equal(usersAmount);
  });

  describe('clicking on the first user item', function () {
    beforeEach(async function () {
      await users.instances(0).click();
    });

    it('loads the user instance details', function () {
      expect(users.instance.isVisible).to.equal(true);
    });
  });
});
