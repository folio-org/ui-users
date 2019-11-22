import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import DummyComponent from '../helpers/DummyComponent';
import OpenLoansInteractor from '../interactors/open-loans';

describe('Open Loans', () => {
  const requestsPath = '/requests';
  const requestsAmount = 2;

  before(function () {
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
  });

  beforeEach(async function () {
    const loan = this.server.create('loan', { status: { name: 'Open' } });

    this.server.createList('request', requestsAmount, { itemId: loan.itemId });
    this.visit(`/users/${loan.userId}/loans/open?query=%20&sort=requests`);
  });

  it('should be presented', () => {
    expect(OpenLoansInteractor.isPresent).to.be.true;
  }).timeout(4000);

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

        describe('click request queue', () => {
          beforeEach(async () => {
            await OpenLoansInteractor.actionDropdownRequestQueue.click('button');
          });

          it('should be redirected to "requests"', function () {
            expect(this.location.pathname).to.to.equal(requestsPath);
          });
        });
      });
    });
  });
});
