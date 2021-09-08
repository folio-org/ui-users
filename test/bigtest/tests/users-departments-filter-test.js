import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';

describe('Departments filter', () => {
  setupApplication();

  const users = new UsersInteractor();

  beforeEach(function () {
    this.server.createList('user', 10, { active: true });
    const userWithFirstDepartment = this.server.create('user', {
      name: 'TestDep1User',
      departments: ['test-1']
    });
    userWithFirstDepartment.save();
  });

  describe('when there are no Departments created in Settings', () => {
    beforeEach(async function () {
      this.server.get('/departments', { departments: [] });
      this.visit('/users?sort=Name');
      await users.whenLoaded();
    });

    it('should not display Departments filter', () => {
      expect(users.departmentsFilter.isAccordionPresent).to.be.false;
    });
  });

  describe('visit user search', () => {
    beforeEach(async function () {
      this.visit('/users?sort=Name');
      await users.whenLoaded();
      await users.departmentsFilter.whenLoaded();
    });

    it('should display Departments filter', () => {
      expect(users.departmentsFilter.isAccordionPresent).to.be.true;
    });

    describe('when choosing a department', () => {
      beforeEach(async () => {
        await users.departmentsFilter.multiSelect.clickControl();
        await users.departmentsFilter.multiSelect.options(0).clickOption();
      });

      it('should show a single user', () => {
        expect(users.instances().length).to.equal(1);
      });
    });
  });
});
