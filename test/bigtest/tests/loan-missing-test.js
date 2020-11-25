import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import LoanDetails404 from '../interactors/loan-details-404';

describe('Missing loan', () => {
  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    },
  });

  describe('Visiting loan details page for missing loan', () => {
    beforeEach(async function () {
      this.server.create('user', { id: 'b612' });
      this.visit('/users/b612/loans/view/404');
    });

    it('should display "could not retrieve loan" pane', () => {
      expect(LoanDetails404.isPresent).to.be.true;
    });

    it('should display "could not retrieve loan" message', () => {
      expect(LoanDetails404.message).to.equal('The requested loan could not be retrieved.');
    });
  });
});
