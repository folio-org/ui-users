import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import FeeFineInteractor from '../interactors/settings-feefine';

describe('Settings owners', () => {
  before(function () {
    setupApplication({ scenarios: ['settings-feefine'] });
  });

  beforeEach(async function () {
    await this.server.create('service-point', { name: 'None' });
    await this.visit('/settings/users/owners');
    await FeeFineInteractor.whenLoaded();
  });

  it('renders proper amount of columns', () => {
    expect(FeeFineInteractor.list.rows(0).cellCount).to.equal(4);
  });

  it('renders proper values for the first row', () => {
    const firstRow = FeeFineInteractor.list.rows(0);
    expect(firstRow.cells(0).text).to.equal('Main Admin0');
    expect(firstRow.cells(1).text).to.equal('Owner FyF');
  });

  it('first renders of proper amount of rows', () => {
    expect(FeeFineInteractor.list.rowCount).to.equal(5);
  }).timeout(4000);

  describe('is visible', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).deleteButton.click();
    });

    it('when delete button is clicked', () => {
      expect(FeeFineInteractor.confirmationModal.isPresent).to.be.true;
    });
  });

  describe('delete and cancel', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).deleteButton.click();
      await FeeFineInteractor.confirmationModal.cancelButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineInteractor.list.rowCount).to.equal(5);
    });
  });

  describe('delete and confirm', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).deleteButton.click();
      await FeeFineInteractor.confirmationModal.confirmButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineInteractor.list.rowCount).to.equal(4);
    });
  });

  describe('edit and cancel', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Main Admin1');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Main Admin1');
      await FeeFineInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper values after cancel', () => {
      const firstRow = FeeFineInteractor.list.rows(0);
      expect(firstRow.cells(0).text).to.equal('Main Admin0');
      expect(firstRow.cells(1).text).to.equal('Owner FyF');
    });
  });

  describe('edit and save', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Main Admin10');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Main Admin10');
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after save', () => {
      const firstRow = FeeFineInteractor.list.rows(1);
      expect(firstRow.cells(0).text).to.equal('Main Admin10');
      expect(firstRow.cells(1).text).to.equal('Main Admin10');
    });
  });


  describe('add a owner', () => {
    beforeEach(async () => {
      await FeeFineInteractor.newItemButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Main CUIB');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('CUIB');
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after save', () => {
      const firstRow = FeeFineInteractor.list.rows(2);
      expect(firstRow.cells(0).text).to.equal('Main Admin2');
      expect(firstRow.cells(1).text).to.equal('Owner CCH');
    });
  });

  describe('add an exist owner', () => {
    beforeEach(async () => {
      await FeeFineInteractor.newItemButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Main Admin0');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Owner FyF');
      await FeeFineInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineInteractor.list.rowCount).to.equal(5);
    });
  });

  describe('edit owner and select one service-point', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Main Admin10');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Main Admin10');
      await FeeFineInteractor.list.rows(0).sp.options(3).clickOption();
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders the control', () => {
      expect(FeeFineInteractor.list.rows(0).sp.controlPresent).to.be.true;
    });
  });

  describe('edit owner and select other service-point', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Main Admin10');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Main Admin10');
      await FeeFineInteractor.list.rows(0).sp.options(0).clickOption();
      await FeeFineInteractor.list.rows(0).sp.options(3).clickOption();
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders the control', () => {
      expect(FeeFineInteractor.list.rows(0).sp.controlPresent).to.be.true;
    });
  });

  describe('edit owner and select other service-point', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Main Admin10');
      await FeeFineInteractor.list.rows(0).textfield(0)
        .fillAndBlur('Main Admin10');
      await FeeFineInteractor.list.rows(0).sp.options(0).clickOption();
      await FeeFineInteractor.list.rows(0).saveButton.click();
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).sp.clickControl();
    });

    it('renders the control', () => {
      expect(FeeFineInteractor.list.rows(0).sp.controlPresent).to.be.true;
    });
  });

  describe('delete with feefine', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(2).deleteButton.click();
      await FeeFineInteractor.confirmationModal.confirmButton.click();
    });

    it('when delete button is clicked', () => {
      expect(FeeFineInteractor.hideItemModal).to.be.false;
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineInteractor.list.rowCount).to.equal(4);
    }).timeout(4000);
  });
});
