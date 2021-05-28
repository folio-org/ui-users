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

  describe('visit users-app', () => {
    beforeEach(function () {
      this.visit('/users?sort=Name');
    });

    it('renders context button', () => {
      expect(app.appContextButton.isPresent).to.be.true;
    });
    it('renders keyboard shortcuts item', () => {
      expect(app.appContextMenu.keyboardShortcutsItem.isPresent).to.be.true;
    });

    describe('click keyboard shortcuts item', () => {
      beforeEach(async () => {
        await app.appContextMenu.clickKeyboardShortcutsItem.click();
      });
      it('renders keyboard shortcuts modal', () => {
        expect(app.keyboardShortcutsModal.isPresent).to.be.true;
      });
      it('renders users icon in modal', () => {
        expect(app.keyboardShortcutsModal.modalIcon.isPresent).to.be.true;
      });
      it('renders all elements in modal', () => {
        expect(app.keyboardShortcutsModal.modalLabel.isPresent).to.be.true;
        expect(app.keyboardShortcutsModal.columnheaderAction.isPresent).to.be.true;
        expect(app.keyboardShortcutsModal.columnheaderShortcut.isPresent).to.be.true;
        expect(app.keyboardShortcutsModal.clickShortcutsModalCloseButton.isPresent).to.be.true;
      });
      describe('click close button', () => {
        beforeEach(async () => {
          await app.keyboardShortcutsModal.clickShortcutsModalCloseButton.click();
        });
        it('keyboard shortcuts modal should be closed', () => {
          expect(app.keyboardShortcutsModal.isPresent).to.be.false;
        });
      });
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
