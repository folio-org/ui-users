import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import FeeFineInteractor from '../interactors/settings-feefine';

describe('Manual charges', () => {
  this.timeout(5000);

  beforeEach(async function () {
    setupApplication({ scenarios: ['templates'] });

    this.visit('/settings/users/feefinestable');
    await FeeFineInteractor.whenLoaded();
  });

  it('renders proper amount of rows', () => {
    expect(FeeFineInteractor.list.rowCount).to.equal(1);
  });

  it('renders proper amount of columns', () => {
    expect(FeeFineInteractor.list.rows(0).cellCount).to.equal(5);
  });

  it('renders proper values for the first row', () => {
    const firstRow = FeeFineInteractor.list.rows(0);

    expect(firstRow.cells(0).text).to.equal('Feefine 1');
    expect(firstRow.cells(1).text).to.equal('1050.00');
    expect(firstRow.cells(2).text).to.equal('-');
    expect(firstRow.cells(3).text).to.equal('-');
  });

  describe('delete manual charge', () => {
    it('confirmation modal is not visible until delete button is clicked', () => {
      expect(FeeFineInteractor.confirmationModal.isPresent).to.be.false;
    });

    describe('is visible', () => {
      beforeEach(async () => {
        await FeeFineInteractor.list.rows(0).deleteButton.click();
      });

      it('when delete button is clicked', () => {
        expect(FeeFineInteractor.confirmationModal.isPresent).to.be.true;
      });
    });

    describe('confirmation modal disappears', () => {
      beforeEach(async () => {
        await FeeFineInteractor.list.rows(0).deleteButton.click();
        await FeeFineInteractor.confirmationModal.cancelButton.click();
      });

      it('when cancel button is clicked', () => {
        expect(FeeFineInteractor.confirmationModal.isPresent).to.be.false;
      });
    });

    describe('upon click on confirm button initiates the deletion process and in case of success', () => {
      beforeEach(async () => {
        await FeeFineInteractor.list.rows(0).deleteButton.click();
        await FeeFineInteractor.confirmationModal.confirmButton.click();
      });

      it('confirmation modal disappears', () => {
        expect(FeeFineInteractor.confirmationModal.isPresent).to.be.false;
      });

      it('the successful toast appears', () => {
        expect(FeeFineInteractor.callout.successCalloutIsPresent).to.be.true;
      });

      it('renders empty message', () => {
        expect(FeeFineInteractor.list.isPresent).to.be.false;
      });
    });
  });

  describe('cancel edit manual feefine', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Changed value');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('300');
      await FeeFineInteractor.list.rows(0).select(1).selectAndBlur('Template 1');
      await FeeFineInteractor.list.rows(0).select(0).selectAndBlur('Template 3');
      await FeeFineInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper values after cancel', () => {
      const firstRow = FeeFineInteractor.list.rows(0);

      expect(firstRow.cells(0).text).to.equal('Feefine 1');
      expect(firstRow.cells(1).text).to.equal('1050.00');
      expect(firstRow.cells(3).text).to.equal('-');
    });
  });

  describe('edit manual charge', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Changed value');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('300');
      await FeeFineInteractor.list.rows(0).select(1).selectAndBlur('Template 1');
      await FeeFineInteractor.list.rows(0).select(0).selectAndBlur('Template 3');
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after update', () => {
      expect(FeeFineInteractor.list.rows(0).cells(0).text).to.equal('Changed value');
      expect(FeeFineInteractor.list.rows(0).cells(1).text).to.equal('300.00');
      expect(FeeFineInteractor.list.rows(0).cells(3).text).to.equal('Template 1');
    });
  });

  describe('create new manual feature', () => {
    beforeEach(async () => {
      await FeeFineInteractor.newItemButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('New feefine');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('100');
      await FeeFineInteractor.list.rows(0).select(1).selectAndBlur('Template 2');
      await FeeFineInteractor.list.rows(0).select(0).selectAndBlur('Template 4');
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after update', () => {
      const lastRow = FeeFineInteractor.list.rows(1);

      expect(lastRow.cells(0).text).to.equal('New feefine');
      expect(lastRow.cells(1).text).to.equal('100.00');
      expect(lastRow.cells(3).text).to.equal('Template 2');
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineInteractor.list.rowCount).to.equal(2);
    });
  });

  describe('edit and cancel owner charge notice', () => {
    beforeEach(async () => {
      await FeeFineInteractor.ownerSelect.selectAndBlur('Main Admin1');
      await FeeFineInteractor.notice.primaryButton.click();
      await FeeFineInteractor.notice.ownerChargeNotice.selectAndBlur('Template 3');
      await FeeFineInteractor.notice.ownerActionNotice.selectAndBlur('Template 2');
      await FeeFineInteractor.notice.cancelNotice.click();
    });

    it('renders proper values after cancel', () => {
      expect(FeeFineInteractor.notice.ownerChargeNoticeValue).to.equal('-');
      expect(FeeFineInteractor.notice.ownerActionNoticeValue).to.equal('-');
    });
  });

  describe('edit and save owner charge notice', () => {
    beforeEach(async () => {
      await FeeFineInteractor.ownerSelect.selectAndBlur('Main Admin1');
      await FeeFineInteractor.notice.primaryButton.click();
      await FeeFineInteractor.notice.ownerChargeNotice.selectAndBlur('Template 3');
      await FeeFineInteractor.notice.ownerActionNotice.selectAndBlur('Template 2');
      await FeeFineInteractor.notice.primaryButton.click();
    });

    it('renders proper values after update', () => {
      expect(FeeFineInteractor.notice.ownerChargeNoticeValue).to.equal('Template 3');
      expect(FeeFineInteractor.notice.ownerActionNoticeValue).to.equal('Template 2');
    });
  });

  describe('copy feefines and save', () => {
    beforeEach(async () => {
      await FeeFineInteractor.ownerSelect.selectAndBlur('Main Admin2');
      await FeeFineInteractor.copyOwnerModal.select.selectAndBlur('Main Admin1');
      await FeeFineInteractor.copyOwnerModal.yes.clickAndBlur();
      await FeeFineInteractor.copyOwnerModal.no.clickAndBlur();
      await FeeFineInteractor.copyOwnerModal.buttons(0).click();
    });

    it('renders copy modal', () => {
      expect(FeeFineInteractor.isLoaded).to.be.false;
    });
  });

  describe('copy feefines and save', () => {
    beforeEach(async () => {
      await FeeFineInteractor.ownerSelect.selectAndBlur('Main Admin2');
      await FeeFineInteractor.copyOwnerModal.select.selectAndBlur('Main Admin1');
      await FeeFineInteractor.copyOwnerModal.yes.clickAndBlur();
      await FeeFineInteractor.copyOwnerModal.buttons(0).click();
    });

    it('renders copy modal', () => {
      expect(FeeFineInteractor.isLoaded).to.be.false;
    });
  });

  describe('create new manual whit errors', () => {
    beforeEach(async () => {
      await FeeFineInteractor.newItemButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('');
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Damage camera fee0');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Item Lost');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('-10');
      await FeeFineInteractor.ownerSelect.selectAndBlur('Main Admin1');
      await FeeFineInteractor.newItemButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Feefine 1');
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after update', () => {
      const lastRow = FeeFineInteractor.list.rows(1);

      expect(lastRow.cells(0).text).to.equal('Damage camera fee0');
      expect(lastRow.cells(1).text).to.equal('1000.00');
      expect(lastRow.cells(3).text).to.equal('-');
    });
  });
});
