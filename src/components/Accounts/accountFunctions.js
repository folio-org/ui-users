import {
  paymentStatusesAllowedToRefund,
  waiveStatuses,
} from '../../constants';

export function count(array) {
  const list = [];
  const countList = [];
  const result = [];
  array.forEach((a) => {
    const index = list.indexOf(a);
    if (index === -1) {
      list.push(a);
      countList.push(1);
    } else {
      countList[index]++;
    }
  });
  for (let i = 0; i < list.length; i++) {
    if (list[i] !== undefined) {
      result.push({ name: list[i], size: countList[i] });
    }
  }
  return result;
}

export function handleFilterChange(e, param) {
  const state = this.filterState(this.queryParam(param));
  state[e.target.name] = e.target.checked;
  this.transitionToParams({ [param]: Object.keys(state).filter(key => state[key]).join(',') });
  return state;
}

export function handleFilterClear(name) {
  const state = this.filterState(this.queryParam('f'));

  Object.keys(state).forEach((key) => {
    if (key.startsWith(`${name}.`)) {
      state[key] = false;
    }
  });

  this.transitionToParams({ f: Object.keys(state).filter(key => state[key]).join(',') });
  return state;
}

function getPaidActions(feeFineActions = []) {
  return feeFineActions.filter(({ typeAction }) => paymentStatusesAllowedToRefund.includes(typeAction));
}

function getWaiveActions(feeFineActions = []) {
  return feeFineActions.filter(({ typeAction }) => waiveStatuses.includes(typeAction));
}

export function calculateSelectedAmount(accounts, isRefundAction = false, feeFineActions = []) {
  const selected = accounts.reduce((s, { amount, remaining }) => {
    if (isRefundAction) {
      const waiveActions = getWaiveActions(feeFineActions);
      const waivedAmount = waiveActions.reduce((a, { amountAction }) => {
        return a + parseFloat(amountAction * 100);
      }, 0);

      return s + parseFloat((amount - remaining) * 100) - waivedAmount;
    } else {
      return s + parseFloat(remaining * 100);
    }
  }, 0);

  return parseFloat(selected / 100).toFixed(2);
}

export function calculateRefundSelectedAmount(feeFineActions) {
  const paidActions = getPaidActions(feeFineActions);
  const selected = paidActions.reduce((s, { amountAction }) => {
    return s + parseFloat((amountAction) * 100);
  }, 0);

  return parseFloat(selected / 100).toFixed(2);
}

export function calculateRemainingAmount(amount, balance, selected, action) {
  return action === 'refund'
    ? parseFloat(selected - amount).toFixed(2)
    : amount > 0 ? parseFloat(balance - amount).toFixed(2) : parseFloat(balance).toFixed(2);
}

export function loadServicePoints(values) {
  const servicePoint = values.defaultServicePointId;
  const servicePoints = values.servicePointsIds;
  const owners = values.owners || [];
  let ownerId = null;
  if (servicePoint && servicePoint !== '-') {
    owners.forEach(o => {
      if (o.servicePointOwner && o.servicePointOwner.find(s => s.value === servicePoint)) {
        ownerId = o.id;
      }
    });
  } else if (servicePoints.length === 1) {
    const sp = servicePoints[0];
    owners.forEach(o => {
      if (o.servicePointOwner && o.servicePointOwner.find(s => s.value === sp)) {
        ownerId = o.id;
      }
    });
  } else if (servicePoints.length === 2) {
    const sp1 = servicePoints[0];
    const sp2 = servicePoints[1];
    owners.forEach(o => {
      if (o.servicePointOwner && o.servicePointOwner.find(s => s.value === sp1) && o.servicePointOwner.find(s => s.value === sp2)) {
        ownerId = o.id;
      }
    });
  }
  return ownerId;
}

export function accountRefundInfo(account) {
  const hasBeenPaid = paymentStatusesAllowedToRefund.includes(account?.paymentStatus?.name);
  const paidAmount = (parseFloat(account.amount - account.remaining) * 100) / 100;

  return { hasBeenPaid, paidAmount };
}

// export function isRefundAllowed(account) {
//   const { hasBeenPaid, paidAmount } = accountRefundInfo(account);
//   return hasBeenPaid && paidAmount > 0;
// }

export function isRefundAllowed() {
  return false;
}

export function calculateTotalPaymentAmount(accounts = []) {
  return accounts.reduce((amount, account) => {
    const { hasBeenPaid, paidAmount } = accountRefundInfo(account);
    return hasBeenPaid ? amount + paidAmount : amount;
  }, 0);
}

export function calculateOwedFeeFines(accounts = []) {
  return accounts.reduce((owed, account) => {
    return account?.status?.name === 'Open' ? parseFloat(owed + account.remaining) : owed;
  }, 0);
}

export function isCancelAllowed(account) {
  return account.paymentStatus.name === 'Outstanding';
}
