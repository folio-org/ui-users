import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import ApplicationInteractor from '../interactors/application';

describe('Application', function () {
  this.timeout(4000);

  const app = new ApplicationInteractor();

  setupApplication();

  describe('home', () => {
    beforeEach(function () {
      this.visit('/');
    });

    it('renders', () => {
      expect(app.isPresent).to.be.true;
    });
  });

  describe('redirect: loan detail', () => {
    let user;
    let loan;
    beforeEach(function () {
      user = this.server.create('user');
      loan = this.server.create('loan');
      this.visit(`/users/view/${user.id}?layer=loan&loan=${loan.id}`);
    });

    it('renders', () => {
      expect(app.isPresent).to.be.true;
    });

    it('redirects to loan detail view', function () {
      expect(this.location.pathname).to.equal(`/users/${user.id}/loans/view/${loan.id}`);
    });
  });

  describe('redirect: fee fine detail', () => {
    let user;
    let account;
    beforeEach(function () {
      user = this.server.create('user');
      account = this.server.create('account');
      this.visit(`/users/view/${user.id}?layer=account&account=${account.id}`);
    });

    it('renders', () => {
      expect(app.isPresent).to.be.true;
    });

    it('redirects to loan detail view', function () {
      expect(this.location.pathname).to.equal(`/users/${user.id}/accounts/view/${account.id}`);
    });
  });

  describe('redirect: charge fee fine', () => {
    let user;
    beforeEach(function () {
      user = this.server.create('user');
      this.visit(`/users/view/${user.id}?layer=charge`);
    });

    it('renders', () => {
      expect(app.isPresent).to.be.true;
    });

    it('redirects to loan detail view', function () {
      expect(this.location.pathname).to.equal(`/users/${user.id}/charge`);
    });
  });

  describe('redirect: charge fee fine with loan', () => {
    let user;
    let loan;
    beforeEach(function () {
      user = this.server.create('user');
      loan = this.server.create('loan');
      this.visit(`/users/view/${user.id}?layer=charge&loan=${loan.id}`);
    });

    it('renders', () => {
      expect(app.isPresent).to.be.true;
    });

    it('redirects to loan detail view', function () {
      expect(this.location.pathname).to.equal(`/users/${user.id}/charge/${loan.id}`);
    });
  });
});
