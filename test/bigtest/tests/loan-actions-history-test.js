import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import LoanActionsHistory from '../interactors/loan-actions-history';

import translations from '../../../translations/ui-users/en';

describe('loans actions history', () => {
  setupApplication({ permissions: {
    'manualblocks.collection.get': true,
    'circulation.loans.collection.get': true,
  } });

  const requestsAmount = 2;

  beforeEach(async function () {
    const user = this.server.create('user');
    const updatingUser = this.server.create('user');
    const loan = this.server.create('loan', {
      metadata: { updatedByUserId: updatingUser.id },
      status: { name: 'Open' },
      loanPolicyId: 'test'
    });

    this.server.createList('request', requestsAmount, { itemId: loan.itemId });
    this.visit(`/users/${user.id}/loans/view/${loan.id}`);
  });

  it('should be presented', () => {
    expect(LoanActionsHistory.isPresent).to.be.true;
  });

  describe('requests', () => {
    it('should be presented', () => {
      expect(LoanActionsHistory.requests.isPresent).to.be.true;
    });

    it('should have proper value', () => {
      expect(LoanActionsHistory.requests.value.text).to.equal(requestsAmount.toString());
    });

    it('should have proper label', () => {
      expect(LoanActionsHistory.requests.label.text).to.equal(translations['loans.details.requestQueue']);
    });

    describe('loan without loanPolicy', () => {
      beforeEach(async function () {
        const user = this.server.create('user');
        const loan = this.server.create('loan', { status: { name: 'Open' } });

        this.server.createList('request', requestsAmount, { itemId: loan.itemId });
        this.visit(`/users/${user.id}/loans/${loan.id}`);
      });

      it('should not be presented', () => {
        expect(LoanActionsHistory.requests.isPresent).to.be.false;
      });
    });
  });
});
