import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import OwnerInteractor from '../interactors/settings-owners';
import MultiSelectionInteractor from '@folio/stripes-components/lib/MultiSelection/tests/interactor'; // eslint-disable-line

describe('Test the number of rows', () => {
  setupApplication({ scenarios: ['payments'] });
  const multiselection = new MultiSelectionInteractor('#owner-service-point');

  beforeEach(async function () {
    await this.server.create('service-point', { name: 'None' });
    await this.visit('/settings/users/owners');
    await OwnerInteractor.whenLoaded();
  });

  it('renders proper amount of columns', () => {
    expect(OwnerInteractor.list.rows(0).cellCount).to.equal(4);
  });

  it('renders proper values for the first row', () => {
    const firstRow = OwnerInteractor.list.rows(0);
    expect(firstRow.cells(0).text).to.equal('Main Admin0');
    expect(firstRow.cells(1).text).to.equal('Owner FyF');
  });

  it('first renders of proper amount of rows', () => {
    expect(OwnerInteractor.list.rowCount).to.equal(5);
  });

  describe('is visible', () => {
    beforeEach(async () => {
      await OwnerInteractor.list.rows(0).deleteButton.click();
    });

    it('when delete button is clicked', () => {
      expect(OwnerInteractor.confirmationModal.isPresent).to.be.true;
    });
  });

  describe('delete and cancel', () => {
    beforeEach(async () => {
      await OwnerInteractor.list.rows(0).deleteButton.click();
      await OwnerInteractor.confirmationModal.cancelButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(OwnerInteractor.list.rowCount).to.equal(5);
    });
  });

  describe('delete and confirm', () => {
    beforeEach(async () => {
      await OwnerInteractor.list.rows(0).deleteButton.click();
      await OwnerInteractor.confirmationModal.confirmButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(OwnerInteractor.list.rowCount).to.equal(4);
    });
  });

  describe('cancel edit transfers', () => {
    beforeEach(async () => {
      await OwnerInteractor.list.rows(0).editButton.click();
      await OwnerInteractor.list.rows(0).fillOwnerName.fillAndBlur('Main Admin1');
      await OwnerInteractor.list.rows(0).description.fillAndBlur('Main Admin1');
      await OwnerInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper values after cancel', () => {
      const firstRow = OwnerInteractor.list.rows(0);
      expect(firstRow.cells(0).text).to.equal('Main Admin0');
      expect(firstRow.cells(1).text).to.equal('Owner FyF');
    });
  });

  describe('save edit owner', () => {
    beforeEach(async () => {
      await OwnerInteractor.list.rows(0).editButton.click();
      await OwnerInteractor.list.rows(0).fillOwnerName.fillAndBlur('Main Admin10');
      await OwnerInteractor.list.rows(0).description.fillAndBlur('Main Admin10');
      await OwnerInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after save', () => {
      const firstRow = OwnerInteractor.list.rows(0);
      expect(firstRow.cells(0).text).to.equal('Main Admin10');
      expect(firstRow.cells(1).text).to.equal('Main Admin10');
    });
  });

  describe('add a owner', () => {
    beforeEach(async () => {
      await OwnerInteractor.newOwnerButton.click();
      await OwnerInteractor.list.rows(0).fillOwnerName.fillAndBlur('Main CUIB');
      await OwnerInteractor.list.rows(0).description.fillAndBlur('CUIB');
      await OwnerInteractor.list.rows(0).saveButton.click();
    });

    it('renders proper values after save', () => {
      const firstRow = OwnerInteractor.list.rows(4);
      expect(firstRow.cells(0).text).to.equal('Main Admin3');
      expect(firstRow.cells(1).text).to.equal('Owner DGB');
    });
  });

  describe('add an exist owner', () => {
    beforeEach(async () => {
      await OwnerInteractor.newOwnerButton.click();
      await OwnerInteractor.list.rows(0).fillOwnerName.fillAndBlur('Main Admin0');
      await OwnerInteractor.list.rows(0).description.fillAndBlur('Owner FyF');
      await OwnerInteractor.list.rows(0).cancelButton.click();
    });

    it('renders proper amount of rows', () => {
      expect(OwnerInteractor.list.rowCount).to.equal(5);
    });
  });

  // select section
  describe('edit owner and select one service-point', () => {
    beforeEach(async () => {
      await OwnerInteractor.list.rows(0).editButton.click();
      await OwnerInteractor.list.rows(0).fillOwnerName.fillAndBlur('Main Admin10');
      await OwnerInteractor.list.rows(0).description.fillAndBlur('Main Admin10');
      await OwnerInteractor.list.rows(0).sp.options(3).clickOption();
      await OwnerInteractor.list.rows(0).saveButton.click();
    });

    it('renders the control', () => {
      expect(multiselection.controlPresent).to.be.true;
    });
  });

  describe('edit owner and select other service-point', () => {
    beforeEach(async () => {
      await OwnerInteractor.list.rows(0).editButton.click();
      await OwnerInteractor.list.rows(0).fillOwnerName.fillAndBlur('Main Admin10');
      await OwnerInteractor.list.rows(0).description.fillAndBlur('Main Admin10');
      await OwnerInteractor.list.rows(0).sp.options(0).clickOption();
      await OwnerInteractor.list.rows(0).sp.options(3).clickOption();
      await OwnerInteractor.list.rows(0).saveButton.click();
    });

    it('renders the control', () => {
      expect(multiselection.controlPresent).to.be.true;
    });
  });

  describe('edit owner and select other service-point', () => {
    beforeEach(async () => {
      await OwnerInteractor.list.rows(0).editButton.click();
      await OwnerInteractor.list.rows(0).fillOwnerName.fillAndBlur('Main Admin10');
      await OwnerInteractor.list.rows(0).description.fillAndBlur('Main Admin10');
      await OwnerInteractor.list.rows(0).sp.options(0).clickOption();
      await OwnerInteractor.list.rows(0).saveButton.click();
      await OwnerInteractor.list.rows(0).editButton.click();
      await OwnerInteractor.list.rows(0).sp.clickControl();
    });

    it('renders the control', () => {
      expect(multiselection.controlPresent).to.be.true;
    });
  });

  describe('delete with feefine', () => {
    beforeEach(async () => {
      await OwnerInteractor.list.rows(4).deleteButton.click();
      await OwnerInteractor.confirmationModal.confirmButton.click();
    });

    it('when delete button is clicked', () => {
      expect(OwnerInteractor.hideItemModal).to.be.false;
    });

    describe('delete with feefine hide', () => {
      beforeEach(async () => {
        await OwnerInteractor.itemInUseModal.accept.click();
      });

      it('when delete button is clicked', () => {
        expect(OwnerInteractor.hideItemModal).to.be.false;
      });
    });
  });
});
