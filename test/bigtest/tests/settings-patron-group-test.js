import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';

import PatronGroupInteractor from '../interactors/settings-patron-groups';

describe('Patron group settings', () => {
  setupApplication();

  const interactor = new PatronGroupInteractor();

  beforeEach(async function () {
    this.visit('settings/users/groups');
    await interactor.whenLoaded();
  });

  it('patron group list has more than 0 item', () => {
    expect(interactor.groupList.rowCount).to.be.greaterThan(0);
  });

  describe('click edit first row', () => {
    beforeEach(async function () {
      await interactor.firstRow.clickEdit();
    });

    describe('enter invalid expiration offset (negative number)', () => {
      beforeEach(async function () {
        await interactor.firstRow.expirationOffset.fillAndBlur(-1);
      });

      it('expect validation error', () => {
        expect(interactor.firstRow.isFeedbackErrorPresent).to.be.true;
        expect(interactor.firstRow.feedbackError).to.equal(
          'Must be empty or an integer > 0'
        );
        expect(interactor.firstRow.submitButtonIsDisabled).to.be.true;
      });
    });

    describe('enter invalid expiration offset (zero)', () => {
      beforeEach(async function () {
        await interactor.firstRow.expirationOffset.fillAndBlur(0);
      });

      it('expect validation error', () => {
        expect(interactor.firstRow.isFeedbackErrorPresent).to.be.true;
        expect(interactor.firstRow.feedbackError).to.equal(
          'Must be empty or an integer > 0'
        );
        expect(interactor.firstRow.submitButtonIsDisabled).to.be.true;
      });
    });

    describe('enter invalid expiration offset (string)', () => {
      beforeEach(async function () {
        await interactor.firstRow.expirationOffset.fillAndBlur('foobar');
      });

      it('expect validation error', () => {
        expect(interactor.firstRow.isFeedbackErrorPresent).to.be.true;
        expect(interactor.firstRow.feedbackError).to.equal(
          'Must be empty or an integer > 0'
        );
        expect(interactor.firstRow.submitButtonIsDisabled).to.be.true;
      });
    });

    describe('enter invalid expiration offset (decimal number)', () => {
      beforeEach(async function () {
        await interactor.firstRow.expirationOffset.fillAndBlur('5.5');
      });

      it('expect validation error', () => {
        expect(interactor.firstRow.isFeedbackErrorPresent).to.be.true;
        expect(interactor.firstRow.feedbackError).to.equal(
          'Must be empty or an integer > 0'
        );
        expect(interactor.firstRow.submitButtonIsDisabled).to.be.true;
      });
    });

    describe('enter valid expiration offset', () => {
      beforeEach(async function () {
        await interactor.firstRow.expirationOffset.fillAndBlur(365);
      });

      it('expect no validation error', () => {
        expect(interactor.firstRow.isFeedbackErrorPresent).to.be.false;
        expect(interactor.firstRow.submitButtonIsDisabled).to.be.false;
      });
    });

    describe('clear expiration offset', () => {
      beforeEach(async function () {
        await interactor.firstRow.expirationOffset.fillAndBlur(null);
      });

      it('expect no validation error', () => {
        expect(interactor.firstRow.isFeedbackErrorPresent).to.be.false;
      });
    });
  });
});
