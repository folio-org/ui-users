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
    loan: {
      type: 'okapi',
      path: (_q, _p, _r, _l, props) => {
        const { resources } = props;
        const account = (resources.accountHistory || {}).records || [];
        const loanId = account[0]?.loanId;

        return loanId ? `loan-storage/loans/${loanId}` : null;
      },
    },
    loanHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=:{id})&limit=100',
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

  getItemDetails = () => {
    const { resources } = this.props;
    const userLoan = (resources.loan || {}).records || [];
    if (userLoan.length === 0) return null;
    const { overdueFinePolicyId, lostItemPolicyId, itemId } = userLoan[0];
    const loanRecord = _.get(resources, ['loanHistory', 'records'], []);
    const currentRecord = loanRecord.filter((record) => record.id === userLoan[0].id) || [];
    const item = currentRecord[0]?.item || {};
    const contributors = item?.contributors?.map(({ name }) => name.split(',').reverse().join(' ')) || [];
    const overdueFinePolicyName = currentRecord[0]?.overdueFinePolicy?.name;
    const lostItemPolicyName = currentRecord[0]?.lostItemPolicy?.name;

    return {
      overdueFinePolicyId,
      lostItemPolicyId,
      itemId,
      contributors,
      overdueFinePolicyName,
      lostItemPolicyName,
    };
  }

  render() {
    const user = this.getUser();
    const account = this.getAccount();
    const patronGroup = this.getPatronGroup();
    const itemDetails = this.getItemDetails();

    if (!account) return (<ViewLoading defaultWidth="100%" paneTitle="Loading accounts" />);

    return (
      <AccountDetails
        user={user}
        account={account}
        patronGroup={patronGroup}
        itemDetails={itemDetails}
        {...this.props}
      />
    );
  }
}

export default stripesConnect(AccountDetailsContainer);
