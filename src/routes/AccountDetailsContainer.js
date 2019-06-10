import React from 'react';
import { stripesConnect } from '@folio/stripes/core';

import { AccountDetails } from '../components/Views';
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

  render() {
    const user = this.getUser();
    const account = this.getAccount();
    const patronGroup = this.getPatronGroup();
    if (!account) return (<ViewLoading inPaneset defaultWidth="100%" paneTitle="Loading accounts" />);
    return (
      <AccountDetails user={user} account={account} patronGroup={patronGroup} {...this.props} />
    );
  }
}

export default stripesConnect(AccountDetailsContainer);
