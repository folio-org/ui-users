import React from 'react';
import _get from 'lodash/get';
import { stripesConnect } from '@folio/stripes/core';
import LoansListing from '../LoansListing';
import ViewLoading from '../components/Loading/ViewLoading';

class LoansListingContainer extends React.Component {
  static manifest = Object.freeze({
    query: {},
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
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
      accumulate: 'true',
      fetch: false,
    },
    hasPatronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=(userId=:{id})&limit=100',
      permissionsRequired: 'manualblocks.collection.get',
    },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      resourceShouldRefresh: true,
      records: 'requests',
      accumulate: 'true',
      fetch: false,
    },
    loanAccount: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=userId=:{id}&limit=100',
    },
    activeRecord: {},
  });

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
    const { resources } = this.props;
    const user = this.getUser();
    const patronGroup = this.getPatronGroup();
    const loansHistory = _get(resources, ['loansHistory', 'records'], []);
    const patronBlocks = _get(resources, ['hasPatronBlocks', 'records'], []);

    if (!user) return (<ViewLoading inPaneset defaultWidth="100%" paneTitle="Loading loans" />);
    return (
      <LoansListing
        patronBlocks={patronBlocks}
        user={user}
        loansHistory={loansHistory}
        patronGroup={patronGroup}
        {...this.props}
      />);
  }
}

export default stripesConnect(LoansListingContainer);
