import { onClickViewAccountActionsHistory,
  onClickViewOpenAccounts,
  onClickViewClosedAccounts,
  onClickViewAllAccounts,
  onClickViewLoanActionsHistory,
  onClickViewChargeFeeFine } from './navigationHandlers';

describe('navigationHandlers functional component', () => {
  it('onClickViewAccountActionsHistory check', () => {
    const mockPush = jest.fn();
    const account = {
      id: 'test',
    };
    const history = {
      push : mockPush
    };
    const params = {
      id: '123'
    };
    const event = { };
    onClickViewAccountActionsHistory(event, account, history, params);
    expect(mockPush).toHaveBeenCalled();
  });
  it('onClickViewOpenAccounts check', () => {
    const mockPush = jest.fn();
    const loan = {
      id: 'test',
    };
    const history = {
      push : mockPush
    };
    const params = {
      id: '123'
    };
    const event = { };
    onClickViewOpenAccounts(event, loan, history, params);
    expect(mockPush).toHaveBeenCalled();
  });
  it('onClickViewClosedAccounts check', () => {
    const mockPush = jest.fn();
    const loan = {
      id: 'test',
    };
    const history = {
      push : mockPush
    };
    const params = {
      id: '123'
    };
    const event = { };
    onClickViewClosedAccounts(event, loan, history, params);
    expect(mockPush).toHaveBeenCalled();
  });
  it('onClickViewAllAccounts check', () => {
    const mockPush = jest.fn();
    const loan = {
      id: 'test',
    };
    const history = {
      push : mockPush
    };
    const params = {
      id: '123'
    };
    const event = { };
    onClickViewAllAccounts(event, loan, history, params);
    expect(mockPush).toHaveBeenCalled();
  });
  it('onClickViewLoanActionsHistory check', () => {
    const mockPush = jest.fn();
    const account = {
      id: 'test',
    };
    const history = {
      push : mockPush
    };
    const state = {
      name: 'test'
    };
    const params = {
      id: '123'
    };
    const event = { };
    onClickViewLoanActionsHistory(event, account, history, params, state);
    expect(mockPush).toHaveBeenCalled();
  });
  it('onClickViewChargeFeeFine check', () => {
    const mockPush = jest.fn();
    const history = {
      push : mockPush
    };
    const params = {
      id: '123'
    };
    const event = { };
    onClickViewChargeFeeFine(event, history, params);
    expect(mockPush).toHaveBeenCalled();
  });
});
