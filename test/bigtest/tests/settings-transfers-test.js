import { expect } from 'chai';

import {
  before,
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import FeeFineInteractor from '../interactors/settings-feefine';

describe('Settings transfers', () => {
  before(function () {
    setupApplication({ scenarios: ['settings-feefine'] });
  });

  beforeEach(async function () {
    this.visit('/settings/users/transfers');
    await FeeFineInteractor.ownerSelect.selectAndBlur('Main Admin1');
  });

  it('renders proper amount of rows', () => {
    expect(FeeFineInteractor.list.rowCount).to.equal(2);
  });

  it('renders proper amount of columns', () => {
    expect(FeeFineInteractor.list.rows(0).cellCount).to.equal(4);
  });

  it('renders proper values for the first row', () => {
    const firstRow = FeeFineInteractor.list.rows(0);
    expect(firstRow.cells(0).text).to.equal('USA Bank0');
    expect(firstRow.cells(1).text).to.equal('Transfer place0');
  });

  describe('delete and cancel', () => {
    beforeEach(async () => {
      await FeeFineInteractor.ownerSelect.selectAndBlur('Main Admin1');
      await FeeFineInteractor.list.rows(0).deleteButton.click();
      await FeeFineInteractor.confirmationModal.cancelButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineInteractor.list.rowCount).to.equal(2);
    });
  });

  describe('delete and confirm', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).deleteButton.click();
      await FeeFineInteractor.confirmationModal.confirmButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineInteractor.list.rowCount).to.equal(1);
    });
  });

  describe('edit and cancel', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('USA Bank3');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Transfer place3');
      await FeeFineInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper values after cancel', () => {
      const firstRow = FeeFineInteractor.list.rows(0);
      expect(firstRow.cells(0).text).to.equal('USA Bank0');
      expect(firstRow.cells(1).text).to.equal('Transfer place0');
    });
  });

  describe('edit and save', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('USA Bank11');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Transfer place11');
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after edit', () => {
      const firstRow = FeeFineInteractor.list.rows(0);
      expect(firstRow.cells(0).text).to.equal('USA Bank11');
      expect(firstRow.cells(1).text).to.equal('Transfer place11');
    });
  });

  describe('add a transfers', () => {
    beforeEach(async () => {
      await FeeFineInteractor.newItemButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('USA Bank10');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Transfer place10');
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after add', () => {
      const firstRow = FeeFineInteractor.list.rows(2);
      expect(firstRow.cells(0).text).to.equal('USA Bank10');
      expect(firstRow.cells(1).text).to.equal('Transfer place10');
    });
  });

  describe('add an exist transfer', () => {
    beforeEach(async () => {
      await FeeFineInteractor.newItemButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('USA Bank0');
      await FeeFineInteractor.list.rows(0).textfield(1).fillAndBlur('Transfer place0');
      await FeeFineInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineInteractor.list.rowCount).to.equal(2);
    });
  });
});
