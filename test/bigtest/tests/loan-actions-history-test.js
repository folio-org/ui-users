import { before, beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import LoanActionsHistory from '../interactors/loan-actions-history';

import translations from '../../../translations/ui-users/en';

describe('loans actions history', () => {
  const requestsAmount = 2;

  before(function () {
    setupApplication({
      permissions: {
        'manualblocks.collection.get': true,
        'circulation.loans.collection.get': true,
      }
    });
  });

  beforeEach(async function () {
    const loan = this.server.create('loan', {
      status: { name: 'Open' },
      loanPolicyId: 'test'
    });

    this.server.createList('loanactions', 5, { loan: { ...loan.attrs } });

    this.server.createList('request', requestsAmount, { itemId: loan.itemId });
    this.visit(`/users/${loan.userId}/loans/view/${loan.id}`);
  });

  it('should be presented', () => {
    expect(LoanActionsHistory.isPresent).to.be.true;
  });

  it('having loan without fees/fines incurred should display the "-"', () => {
    expect(LoanActionsHistory.feeFines.text).to.equal('-');
  });

  describe('having loan with fees/fines incurred', () => {
    beforeEach(async function () {
      this.server.get('/accounts', {
        accounts: [{ amount: 200 }],
        totalRecords: 1,
      });
    });

    it('should display the fees/fines value', () => {
      expect(LoanActionsHistory.feeFines.text).to.equal('200.00');
    });
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
        const loan = this.server.create('loan', { status: { name: 'Open' } });

        this.server.createList('request', requestsAmount, { itemId: loan.itemId });
        this.visit(`/users/${loan.userId}/loans/${loan.id}`);
      });

      it('should not be presented', () => {
        expect(LoanActionsHistory.requests.isPresent).to.be.false;
      });
    });
  });
});
