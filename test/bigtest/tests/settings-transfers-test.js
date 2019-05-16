import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import TransferInteractor from '../interactors/settings-transfers';
import setupApplication from '../helpers/setup-application';

describe('Settings transfers', () => {
  setupApplication({ scenarios: ['settings-feefine'] });
  beforeEach(async function () {
    this.visit('/settings/users/transfers');
    await TransferInteractor.activeSelector('Main Admin1');
    await TransferInteractor.whenLoaded();
  });

  it('renders proper amount of rows', () => {
    expect(TransferInteractor.list.rowCount).to.equal(2);
  });

  it('renders proper amount of columns', () => {
    expect(TransferInteractor.list.rows(0).cellCount).to.equal(4);
  });

  it('renders proper values for the first row', () => {
    const firstRow = TransferInteractor.list.rows(0);
    expect(firstRow.cells(0).text).to.equal('USA Bank0');
    expect(firstRow.cells(1).text).to.equal('Transfer place0');
  });

  describe('is visible', () => {
    beforeEach(async () => {
      await TransferInteractor.activeSelector('Main Admin1');
      await TransferInteractor.list.rows(0).deleteButton.click();
    });

    it('when delete button is clicked', () => {
      expect(TransferInteractor.confirmationModal.isPresent).to.be.true;
    });
  });

  describe('confirmation modal disappears', () => {
    beforeEach(async () => {
      await TransferInteractor.activeSelector('Main Admin1');
      await TransferInteractor.list.rows(0).deleteButton.click();
      await TransferInteractor.confirmationModal.cancelButton.click();
    });

    it('when cancel button is clicked ', () => {
      expect(TransferInteractor.confirmationModal.isPresent).to.be.false;
    });
  });

  describe('upon click on confirm button initiates the deletion process', () => {
    beforeEach(async () => {
      await TransferInteractor.activeSelector('Main Admin1');
      await TransferInteractor.list.rows(0).deleteButton.click();
      await TransferInteractor.confirmationModal.confirmButton.click();
      await TransferInteractor.whenLoaded();
    });

    it('confirmation modal disappears', () => {
      expect(TransferInteractor.confirmationModal.isPresent).to.be.false;
    });

    it('the successful toast appears', () => {
      expect(TransferInteractor.callout.successCalloutIsPresent).to.be.true;
    });

    it('renders empty message', () => {
      expect(TransferInteractor.list.rowCount).to.equal(1);
    });
  });

  describe('cancel edit transfers', () => {
    beforeEach(async () => {
      await TransferInteractor.activeSelector('Main Admin1');
      await TransferInteractor.list.rows(0).editButton.click();
      await TransferInteractor.list.rows(0).fillTransferName.fillAndBlur('USA Bank3');
      await TransferInteractor.list.rows(0).description.fillAndBlur('Transfer place3');
      await TransferInteractor.list.rows(0).cancelButton.click();
      await TransferInteractor.whenLoaded();
    });

    it('renders proper values after cancel', () => {
      const firstRow = TransferInteractor.list.rows(0);
      expect(firstRow.cells(0).text).to.equal('USA Bank0');
      expect(firstRow.cells(1).text).to.equal('Transfer place0');
    });
  });

  describe('edit transfers', () => {
    beforeEach(async () => {
      await TransferInteractor.activeSelector('Main Admin1');
      await TransferInteractor.list.rows(0).editButton.click();
      await TransferInteractor.list.rows(0).fillTransferName.fillAndBlur('USA Bank11');
      await TransferInteractor.list.rows(0).description.fillAndBlur('Transfer place11');
      await TransferInteractor.list.rows(0).saveButton.click();
      await TransferInteractor.whenLoaded();
    });

    it('renders proper values after edit', () => {
      const firstRow = TransferInteractor.list.rows(0);
      expect(firstRow.cells(0).text).to.equal('USA Bank11');
      expect(firstRow.cells(1).text).to.equal('Transfer place11');
    });
  });

  describe('add a transfers', () => {
    beforeEach(async () => {
      await TransferInteractor.activeSelector('Main Admin2');
      await TransferInteractor.newTransfersButton.click();
      await TransferInteractor.list.rows(0).fillTransferName.fillAndBlur('USA Bank10');
      await TransferInteractor.list.rows(0).description.fillAndBlur('Transfer place10');
      await TransferInteractor.list.rows(0).saveButton.click();
      await TransferInteractor.whenLoaded();
    });

    it('renders proper values after add', () => {
      const firstRow = TransferInteractor.list.rows(3);
      expect(firstRow.cells(0).text).to.equal('USA Bank10');
      expect(firstRow.cells(1).text).to.equal('Transfer place10');
    });
  });

  describe('add an exist transfer', () => {
    beforeEach(async () => {
      await TransferInteractor.activeSelector('Main Admin1');
      await TransferInteractor.whenLoaded();
      await TransferInteractor.newTransfersButton.click();
      await TransferInteractor.list.rows(0).fillTransferName.fillAndBlur('USA Bank0');
      await TransferInteractor.list.rows(0).description.fillAndBlur('Transfer place0');
      await TransferInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(TransferInteractor.list.rowCount).to.equal(2);
    });
  });
});
