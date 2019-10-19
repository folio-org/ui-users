import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

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
      path: (_q, _p, _r, _l, props) => {
        const { match: { params } } = props;
        const loanId = _q.loan || params.loanid;
        return loanId ? `loan-storage/loans/${loanId}` : null;
      },
      clear: false,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
    },
    loanItem: {
      type: 'okapi',
      // path: 'inventory/items/%{activeRecord.itemId}'
      path: (_q, _p, _r, _l, props) => {
        const { resources: { loan, activeRecord } } = props;
        if ((activeRecord && activeRecord.itemId) || (loan && loan.records.length > 0)) {
          const itemId = activeRecord.itemId || loan.records[0].itemId;
          return itemId ? `inventory/items/${itemId}` : null;
        }
        return null;
      }
    },
    curUserServicePoint: {
      type: 'okapi',
      path: 'service-points-users?query=(userId==:{id})',
      records: 'servicePointsUsers',
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: (_q, _p, _r, _l, props) => {
        const { resources: { loanItem, activeRecord } } = props;
        if ((activeRecord && activeRecord.barcode) || (loanItem && loanItem.records.length > 0)) {
          const itemBar = activeRecord.barcode || loanItem.records[0].barcode;
          return itemBar ? `inventory/items?query=barcode=${itemBar}*` : null;
        }
        return null;
      },
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

  getLoan = () => {
    const { resources, match: { params } } = this.props;
    const userLoans = (resources.loan || {}).records || [];
    if (userLoans.length === 0 || !params.loanid) return null;
    const loan = userLoans.find(l => l.id === params.loanid) || {};
    if (Object.keys(loan).length > 0) {
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
