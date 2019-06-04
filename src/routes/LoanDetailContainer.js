import React from 'react';
import { compose } from 'redux';
import { stripesConnect, withStripes } from '@folio/stripes/core';
import LoanDetails from '../LoanDetails';
import withRenew from '../withRenew';

class LoanDetailContainer extends React.Component {
  static manifest = Object.freeze({
    loanActionsWithUser: {},
    users: {
      type: 'okapi',
      records: 'users',
      resourceShouldRefresh: true,
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
    selUser: {
      type: 'okapi',
      path: 'users/:{id}',
      clear: false,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '40',
      },
      records: 'usergroups',
    },
    
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=:{id}) sortby id&limit=100',
      permissionsRequired: 'circulation.loans.collection.get',
    },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      resourceShouldRefresh: true,
      records: 'requests',
      accumulate: 'true',
      fetch: false,
    },
    loanActions: {
      type: 'okapi',
      path: 'loan-storage/loan-history',
      records: 'loans',
      resourceShouldRefresh: true,
      accumulate: 'true',
      fetch: false,
    },
    loanAccountsActions: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      accumulate: 'true',
      fetch: false,
    },
    hasPatronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=(userId=:{id})&limit=100',
      permissionsRequired: 'manualblocks.collection.get',
    },
  });

  getLoan = () => {
    const { resources, match: { params: { loanid } } } = this.props;
    const userLoans = (resources.loansHistory || {}).records || [];
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

  getPatronGroup = () => {
    const { resources } = this.props;
    const user = this.getUser();
    const groups = resources.patronGroups ? resources.patronGroups.records : null;
    if (!user || !groups) return {};
    return groups.filter(g => g.id === user.patronGroup)[0] || {};
  }

  render() {
    const {
      resources
    } = this.props;

    const patronBlocks = (resources.patronBlocks || {}).records || [];

    return (
      <LoanDetails
        loan={this.getLoan()}
        user={this.getUser()}
        patronGroup={this.getPatronGroup()}
        patronBlocks={patronBlocks}
        {...this.props}
      />
    );
  }
}

export default compose(
  stripesConnect,
  withStripes,
  withRenew,
)(LoanDetailContainer);
