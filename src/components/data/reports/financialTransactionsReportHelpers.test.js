import {
  getPatronBarcodeHyperlink,
  getItemBarcodeHyperlink,
  getLoanPolicyHyperlink,
  getOverduePolicyHyperlink,
  getLostItemPolicyHyperlink,
  getLoanDetailsHyperlink,
  EMPTY_HYPERLINK_VALUE,
} from './financialTransactionsReportHelpers';

describe('financial transactions report helpers', () => {
  const origin = 'test';
  const emptyOrigin = '';

  describe('patron barcode hyperlink', () => {
    const emptyBarcodeValue = 'emptyBarcodeValue';
    const row = {
      patronId: 'patronId',
      patronBarcode: 'patronBarcode',
    };

    it('should get hyperlink when all the necessary present', () => {
      expect(getPatronBarcodeHyperlink(origin, row, emptyBarcodeValue))
        .toBe('=HYPERLINK("test/users/preview/patronId", "patronBarcode")');
    });

    it('should get empty hyperlink when absent origin', () => {
      expect(getPatronBarcodeHyperlink(emptyOrigin, row, emptyBarcodeValue)).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent patronId', () => {
      expect(getPatronBarcodeHyperlink(origin, {
        ...row,
        patronId: '',
      },
      emptyBarcodeValue)).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get hyperlink with noBarcode value when absent patronBarcode', () => {
      expect(getPatronBarcodeHyperlink(origin, {
        ...row,
        patronBarcode: '',
      },
      emptyBarcodeValue)).toBe(`=HYPERLINK("test/users/preview/patronId", "${emptyBarcodeValue}")`);
    });
  });

  describe('item barcode hyperlink', () => {
    const row = {
      instanceId: 'id',
      holdingsRecordId: 'holdingsRecordId',
      itemId: 'itemId',
      itemBarcode: 'itemBarcode',
    };

    it('should get hyperlink when all the necessary present', () => {
      expect(getItemBarcodeHyperlink(origin, row))
        .toBe('=HYPERLINK("test/inventory/view/id/holdingsRecordId/itemId", "itemBarcode")');
    });

    it('should get empty hyperlink when absent origin', () => {
      expect(getItemBarcodeHyperlink(emptyOrigin, row)).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent instanceId', () => {
      expect(getItemBarcodeHyperlink(origin, {
        ...row,
        instanceId: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent holdingsRecordId', () => {
      expect(getItemBarcodeHyperlink(origin, {
        ...row,
        holdingsRecordId: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent itemId', () => {
      expect(getItemBarcodeHyperlink(origin, {
        ...row,
        itemId: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent itemBarcode', () => {
      expect(getItemBarcodeHyperlink(origin, {
        ...row,
        itemBarcode: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });
  });

  describe('loan policy hyperlink', () => {
    const row = {
      loanPolicyId: 'loanPolicyId',
      loanPolicyName: 'loanPolicyName',
    };

    it('should get hyperlink when all the necessary present', () => {
      expect(getLoanPolicyHyperlink(origin, row))
        .toBe('=HYPERLINK("test/settings/circulation/loan-policies/loanPolicyId", "loanPolicyName")');
    });

    it('should get empty hyperlink when absent origin', () => {
      expect(getLoanPolicyHyperlink(emptyOrigin, row)).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent loanPolicyId', () => {
      expect(getLoanPolicyHyperlink(origin, {
        ...row,
        loanPolicyId: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent loanPolicyName', () => {
      expect(getLoanPolicyHyperlink(origin, {
        ...row,
        loanPolicyName: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });
  });

  describe('overdue policy hyperlink', () => {
    const row = {
      overdueFinePolicyId: 'overdueFinePolicyId',
      overdueFinePolicyName: 'overdueFinePolicyName',
    };

    it('should get hyperlink when all the necessary present', () => {
      expect(getOverduePolicyHyperlink(origin, row))
        .toBe('=HYPERLINK("test/settings/circulation/fine-policies/overdueFinePolicyId", "overdueFinePolicyName")');
    });

    it('should get empty hyperlink when absent origin', () => {
      expect(getOverduePolicyHyperlink(emptyOrigin, row)).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent overdueFinePolicyId', () => {
      expect(getOverduePolicyHyperlink(origin, {
        ...row,
        overdueFinePolicyId: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent overdueFinePolicyName', () => {
      expect(getOverduePolicyHyperlink(origin, {
        ...row,
        overdueFinePolicyName: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });
  });

  describe('lost item policy hyperlink', () => {
    const row = {
      lostItemPolicyId: 'lostItemPolicyId',
      lostItemPolicyName: 'lostItemPolicyName',
    };

    it('should get hyperlink when all the necessary present', () => {
      expect(getLostItemPolicyHyperlink(origin, row))
        .toBe('=HYPERLINK("test/settings/circulation/lost-item-fee-policy/lostItemPolicyId", "lostItemPolicyName")');
    });

    it('should get empty hyperlink when absent origin', () => {
      expect(getLostItemPolicyHyperlink(emptyOrigin, row)).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent lostItemPolicyId', () => {
      expect(getLostItemPolicyHyperlink(origin, {
        ...row,
        lostItemPolicyId: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent lostItemPolicyName', () => {
      expect(getLostItemPolicyHyperlink(origin, {
        ...row,
        lostItemPolicyName: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });
  });

  describe('loan details hyperlink', () => {
    const row = {
      patronId: 'patronId',
      loanId: 'loanId',
    };

    it('should get hyperlink when all the necessary present', () => {
      expect(getLoanDetailsHyperlink(origin, row)).toBe('=HYPERLINK("test/users/patronId/loans/view/loanId", "loanId")');
    });

    it('should get empty hyperlink when absent origin', () => {
      expect(getLoanDetailsHyperlink(emptyOrigin, row)).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent patronId', () => {
      expect(getLoanDetailsHyperlink(origin, {
        ...row,
        patronId: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });

    it('should get empty hyperlink when absent loanId', () => {
      expect(getLoanDetailsHyperlink(origin, {
        ...row,
        loanId: '',
      })).toBe(EMPTY_HYPERLINK_VALUE);
    });
  });
});
