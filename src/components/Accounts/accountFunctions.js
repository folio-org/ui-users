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

export function calculateSelectedAmount(accounts) {
  const selected = accounts.reduce((s, { remaining }) => {
    return s + parseFloat(remaining * 100);
  }, 0);
  return parseFloat(selected / 100).toFixed(2);
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
