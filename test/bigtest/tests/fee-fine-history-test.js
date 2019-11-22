import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';

describe('Test Fee/Fine History', () => {
  before(function () {
    setupApplication({ scenarios: ['view-fees-fines'] });
  });

  beforeEach(async function () {
    this.visit('/users/preview/ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd');
    await FeeFineHistoryInteractor.whenSectionLoaded();
  });

  it('displays label section Fees/Fines', () => {
    expect(FeeFineHistoryInteractor.section).to.equal('Fees/Fines');
  });

  describe('displays section Fees/Fines', () => {
    beforeEach(async () => {
      await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
    });

    it('It should render with the labels', () => {
      expect(FeeFineHistoryInteractor.openFeesFines).to.string('open fees/fines');
      expect(FeeFineHistoryInteractor.closedFeesFines).to.string('closed fees/fines');
      expect(FeeFineHistoryInteractor.allFeesFines).to.string('View all fees/fines');
    });

    describe('select open fees/fines', () => {
      beforeEach(async function () {
        await FeeFineHistoryInteractor.openAccounts.click();
      });

      it('displays the pane title menu', () => {
        expect(FeeFineHistoryInteractor.paneTitle).to.string('Fees/Fines -');
        expect(FeeFineHistoryInteractor.paneSub).to.string('Outstanding Balance');
        expect(FeeFineHistoryInteractor.labelMenu).to.string('Open fees/fines for');
        expect(FeeFineHistoryInteractor.outstandingMenu).to.string('Outstanding Balance');
      });

      describe('displays open fees/fines rows', () => {
        beforeEach(async function () {
          await FeeFineHistoryInteractor.whenLoadedOpen();
          await FeeFineHistoryInteractor.whenVisibledOpen();
        });

        it('renders proper amount of rows', () => {
          expect(FeeFineHistoryInteractor.mclViewFeesFines.rowCount).to.equal(5);
        });

        describe('activate the Search & filter', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.clickfilterButton();
          });

          it('displays the Search & filter pane', () => {
            expect(FeeFineHistoryInteractor.filterPaneVisible).to.be.true;
          });

          describe('close the Search & filter pane', () => {
            beforeEach(async () => {
              await FeeFineHistoryInteractor.searchField.fillInput('Missing item');
              await FeeFineHistoryInteractor.checkList(0).clickAndBlur();
              await FeeFineHistoryInteractor.closePane.click();
            });

            it('close Search & filter button pane', () => {
              expect(FeeFineHistoryInteractor.openMenu.text).to.equal('Open');
            });
          });
        });
      });

      describe('select columns', () => {
        beforeEach(async function () {
          await FeeFineHistoryInteractor.selectColumns.click();
          await FeeFineHistoryInteractor.col.clickAndBlur();
        });

        it('renders proper amount of columns', () => {
          expect(FeeFineHistoryInteractor.mclViewFeesFines.columnCount).to.equal(13);
        });
      });

      describe('selects one row in open accounts and transfer button', () => {
        beforeEach(async () => {
          await FeeFineHistoryInteractor.rows(2).cells(0).selectOne();
          await FeeFineHistoryInteractor.transferButton.click();
        });

        it('displays title transfer modal', () => {
          expect(FeeFineHistoryInteractor.transferModal.hasHeader).to.be.true;
        });
      });

      describe('selects all accounts', () => {
        beforeEach(async () => {
          await FeeFineHistoryInteractor.openMenu.click();
          await FeeFineHistoryInteractor.closedMenu.click();
          await FeeFineHistoryInteractor.allMenu.click();
        });

        describe('select checkbox header', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.selectAllCheckbox();
          });

          it('displays title modal', () => {
            expect(FeeFineHistoryInteractor.payButton.text).to.equal('Pay');
          });
        });
      });

      describe('selects headers open Fee/Fine history', () => {
        beforeEach(async () => {
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(1).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(2).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(3).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(4).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(5).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(6).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(7).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(8).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(9).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(10).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(11).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(12).click();
          await FeeFineHistoryInteractor.mclViewFeesFines.headers(12).click();
        });

        it('renders appropriate headers', () => {
          expect(FeeFineHistoryInteractor.mclViewFeesFines.headers().length).to.be.greaterThan(0);
        });

        it('validate the correct amount on each row after the transfer', () => {
          const dataKeys = ['100.00', '110.00', '120.00', '130.00', '100.00'];

          for (let i = 0; i < 5; i++) {
            expect(FeeFineHistoryInteractor.mclViewFeesFines.rows(i).cells(5).content).to.equal(dataKeys[i]);
          }
        });
      });

      describe('select one row and go to accounts actions section', () => {
        beforeEach(async () => {
          await FeeFineHistoryInteractor.rows(3).click();
        });

        it('displays account actions section', () => {
          expect(FeeFineHistoryInteractor.accountActionIsPresent).to.be.true;
        });
      });

      describe('Test the ellipsis menu', () => {
        beforeEach(async () => {
          await FeeFineHistoryInteractor.rows(3).cells(13).selectEllipsis();
        });

        it('the ellipsis menu most be present', () => {
          expect(FeeFineHistoryInteractor.ellipsisMenuIsPresent).to.be.true;
        });

        describe('select the pay option', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.dropDownEllipsisOptions(0).click();
          });

          it('show the pay modal', () => {
            expect(FeeFineHistoryInteractor.payModal.hasHeader).to.be.true;
          });
        });

        describe('select the waive option', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.dropDownEllipsisOptions(1).click();
          });

          it('show the waive modal', () => {
            expect(FeeFineHistoryInteractor.waiveModal.hasHeader).to.be.true;
          });
        });

        describe('select the transfer option', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.dropDownEllipsisOptions(3).click();
          });

          it('show the transfer modal', () => {
            expect(FeeFineHistoryInteractor.transferModal.hasHeader).to.be.true;
          });
        });

        describe('select the cancel option', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.dropDownEllipsisOptions(4).click();
          });

          it('show the cancel modal', () => {
            expect(FeeFineHistoryInteractor.cancelModal.hasHeader).to.be.true;
          });
        });

        describe('select loan details option', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.dropDownEllipsisOptions(5).click();
          });
          it('show the loan details modal', () => {
            expect(FeeFineHistoryInteractor.loanDetailsIsPresent).to.be.true;
          });
        });
      });
    });
  });
});
