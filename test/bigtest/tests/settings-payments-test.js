import { expect } from 'chai';

import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import FeeFineInteractor from '../interactors/settings-feefine';

describe('Settings payments', () => {
  beforeEach(async function () {
    setupApplication({ scenarios: ['settings-feefine'] });

    this.visit('/settings/users/payments');
    await FeeFineInteractor.ownerSelect.selectAndBlur('Main Admin1');
  });

  it('renders proper amount of rows', () => {
    expect(FeeFineInteractor.list.rowCount).to.equal(5);
  });

  it('renders proper amount of columns', () => {
    expect(FeeFineInteractor.list.rows(0).cellCount).to.equal(4);
  });

  it('renders proper values for the first row', () => {
    const firstRow = FeeFineInteractor.list.rows(0);
    expect(firstRow.cells(0).text).to.equal('Cash0');
    expect(firstRow.cells(1).text).to.equal('No');
  });

  describe('delete and cancel', () => {
    beforeEach(async () => {
      await FeeFineInteractor.ownerSelect.selectAndBlur('Main Admin1');
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
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Cash3');
      await FeeFineInteractor.list.rows(0).select(0).selectAndBlur('Yes');
      await FeeFineInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper values after cancel', () => {
      const firstRow = FeeFineInteractor.list.rows(0);
      expect(firstRow.cells(0).text).to.equal('Cash0');
      expect(firstRow.cells(1).text).to.equal('No');
    });
  });

  describe('edit and save', () => {
    beforeEach(async () => {
      await FeeFineInteractor.list.rows(0).editButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Cash11');
      await FeeFineInteractor.list.rows(0).select(0).selectAndBlur('Yes');
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after edit', () => {
      const firstRow = FeeFineInteractor.list.rows(0);
      expect(firstRow.cells(0).text).to.equal('Cash11');
      expect(firstRow.cells(1).text).to.equal('Yes');
    });
  });

  describe('add a payment', () => {
    beforeEach(async () => {
      await FeeFineInteractor.newItemButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Cash10');
      await FeeFineInteractor.list.rows(0).select(0).selectAndBlur('Yes');
      await FeeFineInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after add', () => {
      const firstRow = FeeFineInteractor.list.rows(5);
      expect(firstRow.cells(0).text).to.equal('Cash10');
      expect(firstRow.cells(1).text).to.equal('Yes');
    });
  });

  describe('add an exist payment', () => {
    beforeEach(async () => {
      await FeeFineInteractor.newItemButton.click();
      await FeeFineInteractor.list.rows(0).textfield(0).fillAndBlur('Cash0');
      await FeeFineInteractor.list.rows(0).select(0).selectAndBlur('Yes');
      await FeeFineInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(FeeFineInteractor.list.rowCount).to.equal(5);
    });
  });
});
