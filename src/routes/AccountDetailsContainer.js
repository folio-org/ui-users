import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

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
    loans: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=:{id})&limit=1000',
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      accountHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selUser: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        accountid: PropTypes.string,
        id: PropTypes.string,
      })
    }),
  }

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
    const account = this.getAccount();
    const { resources } = this.props;
    const loanRecords = resources?.loans?.records ?? [];
    const itemId = account?.itemId;
    const item = loanRecords.filter((loan) => loan.itemId === itemId);
    const contributorRecords = item[0]?.item?.contributors ?? [];
    const contributors = contributorRecords.map(({ name }) => name.split(',').reverse().join(', ')) || [];
    const loanId = account?.loanId;

    if (loanId === '0') return { contributors };

    const currentRecord = loanRecords.filter((record) => record.id === loanId) || [];
    const overdueFinePolicyName = currentRecord[0]?.overdueFinePolicy?.name;
    const overdueFinePolicyId = currentRecord[0]?.overdueFinePolicyId;
    const lostItemPolicyName = currentRecord[0]?.lostItemPolicy?.name;
    const lostItemPolicyId = currentRecord[0]?.lostItemPolicyId;

    return {
      overdueFinePolicyId,
      lostItemPolicyId,
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
