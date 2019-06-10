export function onClickViewAccountActionsHistory(e, account, history, params) {
  history.push(`/users/${params.id}/accounts/view/${account.id}`);
}

export function onClickViewOpenAccounts(e, loan, history, params) {
  history.push(`/users/${params.id}/accounts/open?loan=${loan.id}`);
}

export function onClickViewClosedAccounts(e, loan, history, params) {
  history.push(`/users/${params.id}/accounts/closed?loan=${loan.id}`);
}

export function onClickViewAllAccounts(e, loan, history, params) {
  history.push(`/users/${params.id}/accounts/all?loan=${loan.id}`);
}

export function onClickViewLoanActionsHistory(e, loan, history, params) {
  history.push(`/users/${params.id}/loans/view/${loan.id}`);
}

export function onClickViewChargeFeeFine(e, history, params) {
  history.push(`/users/${params.id}/charge`);
}

export function onClickChargeFineToLoan(e, loan, history, params) {
  history.push(`/users/${params.id}/charge?loan=${loan.id}`);
}
