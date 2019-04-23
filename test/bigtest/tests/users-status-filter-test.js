import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

setupApplication();
const activeUsersAmount = 4;
const inactiveUsersAmount = 8;
const allUsers = activeUsersAmount + inactiveUsersAmount;

beforeEach(async function () {
  this.server.createList('user', activeUsersAmount, { active: true });
  this.server.createList('user', inactiveUsersAmount, { active: false });
  this.visit('/users?sort=Name');
});

describe('Status filter', () => {
  const users = new UsersInteractor();

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
