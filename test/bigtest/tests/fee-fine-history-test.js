import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import FeeFineHistoryInteractor from '../interactors/fee-fine-history';

describe('Test Fee/Fine History', () => {
  setupApplication({
    scenarios: ['view-fees-fines'],
    currentUser: {
      curServicePoint: { id: 1, value: 'Test Point' },
    },
  });
  describe('visit user details', () => {
    beforeEach(async function () {
      this.visit('/users/preview/ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd');
      await FeeFineHistoryInteractor.whenSectionLoaded();
    });

    it('displays label section Fees/Fines', () => {
      expect(FeeFineHistoryInteractor.section).to.equal('Fees/fines');
    });

    it('displays active Export button', () => {
      expect(FeeFineHistoryInteractor.exportButtonIsDisabled).to.be.false;
    });

    describe('displays section Fees/Fines', () => {
      beforeEach(async () => {
        await FeeFineHistoryInteractor.sectionFeesFinesSection.click();
      });

      it('It should render with the labels', () => {
        expect(FeeFineHistoryInteractor.openFeesFines).to.string('open fees/fines');
        expect(FeeFineHistoryInteractor.closedFeesFines).to.string('0 closed fees/fines');
        expect(FeeFineHistoryInteractor.allFeesFines).to.string('View all fees/fines');
        expect(FeeFineHistoryInteractor.refundedFeesFines).to.string('0 refunded fees/fines (Total: 0.00)');
        expect(FeeFineHistoryInteractor.claimFeesFines).to.string('0 suspended claim returned fees/fines (Total: 0.00)');
      });

      describe('select open fees/fines', () => {
        beforeEach(async function () {
          await FeeFineHistoryInteractor.openAccounts.click();
        });

        it('displays the pane title menu', () => {
          expect(FeeFineHistoryInteractor.paneTitle).to.string('Fees/fines -');
          expect(FeeFineHistoryInteractor.paneSub).to.string('Outstanding balance for page');
          expect(FeeFineHistoryInteractor.paneSub).to.string('Suspended balance for page');
          expect(FeeFineHistoryInteractor.labelMenu).to.string('Open fees/fines for');
          expect(FeeFineHistoryInteractor.outstandingMenu).to.string('Total outstanding balance: 660.00 | Total suspended balance: 0.00');
        });

        describe('displays open fees/fines rows', () => {
          beforeEach(async function () {
            await FeeFineHistoryInteractor.whenLoadedOpen();
            await FeeFineHistoryInteractor.whenVisibledOpen();
          });

          it('renders proper amount of rows', () => {
            expect(FeeFineHistoryInteractor.mclViewFeesFines.rowCount).to.equal(6);
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

        describe('selects one row in open accounts', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.rows(2).cells(0).selectOne();
          });

          describe('transfer single select account', () => {
            beforeEach(async () => {
              await FeeFineHistoryInteractor.transferButton.click();
            });

            it('displays title transfer modal', () => {
              expect(FeeFineHistoryInteractor.actionModal.hasHeader).to.be.true;
            });

            describe('Choose transfer account name', () => {
              beforeEach(async () => {
                await FeeFineHistoryInteractor.actionModalAmountField.pressTab();
                await FeeFineHistoryInteractor.actionModalSelect.selectAndBlur('USA Bank0');
              });

              it('displays transfer modal select option', () => {
                expect(FeeFineHistoryInteractor.actionModalSelect.value).to.equal('USA Bank0');
              });

              it('displays transfer button', () => {
                expect(FeeFineHistoryInteractor.actionModalSubmitButton.isPresent).to.be.true;
                expect(FeeFineHistoryInteractor.actionModalSubmitButtonIsDisabled).to.be.false;
              });

              describe('Fill transfer comment', () => {
                beforeEach(async () => {
                  await FeeFineHistoryInteractor.commentField.focusTextArea();
                  await FeeFineHistoryInteractor.commentField.fillAndBlur('Transfer comment');
                });

                it('displays transfer comment value', () => {
                  expect(FeeFineHistoryInteractor.commentField.val).to.equal('Transfer comment');
                });

                it('displays active submit transfer button', () => {
                  expect(FeeFineHistoryInteractor.actionModalSubmitButtonIsDisabled).to.be.false;
                });

                describe('transfer fine', () => {
                  beforeEach(async () => {
                    await FeeFineHistoryInteractor.actionModalSubmitButton.click();
                  });

                  it('displays confirmation modal', () => {
                    expect(FeeFineHistoryInteractor.actionConfirmationModal.body.isPresent).to.be.true;
                  });

                  describe('confirm fine transfering', () => {
                    beforeEach(async () => {
                      await FeeFineHistoryInteractor.actionConfirmationModal.confirmButton.click();
                    });

                    it('show successfull callout', () => {
                      expect(FeeFineHistoryInteractor.callout.successCalloutIsPresent).to.be.true;
                    });
                  });
                });
              });
            });
          });

          describe('pay single select account', () => {
            beforeEach(async () => {
              await FeeFineHistoryInteractor.payButton.click();
            });

            it('displays title payment modal', () => {
              expect(FeeFineHistoryInteractor.actionModal.hasHeader).to.be.true;
            });

            describe('Choose payment method', () => {
              beforeEach(async () => {
                await FeeFineHistoryInteractor.actionModalAmountField.pressTab();
                await FeeFineHistoryInteractor.actionModalSelect.selectAndBlur('Cash0');
              });

              it('displays payment modal select option', () => {
                expect(FeeFineHistoryInteractor.actionModalSelect.value).to.equal('Cash0');
              });

              it('displays pay button', () => {
                expect(FeeFineHistoryInteractor.actionModalSubmitButton.isPresent).to.be.true;
                expect(FeeFineHistoryInteractor.actionModalSubmitButtonIsDisabled).to.be.false;
              });

              describe('Pay fee/fine', () => {
                beforeEach(async () => {
                  await FeeFineHistoryInteractor.actionModalSubmitButton.click();
                });

                it('displays confirmation modal', () => {
                  expect(FeeFineHistoryInteractor.actionConfirmationModal.body.isPresent).to.be.true;
                });

                describe('confirm fine payment', () => {
                  beforeEach(async () => {
                    await FeeFineHistoryInteractor.actionConfirmationModal.confirmButton.click();
                  });

                  it('show successfull callout', () => {
                    expect(FeeFineHistoryInteractor.callout.successCalloutIsPresent).to.be.true;
                  });
                });
              });
            });
          });

          describe('waive single select account', () => {
            beforeEach(async () => {
              await FeeFineHistoryInteractor.waiveButton.click();
            });

            it('displays title waivement modal', () => {
              expect(FeeFineHistoryInteractor.actionModal.hasHeader).to.be.true;
            });

            describe('Choose waivement reason', () => {
              beforeEach(async () => {
                await FeeFineHistoryInteractor.actionModalAmountField.pressTab();
                await FeeFineHistoryInteractor.actionModalSelect.selectAndBlur('First time offender0');
              });

              it('displays waivement modal select option', () => {
                expect(FeeFineHistoryInteractor.actionModalSelect.value).to.equal('First time offender0');
              });

              it('displays waive button', () => {
                expect(FeeFineHistoryInteractor.actionModalSubmitButton.isPresent).to.be.true;
                expect(FeeFineHistoryInteractor.actionModalSubmitButtonIsDisabled).to.be.false;
              });

              describe('Waive fee/fine', () => {
                beforeEach(async () => {
                  await FeeFineHistoryInteractor.actionModalSubmitButton.click();
                });

                it('displays confirmation modal', () => {
                  expect(FeeFineHistoryInteractor.actionConfirmationModal.body.isPresent).to.be.true;
                });

                describe('confirm fine waivement', () => {
                  beforeEach(async () => {
                    await FeeFineHistoryInteractor.actionConfirmationModal.confirmButton.click();
                  });

                  it('show successfull callout', () => {
                    expect(FeeFineHistoryInteractor.callout.successCalloutIsPresent).to.be.true;
                  });
                });
              });
            });
          });

          describe('Export Fees/Fines report', () => {
            beforeEach(async () => {
              await FeeFineHistoryInteractor.exportButton.click();
            });

            it('show successfull callout', () => {
              expect(FeeFineHistoryInteractor.callout.successCalloutIsPresent).to.be.true;
            });
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

          it('the ellipsis menu must be present', () => {
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

        describe('est the ellipsis menu (anonymized)', () => {
          beforeEach(async () => {
            await FeeFineHistoryInteractor.rows(5).cells(13).selectEllipsis();
          });
          it('Check text on loan details option', () => {
            expect(FeeFineHistoryInteractor.dropDownEllipsisOptions(5).text).to.string('Loan details (anonymized)');
          });
        });
      });
    });
  });
});

