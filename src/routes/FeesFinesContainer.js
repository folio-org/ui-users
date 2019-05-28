import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import {
  stripesConnect,
  withStripes,
} from '@folio/stripes/core';

import { ChargeFeeFine } from '../components/Accounts';

class FeeFinesContainer extends React.Component {
  static manifest = Object.freeze({
    selUser: {
      type: 'okapi',
      path: 'users/:{id}',
      clear: false,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
    },
    loan: {
      type: 'okapi',
      path: 'loan-storage/loans/?{loan}',
      clear: false,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
    },
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=:{id}) sortby id&limit=100',
      permissionsRequired: 'circulation.loans.collection.get',
    },
    curUserServicePoint: {
      type: 'okapi',
      path: 'service-points-users?query=(userId==!{currentUser.id})',
      records: 'servicePointsUsers',
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items?query=barcode=%{activeRecord.barcode}*',
    },
    feefines: {
      type: 'okapi',
      records: 'feefines',
      GET: {
        path: 'feefines?query=(ownerId=%{activeRecord.ownerId} or ownerId=%{activeRecord.shared})&limit=100',
      },
    },
    feefineactions: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions',
    },
    accounts: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      PUT: {
        path: 'accounts/%{activeRecord.id}'
      },
    },
    account: {
      type: 'okapi',
      resource: 'accounts',
      accumulate: 'true',
      path: 'accounts',
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?limit=100',
    },
    payments: {
      type: 'okapi',
      records: 'payments',
      path: 'payments',
    },
    commentRequired: {
      type: 'okapi',
      records: 'comments',
      path: 'comments',
    },
    allfeefines: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines?limit=100',
    },
    activeRecord: {},
  });

  static propTypes = {
    resources: PropTypes.shape({
      selUser: PropTypes.arrayOf(PropTypes.object).isRequired,
      feefines: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      owners: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      activeRecord: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }),
      feefineactions: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      account: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }).isRequired,
    stripes: PropTypes.object.isRequired,
    // onCloseChargeFeeFine: PropTypes.func.isRequired,
    // handleAddRecords: PropTypes.func,
    okapi: PropTypes.object,
    // selectedLoan: PropTypes.object,
    // user: PropTypes.object,
    // onSubmit: PropTypes.func,
    initialize: PropTypes.func,
    servicePointsIds: PropTypes.arrayOf(PropTypes.string),
    defaultServicePointId: PropTypes.string,
  };

  getLoan = () => {
    const { resources, match: { params: { loanid } } } = this.props;
    const userLoans = (resources.loan || {}).records || [];
    if (userLoans.length === 0 || !loanid) return null;
    const loan = userLoans.find(l => l.id === loanid) || {};
    return loan;
  }

  getUser = () => {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];

    if (selUser.length === 0 || !id) return null;
    // Logging below shows this DOES sometimes find the wrong record. But why?
    // console.log(`getUser: found ${selUser.length} users, id '${selUser[0].id}' ${selUser[0].id === id ? '==' : '!='} '${id}'`);
    return selUser.find(u => u.id === id);
  }

  render() {
    return <ChargeFeeFine user={this.getUser()} selectedLoan={this.getLoan()} {...this.props} />;
  }
}

export default compose(
  stripesConnect,
  withStripes,
)(FeeFinesContainer);
