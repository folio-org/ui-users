import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import OpenLoansInteractor from '../interactors/open-loans';

describe('Change due date', () => {
  describe('test change due date overlay', () => {
    setupApplication({
      permissions: {
        'circulation.loans.collection.get': true,
      },
    });

    const requestsAmount = 2;

    beforeEach(async function () {
      const user = this.server.create('user');
      const loan = this.server.create('loan', { status: { name: 'Open' } });

      this.server.createList('request', requestsAmount, { itemId: loan.itemId });
      this.visit(`/users/view/${user.id}?layer=open-loans&query=%20&sort=requests`);
      await OpenLoansInteractor.whenLoaded();
    });

    it('should be presented', () => {
      expect(OpenLoansInteractor.isPresent).to.be.true;
    });

    describe('action dropdown', () => {
      it('icon button should be presented', () => {
        expect(OpenLoansInteractor.actionDropdowns(0).isPresent).to.be.true;
      });

      describe('action dropdown click', () => {
        beforeEach(async () => {
          await OpenLoansInteractor.actionDropdowns(0).click('button');
        });

        it('change due date button should be presented', () => {
          expect(OpenLoansInteractor.actionDropdownChangeDueDateButton.isPresent).to.be.true;
        });

        describe('click change due date button', () => {
          beforeEach(async () => {
            await OpenLoansInteractor.actionDropdownChangeDueDateButton.click();
          });

          describe('change due date overlay', () => {
            it('should be presented', () => {
              expect(OpenLoansInteractor.changeDueDateOverlay.isPresent).to.be.true;
            });

            it('requests count equals', () => {
              expect(OpenLoansInteractor.changeDueDateOverlay.requestsCount.text).to.equal(requestsAmount.toString());
            });

            it('save button is presented and disabled', () => {
              expect(OpenLoansInteractor.changeDueDateOverlay.saveButton.isPresent).to.be.true;
              expect(OpenLoansInteractor.changeDueDateOverlay.isSaveButtonDisabled).to.be.true;
            });

            it('control due date calendar button is presented', () => {
              expect(OpenLoansInteractor.changeDueDateOverlay.dueDateCalendarButton.isPresent).to.be.true;
            });

            it('cancel button is presented', () => {
              expect(OpenLoansInteractor.changeDueDateOverlay.dueDateCalendarButton.isPresent).to.be.true;
            });

            describe('change due date', () => {
              beforeEach(async () => {
                await OpenLoansInteractor.changeDueDateOverlay.dueDateCalendarButton.click();
                await OpenLoansInteractor.dueDateCalendarCellButton.click();
              });

              it('save button is enabled after changes in form', () => {
                expect(OpenLoansInteractor.changeDueDateOverlay.isSaveButtonDisabled).to.be.false;
              });
            });

            describe('cancel due date change', () => {
              beforeEach(async () => {
                await OpenLoansInteractor.changeDueDateOverlay.cancelButton.click();
              });

              it('change due date overlay is hidden after click on cancel button', () => {
                expect(OpenLoansInteractor.changeDueDateOverlay.isPresent).to.be.false;
              });
            });
          });
        });
      });
    });
  });
});
