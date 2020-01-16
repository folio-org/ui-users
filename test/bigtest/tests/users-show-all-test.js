import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UsersInteractor from '../interactors/users';
import InstanceViewPage from '../interactors/user-view-page';
import OpenLoansInteractor from '../interactors/open-loans';
import ClosedLoansInteractor from '../interactors/closed-loans';
import LoanActionsHistory from '../interactors/loan-actions-history';
import LoansListingPane from '../interactors/loans-listing-pane';

const usersAmount = 8;

describe('Users', () => {
  const usersInteractor = new UsersInteractor();

  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    }
  });

  let users;
  let searchQuery = '';

  describe('visit user search', () => {
    beforeEach(async function () {
      users = this.server.createList('user', usersAmount);
      this.visit('/users?sort=Name');

      await usersInteractor.activeUserCheckbox.clickActive();
      await usersInteractor.activeUserCheckbox.clickInactive();
      await usersInteractor.whenInstancesLoaded();

      searchQuery = this.location.search;
    });

    it('renders proper amount of users', () => {
      expect(usersInteractor.instances().length).to.be.equal(usersAmount);
    });

    describe('clicking on the first user item', function () {
      let openLoan;
      let closedLoan;

      beforeEach(async function () {
        openLoan = this.server.create('loan', {
          status: { name: 'Open' },
          userId: users[0].id,
          loanPolicyId: 'test'
        });

        closedLoan = this.server.create('loan', {
          status: { name: 'Closed' },
          userId: users[0].id,
          loanPolicyId: 'test'
        });

        await usersInteractor.instances(0).click();
        await InstanceViewPage.whenLoaded();
      });

      it('should load the user instance details', () => {
        expect(usersInteractor.instance.isVisible).to.be.true;
      });

      it('should display the loans section', () => {
        expect(InstanceViewPage.loansSection.isPresent).to.be.true;
      });

      describe('clicking on the accordion of the loans section', function () {
        beforeEach(async function () {
          await InstanceViewPage.whenLoaded();
          await InstanceViewPage.loansSection.accordionButton.click();
        });

        it('should display links to closed and open loans ', () => {
          expect(InstanceViewPage.loansSection.openLoans.isPresent).to.be.true;
          expect(InstanceViewPage.loansSection.closedLoans.isPresent).to.be.true;
        });

        describe('clicking on the open loans link', function () {
          beforeEach(async function () {
            await InstanceViewPage.loansSection.openLoans.click();
            await OpenLoansInteractor.whenLoaded();
          });

          it('should navigate to the list of open user loans ', function () {
            expect(this.location.pathname.endsWith(`/users/${users[0].id}/loans/open`)).to.be.true;
          });

          describe('clicking on the first row', function () {
            beforeEach(async function () {
              await OpenLoansInteractor.rowButtons(0).click();
              await LoanActionsHistory.whenLoaded();
            });

            it('should navigate to the loan actions history', function () {
              expect(this.location.pathname.endsWith(`/users/${users[0].id}/loans/view/${openLoan.id}`)).to.be.true;
            });

            describe('clicking on the close buttons on loan actions history and open loan panes', function () {
              beforeEach(async function () {
                await LoanActionsHistory.closeButton.click();
                await LoansListingPane.whenLoaded();
                await LoansListingPane.closeButton.click();
                await usersInteractor.whenInstanceLoaded();
              });

              it('should navigate to the user preview page', () => {
                expect(usersInteractor.instance.isVisible).to.be.true;
              });

              it('should have the correct url with query', function () {
                expect(this.location.pathname.endsWith(`users/preview/${users[0].id}`)).to.be.true;
                expect(this.location.search).to.equal(searchQuery);
              });
            });
          });
        });

        describe('clicking on the closed loans link', function () {
          beforeEach(async function () {
            await InstanceViewPage.loansSection.closedLoans.click();
            await ClosedLoansInteractor.whenLoaded();
          });

          it('should navigate to the list of closed user loans ', function () {
            expect(this.location.pathname.endsWith(`/users/${users[0].id}/loans/closed`)).to.be.true;
          });

          describe('clicking on the first row', function () {
            beforeEach(async function () {
              await ClosedLoansInteractor.rowButtons(0).click();
              await LoanActionsHistory.whenLoaded();
            });

            it('should navigate to the loan actions history', function () {
              expect(this.location.pathname.endsWith(`/users/${users[0].id}/loans/view/${closedLoan.id}`)).to.be.true;
            });

            describe('clicking on the close buttons on loan actions history and closed loan panes', function () {
              beforeEach(async function () {
                await LoanActionsHistory.closeButton.click();
                await LoansListingPane.whenLoaded();
                await LoansListingPane.closeButton.click();
                await usersInteractor.whenInstanceLoaded();
              });

              it('should navigate to the user preview page', () => {
                expect(usersInteractor.instance.isVisible).to.be.true;
              });

              it('should have the correct url with query', function () {
                expect(this.location.pathname.endsWith(`users/preview/${users[0].id}`)).to.be.true;
                expect(this.location.search).to.equal(searchQuery);
              });
            });
          });
        });
      });
    });
  });
});
