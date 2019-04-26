import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import Comments from '../interactors/settings-comment';

describe('Fee/fines comment required', () => {
  setupApplication({ scenarios: ['comments'] });

  beforeEach(async function () {
    await this.visit('/settings/users/comments');
    await Comments.whenLoaded();
  });

  it('displays the title in the pane header', () => {
    expect(Comments.commentRequiredTitle).to.equal('Fee/fine: Comment required');
  });

  it('displays the labels', () => {
    expect(Comments.data(0).text).to.equal('Require comment when fee/fine fully/partially paid');
  });
  it('displays the labels', () => {
    expect(Comments.data(1).text).to.equal('Require comment when fee/fine fully/partially waived');
  });
  it('displays the labels', () => {
    expect(Comments.data(2).text).to.equal('Require comment when fee/fine fully/partially refunded');
  });
  it('displays the labels', () => {
    expect(Comments.data(3).text).to.equal('Require comment when fee/fine fully/partially transferred');
  });

  describe('Fee/fines comment required', () => {
    beforeEach(async function () {
      await Comments.pay.selectAndBlur('No')
        .waive.selectAndBlur('Yes')
        .refund.selectAndBlur('Yes')
        .transfer.selectAndBlur('No')
        .save();
    });

    it('expected value for pay', () => {
      expect(Comments.pay.val).to.equal('false');
      expect(Comments.waive.val).to.equal('true');
      expect(Comments.refund.val).to.equal('true');
      expect(Comments.transfer.val).to.equal('false');
    });
  });
});
