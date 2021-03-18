import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import DummyComponent from '../helpers/DummyComponent';
import OpenLoansInteractor from '../interactors/open-loans';
import UsersInteractor from '../interactors/users';
import LoansListingPane from '../interactors/loans-listing-pane';

describe('Open Loans', () => {
  const requestsPath = '/requests';
  const requestsAmount = 2;

  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    },
    modules: [{
      type: 'app',
      name: '@folio/ui-requests',
      displayName: 'requests',
      route: requestsPath,
      module: DummyComponent,
    }],
    translations: {
      'requests': 'requests'
    },
  });

  let userId = '';

  describe('visit open loans', () => {
    let loan;
    beforeEach(async function () {
      loan = this.server.create('loan', {
        status: { name: 'Open' },
        item: {
          callNumberComponents: {
            prefix: 'prefix',
            callNumber: 'callNumber',
            suffix: 'suffix',
          },
          enumeration: 'enumeration',
          chronology: 'chronology',
          volume: 'volume',
        },
      });
      userId = loan.userId;
      this.server.createList('request', requestsAmount, { itemId: loan.itemId });
      this.visit(`/users/${userId}/loans/open?query=%20&sort=requests`);
    });

    it('should be presented', () => {
      expect(OpenLoansInteractor.isPresent).to.be.true;
    }).timeout(4000);

    it('should display the close button', () => {
      expect(LoansListingPane.closeButton.isPresent).to.be.true;
    });

    describe('loan list', () => {
      it('should be presented', () => {
        expect(OpenLoansInteractor.list.isPresent).to.be.true;
      });

      describe('loan item', () => {
        describe('requests', () => {
          it('loan should have requests', () => {
            expect(OpenLoansInteractor.requests(0).text).to.equal(requestsAmount.toString());
          });
        });

        describe('Call number', () => {
          it('loan should have effective call number', () => {
            const callNumber = 'prefix callNumber suffix volume enumeration chronology';
            expect(OpenLoansInteractor.callNumbers(0).text).to.equal(callNumber);
          });
        });
      });

      describe('single loan renew', () => {
        describe('action dropdown', () => {
          it('icon button should be presented', () => {
            expect(OpenLoansInteractor.actionDropdowns(0).isPresent).to.be.true;
          });

          describe('action dropdown click', () => {
            beforeEach(async () => {
              await OpenLoansInteractor.actionDropdowns(0).click('button');
            });

            it('override button should be presented', () => {
              expect(OpenLoansInteractor.actionDropdownRenewButton.isPresent).to.be.true;
            });

            describe('click override button', () => {
              beforeEach(async () => {
                await OpenLoansInteractor.actionDropdownRenewButton.click();
              });

              it('success callout should be presented', () => {
                expect(OpenLoansInteractor.callout.successCalloutIsPresent).to.be.true;
              });
            });
          });
        });
      });

      describe('action dropdown', () => {
        it('icon button should be presented', () => {
          expect(OpenLoansInteractor.actionDropdowns(0).isPresent).to.be.true;
        });

        describe('click', () => {
          beforeEach(async () => {
            await OpenLoansInteractor.actionDropdowns(0).click('button');
          });

          it('icon button should be presented', () => {
            expect(OpenLoansInteractor.actionDropdownRequestQueue.isPresent).to.be.true;
          });

          describe('clicking on request queue dropdown item', () => {
            beforeEach(async () => {
              await OpenLoansInteractor.actionDropdownRequestQueue.click();
            });

            it('should redirect to "requests"', function () {
              expect(this.location.pathname).to.to.equal(requestsPath);
            });
          });
        });
      });

      describe('clicking the close button', () => {
        const users = new UsersInteractor();

        beforeEach(async () => {
          await LoansListingPane.closeButton.click();
        });

        it('should navigate to the user preview form', function () {
          expect(users.isPresent).to.be.true;
          expect(users.instance.isPresent).to.be.true;
          expect(this.location.pathname.endsWith(`users/preview/${userId}`)).to.be.true;
        });
      });
    });
  });
  describe('visit open loans with Suspended Payment Status in Fee Fine Incurred', () => {
    let loan;
    beforeEach(async function () {
      loan = this.server.create('loan', {
        status: { name: 'Open' },
        item: {
          callNumberComponents: {
            prefix: 'prefix',
            callNumber: 'callNumber',
            suffix: 'suffix',
          },
        },
      });
      userId = loan.userId;
      this.server.create('account', {
        amount: 200,
        remaining: 200,
        status : { name : 'Open' },
        paymentStatus : { name : 'Suspended claim returned' },
        loanId: loan.id,
        userId: loan.userId,
        itemId: loan.item.id,
        id: '1'
      });
      this.server.get('/accounts');
      this.visit(`/users/${userId}/loans/open`);
    });
    it('loan should have Suspended ', () => {
      expect(OpenLoansInteractor.feeFineIncurred.text).to.equal('200 Suspended');
    });
  });
});
