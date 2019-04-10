import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import OpenLoansInteractor from '../interactors/open-loans';

describe('Open Loans', () => {
  setupApplication({ permissions: {
    'manualblocks.collection.get': true,
    'circulation.loans.collection.get': true,
  } });

  const requestsAmount = 2;

  beforeEach(async function () {
    const user = this.server.create('user');
    const loan = this.server.create('loan', { status: { name: 'Open' } });

    this.server.createList('request', requestsAmount, { itemId: loan.itemId });
    this.visit(`/users/view/${user.id}?layer=open-loans&query=%20&sort=requests`);
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
      });
    });
  });
});
