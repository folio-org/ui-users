import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('Status filter', () => {
  setupApplication();
  const activeUsersAmount = 4;
  const inactiveUsersAmount = 8;
  const allUsers = activeUsersAmount + inactiveUsersAmount;

  const users = new UsersInteractor({
    timeout: 10000,
  });

  beforeEach(async function () {
    await this.server.createList('user', activeUsersAmount, { active: true });
    this.server.createList('user', inactiveUsersAmount, { active: false });
    this.visit('/users?sort=Name');
    users.whenLoaded();
  });

  describe('show inactive users', () => {
    beforeEach(async function () {
      await users.activeUserCheckbox.clickInactive();
    });

    it('should show the list of users', () => {
      expect(users.isVisible).to.equal(true);
    });

    it('should be proper amount of users', () => {
      expect(users.instances().length).to.equal(inactiveUsersAmount);
    });
  });

  describe('show active users', () => {
    beforeEach(async function () {
      await users.activeUserCheckbox.clickActive();
    });

    it('should show the list of users', () => {
      expect(users.isVisible).to.equal(true);
    });

    it('should be proper amount of users', () => {
      expect(users.instances().length).to.equal(activeUsersAmount);
    });
  });

  describe('show all users', () => {
    beforeEach(async function () {
      await users.activeUserCheckbox.clickActive();
      await users.activeUserCheckbox.clickInactive();
    });

    it('should show the list of users', () => {
      expect(users.isVisible).to.equal(true);
    });

    it('should be proper amount of users', () => {
      expect(users.instances().length).to.equal(allUsers);
    });
  });
});
