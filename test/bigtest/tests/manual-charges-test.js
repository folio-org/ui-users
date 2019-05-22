import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import FeefinesInteractor from '../interactors/feefines';
import setupApplication from '../helpers/setup-application';

describe('Manual charges', () => {
  setupApplication({ scenarios: ['templates'] });

  beforeEach(async function () {
    this.visit('/settings/users/feefinestable');
    await FeefinesInteractor.whenLoaded();
  });

  it('renders proper amount of rows', () => {
    expect(FeefinesInteractor.list.rowCount).to.equal(1);
  });

  it('renders proper amount of columns', () => {
    expect(FeefinesInteractor.list.rows(0).cellCount).to.equal(5);
  });

  it('renders proper values for the first row', () => {
    const firstRow = FeefinesInteractor.list.rows(0);

    expect(firstRow.cells(0).text).to.equal('Feefine 1');
    expect(firstRow.cells(1).text).to.equal('1000.00');
    expect(firstRow.cells(2).text).to.equal('-');
    expect(firstRow.cells(3).text).to.equal('-');
  });

  describe('delete manual charge', () => {
    it('confirmation modal is not visible until delete button is clicked', () => {
      expect(FeefinesInteractor.confirmationModal.isPresent).to.be.false;
    });

    describe('is visible', () => {
      beforeEach(async () => {
        await FeefinesInteractor.list.rows(0).deleteButton.click();
      });

      it('when delete button is clicked', () => {
        expect(FeefinesInteractor.confirmationModal.isPresent).to.be.true;
      });
    });

    describe('confirmation modal disappears', () => {
      beforeEach(async () => {
        await FeefinesInteractor.list.rows(0).deleteButton.click();
        await FeefinesInteractor.confirmationModal.cancelButton.click();
      });

      it('when cancel button is clicked', () => {
        expect(FeefinesInteractor.confirmationModal.isPresent).to.be.false;
      });
    });

    describe('upon click on confirm button initiates the deletion process and in case of success', () => {
      beforeEach(async () => {
        await FeefinesInteractor.list.rows(0).deleteButton.click();
        await FeefinesInteractor.confirmationModal.confirmButton.click();
      });

      it('confirmation modal disappears', () => {
        expect(FeefinesInteractor.confirmationModal.isPresent).to.be.false;
      });

      it('the successful toast appears', () => {
        expect(FeefinesInteractor.callout.successCalloutIsPresent).to.be.true;
      });

      it('renders empty message', () => {
        expect(FeefinesInteractor.list.isPresent).to.be.false;
      });
    });
  });

  describe('cancel edit manual feefine', () => {
    beforeEach(async () => {
      await FeefinesInteractor.list.rows(0).editButton.click();
      await FeefinesInteractor.list.rows(0).feeTypeField.fillAndBlur('Changed value');
      await FeefinesInteractor.list.rows(0).defaultAmountField.fillAndBlur('300');
      await FeefinesInteractor.list.rows(0).actionNoticeField.selectAndBlur('Template 1');
      await FeefinesInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper values after cancel', () => {
      const firstRow = FeefinesInteractor.list.rows(0);

      expect(firstRow.cells(0).text).to.equal('Feefine 1');
      expect(firstRow.cells(1).text).to.equal('1000.00');
      expect(firstRow.cells(3).text).to.equal('-');
    });
  });

  describe('edit manual charge', () => {
    beforeEach(async () => {
      await FeefinesInteractor.list.rows(0).editButton.click();
      await FeefinesInteractor.list.rows(0).feeTypeField.fillAndBlur('Changed value');
      await FeefinesInteractor.list.rows(0).defaultAmountField.fillAndBlur('300');
      await FeefinesInteractor.list.rows(0).actionNoticeField.selectAndBlur('Template 1');
      await FeefinesInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after update', () => {
      const firstRow = FeefinesInteractor.list.rows(0);

      expect(firstRow.cells(0).text).to.equal('Changed value');
      expect(firstRow.cells(1).text).to.equal('300.00');
      expect(firstRow.cells(3).text).to.equal('Template 1');
    });
  });

  describe('create new manual feature', () => {
    beforeEach(async () => {
      await FeefinesInteractor.newManualFeeButton.click();
      await FeefinesInteractor.list.rows(0).feeTypeField.fillAndBlur('New feefine');
      await FeefinesInteractor.list.rows(0).defaultAmountField.fillAndBlur('100');
      await FeefinesInteractor.list.rows(0).actionNoticeField.selectAndBlur('Template 2');
      await FeefinesInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after update', () => {
      const lastRow = FeefinesInteractor.list.rows(1);

      expect(lastRow.cells(0).text).to.equal('New feefine');
      expect(lastRow.cells(1).text).to.equal('100.00');
      expect(lastRow.cells(3).text).to.equal('Template 2');
    });

    it('renders proper amount of rows', () => {
      expect(FeefinesInteractor.list.rowCount).to.equal(2);
    });
  });
});
