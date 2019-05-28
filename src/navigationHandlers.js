import packageInfo from '../package';

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

export function onClickViewChargeFeeFine(e, loan, history, params) {
  history.push(`/users/${params.id}/chargefee?loan=${loan.id}`);
}

export function onCloseLoanDetails(e, loan, history, params) {
  const loanStatus = loan.status ? loan.status.name.toLowerCase() : 'open';
  history.push(`/users/${params.id}/loans/${loanStatus}`);
}

export function onCloseLoans(e, history, params) {
  history.push(`users/view/${params.id}`);
}

export function goToReferrer(
  location,
  history,
  goHome = () => { history.replace(packageInfo.stripes.home); }
) {
  if (!location.state) { // regular back button
    // goes back to outside modules.
    history.goBack();
  } else if (location.state && location.state.referrer === 'home') {
    goHome();
    // for non-linear paths/multiple entry points.
  } else if (location.state && location.state.referrer) {
    history.push(location.state.referrer);
  }
}
