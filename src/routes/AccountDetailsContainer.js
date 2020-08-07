import React from 'react';
import PropTypes from 'prop-types';
import { first } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { stripesConnect } from '@folio/stripes/core';
import { LoadingView } from '@folio/stripes/components';

import { AccountDetails } from '../views';

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
        limit: '200',
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
      path: 'feefineactions?query=(accountId==:{accountid})&limit=10000',
    },
    activeRecord: {
      accountId: '0',
      instanceId: '',
    },
    loans: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId==:{id})&limit=1000',
    },
    instance: {
      type: 'okapi',
      path: 'instance-storage/instances/%{activeRecord.instanceId}',
    }
  });

  static propTypes = {
    resources: PropTypes.shape({
      loans: PropTypes.object,
      activeRecord: PropTypes.shape({
        instanceId: PropTypes.string,
      }),
      accountHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selUser: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      instance: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        accountid: PropTypes.string,
        id: PropTypes.string,
      })
    }),
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func.isRequired
      }).isRequired
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
    const {
      mutator: {
        activeRecord: {
          update: updateInstanceId,
        }
      },
      resources,
    } = this.props;

    const account = this.getAccount();
    if (account?.instanceId && account.instanceId !== resources.activeRecord.instanceId) {
      updateInstanceId({ instanceId: account.instanceId });
    }

    const instance = first(resources?.instance?.records || []) || { contributors: [] };
    const loanRecords = resources?.loans?.records ?? [];
    const contributors = instance.contributors.map(({ name }) => name.split(',').reverse().join(', '));
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

    if (!account) {
      return (
        <LoadingView
          defaultWidth="100%"
          paneTitle={<FormattedMessage id="ui-users.accounts.loading" />}
        />
      );
    }

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
