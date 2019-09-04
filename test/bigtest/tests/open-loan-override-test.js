import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import OpenLoansInteractor from '../interactors/open-loans';

describe('open loans override', () => {
  describe('request related failure', () => {
    setupApplication({
      scenarios: ['request-related-failure'],
      permissions: {
        'manualblocks.collection.get': true,
        'circulation.loans.collection.get': true,
      },
    });

    beforeEach(async function () {
      const user = this.server.create('user');
      this.server.create('loan', { status: { name: 'Open' } });

      this.visit(`/users/${user.id}/loans/open?query=%20&sort=requests`);
    });

    it('should be presented', () => {
      expect(OpenLoansInteractor.isPresent).to.be.true;
    }).timeout(4000);

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

          describe('bulk renew modal', () => {
            it('should be presented', () => {
              expect(OpenLoansInteractor.bulkRenewalModal.isPresent).to.be.true;
            });

            describe('override button', () => {
              it('should be presented', () => {
                expect(OpenLoansInteractor.bulkRenewalModal.overrideButton.isPresent).to.be.true;
              });

              describe('override button click', () => {
                beforeEach(async () => {
                  await OpenLoansInteractor.bulkRenewalModal.overrideButton.click();
                });

                describe('bulk override modal', () => {
                  it('should be presented', () => {
                    expect(OpenLoansInteractor.bulkOverrideModal.isPresent).to.be.true;
                  });

                  it('due date picker should not be presented', () => {
                    expect(OpenLoansInteractor.bulkOverrideModal.dueDatePicker.isPresent).to.be.false;
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('multiple errors: request related failure, item is not loanable', () => {
    setupApplication({
      scenarios: ['request-related-failure-multiple-errors'],
      permissions: {
        'manualblocks.collection.get': true,
        'circulation.loans.collection.get': true,
      },
    });

    beforeEach(async function () {
      const user = this.server.create('user');
      this.server.create('loan', { status: { name: 'Open' } });

      this.visit(`/users/${user.id}/loans/open?query=%20&sort=requests`);
    });

    it('should be presented', () => {
      expect(OpenLoansInteractor.isPresent).to.be.true;
    }).timeout(4000);

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

          describe('bulk renew modal', () => {
            it('should be presented', () => {
              expect(OpenLoansInteractor.bulkRenewalModal.isPresent).to.be.true;
            });

            describe('override button', () => {
              it('should be presented', () => {
                expect(OpenLoansInteractor.bulkRenewalModal.overrideButton.isPresent).to.be.true;
              });
            });
          });
        });
      });
    });
  });
});
