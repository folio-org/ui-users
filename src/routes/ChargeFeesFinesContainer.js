import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import queryString from 'query-string';

import {
  stripesConnect,
  withStripes,
} from '@folio/stripes/core';

import { ChargeFeeFine } from '../components/Accounts';

class ChargeFeesFinesContainer extends React.Component {
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
      path: 'loan-storage/loans/:{loanid}',
      clear: false,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
    },
    // loansHistory: {
    //   type: 'okapi',
    //   records: 'loans',
    //   path: 'circulation/loans?query=(userId=:{id}) sortby id&limit=100',
    //   permissionsRequired: 'circulation.loans.collection.get',
    // },
    loanItem: {
      type: 'okapi',
      path: 'inventory/items/%{activeRecord.itemId}'
    },
    curUserServicePoint: {
      type: 'okapi',
      path: 'service-points-users?query=(userId==:{id})',
      records: 'servicePointsUsers',
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items?query=barcode=%{activeRecord.barcode}*',
    },
    // feefines: {
    //   type: 'okapi',
    //   records: 'feefines',
    //   GET: {
    //     path: 'feefines?query=(ownerId=%{activeRecord.ownerId} or ownerId=%{activeRecord.shared})&limit=100',
    //   },
    // },
    // feefineactions: {
    //   type: 'okapi',
    //   records: 'feefineactions',
    //   path: 'feefineactions',
    // },
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
      selUser: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
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
    okapi: PropTypes.object,
    initialize: PropTypes.func,
    servicePointsIds: PropTypes.arrayOf(PropTypes.string),
    defaultServicePointId: PropTypes.string,
  };

  componentDidUpdate() {
    // if a selected loan is present, get the associated item of the loan.
    const { match: { params }, resources: { loan, loanItem, activeRecord }, mutator } = this.props;
    const itemResource = (loanItem || {}).records || [];
    const loanResource = (loan || {}).records || [];
    // if there's an associated loan, but no loan item yet, update the localResource.
    if (params.loanid &&
      itemResource.length === 0 &&
      loanResource.length > 0 &&
      !activeRecord.itemId) {
      mutator.activeRecord.update({ itemId: loan.records[0].itemId });
    }
  }

  getLoan = () => {
    const { resources, match: { params } } = this.props;
    const userLoans = (resources.loan || {}).records || [];
    if (userLoans.length === 0 || !params.loanid) return null;
    const loan = userLoans.find(l => l.id === params.loanid) || {};
    if (loan) {
      loan.item = (resources.loanItem || {}).records[0] || {};
    }
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
)(ChargeFeesFinesContainer);
