import React from 'react';
import _ from 'lodash';

import { stripesConnect } from '@folio/stripes/core';

import { AccountDetails } from '../views';
import ViewLoading from '../components/Loading/ViewLoading';


class AccountDetailsContainer extends React.Component {
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
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '40',
      },
      records: 'usergroups',
    },
    accountHistory: {
      type: 'okapi',
      resource: 'accounts',
      path: 'accounts/:{accountid}',
    },
    accountActions: {
      type: 'okapi',
      records: 'feefineactions',
      accumulate: 'true',
      path: 'feefineactions?query=(accountId=:{accountid})&limit=50',
    },
    activeRecord: {
      accountId: '0',
    },
    loanHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=:{id})&limit=100',
      permissionsRequired: 'circulation.loans.collection.get',
    },
  });

  getUser = () => {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];

    if (selUser.length === 0 || !id) return null;
    // Logging below shows this DOES sometimes find the wrong record. But why?
    // console.log(`getUser: found ${selUser.length} users, id '${selUser[0].id}' ${selUser[0].id === id ? '==' : '!='} '${id}'`);
    return selUser.find(u => u.id === id);
  }

  getAccount = () => {
    const { resources, match: { params: { accountid } } } = this.props;
    const account = (resources.accountHistory || {}).records || [];

    console.log('resources');
    console.log(resources);

    console.log('accountid');
    console.log(accountid);


    if (account.length === 0 || !accountid) return null;
    return account.find(a => a.id === accountid);
  }

  getPatronGroup = () => {
    const { resources } = this.props;
    const user = this.getUser();
    const groups = resources.patronGroups ? resources.patronGroups.records : null;
    if (!user || !groups) return {};
    return groups.filter(g => g.id === user.patronGroup)[0] || {};
  }

  getLoans = () => {
    const { resources } = this.props;
    console.log(' in get Loans');
    console.log(resources);

    return _.get(resources, ['loanHistory', 'records'], []);
  }

  render() {
    const loans = this.getLoans();
    const user = this.getUser();
    const account = this.getAccount();
    const patronGroup = this.getPatronGroup();

    console.log('333 account');
    console.log(account);

    if (!account) return (<ViewLoading defaultWidth="100%" paneTitle="Loading accounts" />);

    return (
      <AccountDetails
        user={user}
        account={account}
        patronGroup={patronGroup}
        loans={loans}
        {...this.props}
      />
    );
  }
}

export default stripesConnect(AccountDetailsContainer);
