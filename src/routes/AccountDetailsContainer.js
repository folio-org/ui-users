import React from 'react';
import PropTypes from 'prop-types';
import {
  first,
} from 'lodash';
import { FormattedMessage } from 'react-intl';

import { stripesConnect } from '@folio/stripes/core';
import { LoadingView } from '@folio/stripes/components';

import { MAX_RECORDS } from '../constants';
import { calculateOwedFeeFines } from '../components/Accounts/accountFunctions';
import { AccountDetails } from '../views';
import {
  filterConfig,
  queryFunction,
  args,
} from './feeFineConfig';
import { getContributors } from '../components/util';
import CurrentUserServicePointAbsenteeErrorModal from '../components/CurrentUserServicePointAbsenteeErrorModal';

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
    accounts: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      params: {
        query: 'userId==:{id}',
        limit: MAX_RECORDS,
      },
    },
    accountActions: {
      type: 'okapi',
      records: 'feefineactions',
      accumulate: 'true',
      path: `feefineactions?query=(accountId==:{accountid})&limit=${MAX_RECORDS}`,
    },
    feefineactions: {
      type: 'okapi',
      records: 'feefineactions',
      path: `feefineactions?query=(userId==:{id})&limit=${MAX_RECORDS}`,
    },
    activeRecord: {
      accountId: '0',
      instanceId: '',
      records: MAX_RECORDS,
    },
    // Many fees and fines are associated with loans, so the loans are
    // retrieved in order to show the corresponding policies (overdue
    // fine policy, lost item policy) and the item's current status.
    // But! Not _all_ fees and fines are associated with loans, and not
    // all users may have permission to view loans. For that situation,
    // using permissionRequired allows the AccountDetails page to function
    // as-is; it simply doesn't receive any loan information.
    loans: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId==:{id})&limit=1000',
      permissionsRequired: 'circulation.loans.collection.get',
    },
    instance: {
      type: 'okapi',
      path: 'instance-storage/instances/%{activeRecord.instanceId}',
    },
    query: { initialValue: {} },
    feefineshistory: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      recordsRequired: '%{activeRecord.records}',
      perRequest: MAX_RECORDS,
      GET: {
        params: {
          query: queryFunction(
            'feeFineType=*',
            'feeFineType="%{query.query}*" or barcode="%{query.query}*" or materialType="%{query.query}" or title="%{query.query}*    " or feeFineOwner="%{query.query}*" or paymentStatus.name="%{query.query}"',
            { userId: 'userId' },
            filterConfig,
            0,
            { query: 'q', filters: 'f' },
            args,
          ),
        },
        staticFallback: { params: {} },
      },
      shouldRefresh: (resource, action, refresh) => {
        return refresh || action.meta.path === 'accounts-bulk';
      },
    },
    // Service points are needed here to properly display SP name in <AccountDetails>
    // for fees/fines assigned to an item during checkout.
    servicePoints: {
      type: 'okapi',
      records: 'servicepoints',
      path: 'service-points',
      params: {
        query: 'cql.allRecords=1',
        limit: MAX_RECORDS,
      },
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      loans: PropTypes.object,
      activeRecord: PropTypes.shape({
        instanceId: PropTypes.string,
      }),
      accounts: PropTypes.shape({
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
      feefineshistory: PropTypes.shape({
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
    okapi: PropTypes.shape({
      currentUser: PropTypes.shape({
        curServicePoint: PropTypes.shape({
          id: PropTypes.string,
        }),
      }).isRequired,
    }).isRequired,
  }

  componentDidMount() {
    const {
      match: {
        params,
      },
    } = this.props;

    this.props.mutator.activeRecord.update({ records: 50, userId: params.id });

    args[0].value = params.id;
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
    const accounts = resources?.accounts?.records || [];

    if (accounts.length === 0 || !accountid) {
      return null;
    }

    return accounts.find(a => a.id === accountid);
  }

  getPatronGroup = () => {
    const { resources } = this.props;
    const user = this.getUser();
    const groups = resources.patronGroups ? resources.patronGroups.records : null;
    if (!user || !groups) return {};
    return groups.filter(g => g.id === user.patronGroup)[0] || {};
  }

  getOwedAmount = () => {
    const {
      match: {
        params: {
          accountid,
        }
      },
      resources,
    } = this.props;

    const accounts = resources?.accounts?.records || [];

    return calculateOwedFeeFines(accounts.filter(account => account.id !== accountid));
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

    const instance = account?.instanceId
      ? first(resources?.instance?.records)
      : [];
    const loanRecords = resources?.loans?.records ?? [];
    const contributors = getContributors(account, instance);
    const loanId = account?.loanId;

    if (loanId === '0') return { contributors };

    const currentRecord = loanRecords.filter((record) => record.id === loanId) || [];
    const overdueFinePolicyName = currentRecord[0]?.overdueFinePolicy?.name;
    const overdueFinePolicyId = currentRecord[0]?.overdueFinePolicyId;
    const lostItemPolicyName = currentRecord[0]?.lostItemPolicy?.name;
    const lostItemPolicyId = currentRecord[0]?.lostItemPolicyId;
    const statusItemName = currentRecord[0]?.item?.status?.name;

    return {
      overdueFinePolicyId,
      lostItemPolicyId,
      contributors,
      overdueFinePolicyName,
      lostItemPolicyName,
      statusItemName,
    };
  }

  render() {
    const user = this.getUser();
    const account = this.getAccount();
    const patronGroup = this.getPatronGroup();
    const itemDetails = this.getItemDetails();
    const owedAmount = this.getOwedAmount();

    if (!this.props.okapi.currentUser.curServicePoint?.id) {
      return <CurrentUserServicePointAbsenteeErrorModal />;
    }

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
        owedAmount={owedAmount}
        patronGroup={patronGroup}
        itemDetails={itemDetails}
        {...this.props}
      />
    );
  }
}

export default stripesConnect(AccountDetailsContainer);
