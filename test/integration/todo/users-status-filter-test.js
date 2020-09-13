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

  const users = new UsersInteractor();

  describe('visit user search', () => {
    beforeEach(async function () {
      this.server.createList('user', activeUsersAmount, { active: true });
      this.server.createList('user', inactiveUsersAmount, { active: false });
      this.visit('/users?sort=Name');
      await users.whenLoaded();
    });

    describe('show inactive users', () => {
      beforeEach(async function () {
        await users.activeUserCheckbox.clickInactive();
        await users.whenInstancesLoaded();
      });

      it('should show the list of users', () => {
        expect(users.isVisible).to.be.true;
      });

      it('should be proper amount of users', () => {
        expect(users.instances().length).to.equal(inactiveUsersAmount);
      });
    });

    describe('show active users', () => {
      beforeEach(async function () {
        await users.activeUserCheckbox.clickActive();
        await users.whenInstancesLoaded();
      });

      it('should show the list of users', () => {
        expect(users.isVisible).to.be.true;
      });

      it('should be proper amount of users', () => {
        expect(users.instances().length).to.equal(activeUsersAmount);
      });
    });

    describe('show all users', () => {
      beforeEach(async function () {
        await users.activeUserCheckbox.clickActive();
        await users.activeUserCheckbox.clickInactive();
        await users.whenInstancesLoaded();
      });

      it('should show the list of users', () => {
        expect(users.isVisible).to.be.true;
      });

      it('should be proper amount of users', () => {
        expect(users.instances().length).to.equal(allUsers);
      });
    });

    describe('search for users', () => {
      beforeEach(async function () {
        await users.searchField.fill('a');
        await users.searchButton.click();
        await users.whenLoaded();
      });

      it('entering a search query', () => {
        expect(users.searchField.value).to.equal('a');
      });

      it('should have search results', () => {
        expect(users.instances().length).to.be.above(0);
      });
    });
  });
});
