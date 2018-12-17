import { beforeEach, describe, it } from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('Users', () => {
  setupApplication();

  const users = new UsersInteractor();

  beforeEach(async function () {
    this.server.createList('user', 3);
    this.visit('/users?filters=active.Include%20inactive%20users&sort=Name');
  });

  it('shows the list of user items', () => {
    expect(users.isVisible).to.equal(true);
  });

  it('renders each user instance', () => {
    expect(users.instances().length).to.be.equal(3);
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
