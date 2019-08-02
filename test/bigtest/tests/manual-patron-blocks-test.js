import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import { faker } from '@bigtest/mirage';

import setupApplication from '../helpers/setup-application';
import PatronBlocksInteractor from '../interactors/manual-blocks';

describe('Test Patron Blocks section', () => {
  setupApplication({
    scenarios: ['manual-blocks'],
    permissions: {
      'manualblocks.collection.get': true
    },
  });

  beforeEach(async function () {
    this.visit('/users/view/1ad737b0-d847-11e6-bf26-cec0c932ce02');
    await PatronBlocksInteractor.whenSectionLoaded();
    await PatronBlocksInteractor.whenBlocksLoaded();
  });

  it('displays Patron Blocks label section', () => {
    expect(PatronBlocksInteractor.label).to.equal('Patron Blocks');
  });

  it('renders proper amount of rows', () => {
    expect(PatronBlocksInteractor.mclPatronBlock.rowCount).to.equal(3);
  }).timeout(4000);

  describe('add patron block', () => {
    beforeEach(async () => {
      await PatronBlocksInteractor.createButton();
    });

    it('displays button label', () => {
      expect(PatronBlocksInteractor.patronBlockSaveButtonLabel).to.equal('Save & close');
    });

    describe('saving new patron block', async () => {
      beforeEach(async () => {
        await PatronBlocksInteractor.patronBlockDesc.fillTextArea('Description');
        await PatronBlocksInteractor.patronBlockDesc.blurTextArea();
        await PatronBlocksInteractor.patronBlockStaff.fillTextArea('Staff information');
        await PatronBlocksInteractor.patronBlockPatron.fillTextArea('Message to Patron');
        await PatronBlocksInteractor.patronBlockExpirationDate.fillInput(faker.date.future(2));
        await PatronBlocksInteractor.patronBlockBorrowing.clickAndBlur();
        await PatronBlocksInteractor.patronBlockRenewals.clickAndBlur();
        await PatronBlocksInteractor.patronBlockSave();
        await PatronBlocksInteractor.whenBlocksLoaded();
      });

      it('renders proper amount of rows', () => {
        expect(PatronBlocksInteractor.mclPatronBlock.rowCount).to.equal(4);
      }).timeout(4000);
    });
  });

  describe('update patron block', async () => {
    beforeEach(async () => {
      await PatronBlocksInteractor.mclPatronBlock.rows(1).click();
      await PatronBlocksInteractor.whenFormLoaded();
    });

    it('compares the value', () => {
      expect(PatronBlocksInteractor.patronBlockDesc.val).to.equal('Invalid email and mailing addresses.');
    });

    describe('update patron block', async () => {
      beforeEach(async () => {
        await PatronBlocksInteractor.patronBlockDesc.fillTextArea('Mail sent to patron has bounced back.');
      });

      it('updates the value', () => {
        expect(PatronBlocksInteractor.patronBlockDesc.val).to.equal('Mail sent to patron has bounced back.');
      });

      describe('save update patron block', async () => {
        beforeEach(async () => {
          await PatronBlocksInteractor.patronBlockSave();
        });

        it('renders proper amount of rows', () => {
          expect(PatronBlocksInteractor.mclPatronBlock.rowCount).to.equal(3);
        }).timeout(4000);

        describe('onsort', async () => {
          beforeEach(async () => {
            await PatronBlocksInteractor.mclPatronBlock.headers(0).click();
            await PatronBlocksInteractor.mclPatronBlock.headers(0).click();
          });
          it('renders proper amount of rows', () => {
            expect(PatronBlocksInteractor.mclPatronBlock.rowCount).to.equal(3);
          }).timeout(4000);
        });

        describe('delete row', async () => {
          beforeEach(async () => {
            await PatronBlocksInteractor.mclPatronBlock.rows(1).click();
            await PatronBlocksInteractor.patronBlockDelete();
            await PatronBlocksInteractor.confirmationModal.cancelButton.click();
            await PatronBlocksInteractor.patronBlockDelete();
            await PatronBlocksInteractor.confirmationModal.confirmButton.click();
          });

          it('renders proper amount of rows', () => {
            expect(PatronBlocksInteractor.mclPatronBlock.rowCount).to.equal(3);
          });
        });
      });
    });
  });

  describe('test handleSectionToggle', () => {
    beforeEach(async () => {
      await PatronBlocksInteractor.createButton();
    });

    it('displays title', () => {
      expect(PatronBlocksInteractor.title).to.equal('New Block');
    }).timeout(4000);

    describe('collapse patron block', () => {
      beforeEach(async () => {
        await PatronBlocksInteractor.collapseButton();
      });

      it('displays label section', () => {
        expect(PatronBlocksInteractor.informationBlockLabelSection).to.contain('Block information');
      });
    });

    describe('collapse all patron block', () => {
      beforeEach(async () => {
        await PatronBlocksInteractor.collapseAllButton();
      });

      it('displays "Expand all" button', () => {
        expect(PatronBlocksInteractor.collapseAllLabelButton).to.equal('Expand all');
      });
    });
  });
});
