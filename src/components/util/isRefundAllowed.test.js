import isRefundAllowed from './isRefundAllowed';
import {
  accountRefundInfo,
  calculateSelectedAmount,
} from '../Accounts/accountFunctions';

jest.mock('../Accounts/accountFunctions', () => ({
  accountRefundInfo: jest.fn(() => ({
    hasBeenPaid: true,
    paidAmount: 100,
  })),
  calculateSelectedAmount: jest.fn(() => 100),
}));

describe('isRefundAllowed', () => {
  const mockedAccount = {
    id: 'testId',
  };
  const mockedActions = [{
    action: 'testAction',
  }];

  it('should correctly pass props in the inner functions', () => {
    isRefundAllowed(mockedAccount, mockedActions);

    expect(accountRefundInfo).toHaveBeenCalledWith(mockedAccount, mockedActions);
    expect(calculateSelectedAmount).toHaveBeenCalledWith([mockedAccount], true, mockedActions);
  });

  it('should return "true" if "paidAmount" and "calculateSelectedAmount" more than 0, and "hasBeenPaid" is true', () => {
    expect(isRefundAllowed(mockedAccount, mockedActions)).toBe(true);
  });

  it('should return "false" if "paidAmount" and "calculateSelectedAmount" more than 0, and "hasBeenPaid" is false', () => {
    accountRefundInfo.mockReturnValueOnce({
      hasBeenPaid: false,
      paidAmount: 100,
    });

    expect(isRefundAllowed(mockedAccount, mockedActions)).toBe(false);
  });

  it('should return "false" if "paidAmount" less or equal 0, "calculateSelectedAmount" more than 0, and "hasBeenPaid" is true', () => {
    accountRefundInfo.mockReturnValueOnce({
      hasBeenPaid: true,
      paidAmount: 0,
    });

    expect(isRefundAllowed(mockedAccount, mockedActions)).toBe(false);
  });

  it('should return "false" if "paidAmount" more than 0, "calculateSelectedAmount" less or equal 0, and "hasBeenPaid" is true', () => {
    calculateSelectedAmount.mockReturnValueOnce(0);

    expect(isRefundAllowed(mockedAccount, mockedActions)).toBe(false);
  });
});
