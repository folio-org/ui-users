import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import translations from '../../../translations/ui-users/en';
import setupApplication from '../helpers/setup-application';
import ClosedLoansInteractor from '../interactors/closed-loans';
import UsersInteractor from '../interactors/users';
import LoansListingPane from '../interactors/loans-listing-pane';

function setupAnonymizationAPIResponse(server, errors) {
  server.post('/loan-anonymization/by-user/:id', { errors });
}

describe('Closed Loans', () => {
  setupApplication({
    permissions: {
      'manualblocks.collection.get': true,
      'circulation.loans.collection.get': true,
    },
  });

  let user;
  let loans;

  describe('visit closed loans', () => {
    beforeEach(async function () {
      user = this.server.create('user');
      loans = this.server.createList('loan', 5, 'feesAndFines', {
        userId: user.id,
        item: (i) => ({
          ...this.item,
          barcode: i,
          callNumberComponents: {
            prefix: 'prefix',
            callNumber: 'callNumber',
            suffix: 'suffix',
          },
          enumeration: 'enumeration',
          chronology: 'chronology',
          volume: 'volume',
        }),
        status: { name: 'Closed' },
      });

      setupAnonymizationAPIResponse(this.server, [{
        message: 'haveAssociatedFeesAndFines',
        parameters: [{
          key: 'loanIds',
          value: JSON.stringify([loans[0]]),
        }]
      }]);

      this.visit(`/users/${loans[0].userId}/loans/closed?query=%20&sort=requests`);

      await ClosedLoansInteractor.whenLoaded();
    });

    it('should be presented', () => {
      expect(ClosedLoansInteractor.isPresent).to.be.true;
    });

    it('should display close button', () => {
      expect(LoansListingPane.closeButton.isPresent).to.be.true;
    });

    describe('loan list', () => {
      it('should be presented', () => {
        expect(ClosedLoansInteractor.list.isPresent).to.be.true;
      });

      it('loan should have effective call number', () => {
        const callNumber = 'prefix callNumber suffix volume enumeration chronology';

        expect(ClosedLoansInteractor.callNumbers(0).text).to.equal(callNumber);
      });

      it('loan table call number column header should have title', () => {
        expect(ClosedLoansInteractor.columnHeaders(4).text).to.equal(translations['loans.details.effectiveCallNumber']);
      });
    });

    describe('sorting loan list', () => {
      let firstRowValue;
      beforeEach(async () => {
        firstRowValue = ClosedLoansInteractor.list.rows(0).cells(2).text;
        await ClosedLoansInteractor.list.headers(2).click();
        await ClosedLoansInteractor.list.headers(2).click();
      });

      it('re-orders the rows', () => {
        expect(firstRowValue).to.not.equal(ClosedLoansInteractor.list.rows(0).cells(2).text);
      });
    });

    describe('anonymizing loans without fee/fines', () => {
      beforeEach(async function () {
        setupAnonymizationAPIResponse(this.server, []);
        await ClosedLoansInteractor.anonymizeButton.click();
      });

      it('should not be prevented and error modal should not be shown', () => {
        expect(ClosedLoansInteractor.anonymizationFeesFinesErrorModal.isPresent).to.be.false;
      });
    });

    describe('anonymizing loans with fee/fines', () => {
      beforeEach(async () => {
        await ClosedLoansInteractor.anonymizeButton.click();
      });

      it('should be prevented and error modal should be shown', () => {
        expect(ClosedLoansInteractor.anonymizationFeesFinesErrorModal.isPresent).to.be.true;
      });

      describe('clicking on the confirmation button in the error modal', () => {
        beforeEach(async () => {
          await ClosedLoansInteractor.anonymizationConfirmButton.click();
        });

        it('should close the error modal', () => {
          expect(ClosedLoansInteractor.anonymizationFeesFinesErrorModal.isPresent).to.be.false;
        });
      });
    });

    describe('clicking the close button', () => {
      const users = new UsersInteractor();

      beforeEach(async () => {
        await LoansListingPane.closeButton.click();
      });

      it('should navigate to user preview form', function () {
        expect(users.isPresent).to.be.true;
        expect(users.instance.isPresent).to.be.true;
        expect(this.location.pathname.endsWith(`users/preview/${user.id}`)).to.be.true;
      });
    });

    describe('viewing a closed loan list with a deleted/undefined item', function () {
      beforeEach(async () => {
        loans[1].item = undefined;
      });

      it('should load the page without errors', () => {
        expect(ClosedLoansInteractor.isPresent).to.be.true;
        expect(ClosedLoansInteractor.list.isPresent).to.be.true;
      });
    });
  });
});
