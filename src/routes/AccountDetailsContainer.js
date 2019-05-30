import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { stripesConnect } from '@folio/stripes/core';
import { makeQueryFunction } from '@folio/stripes/smart-components';

import AccountActionsHistory from '../AccountActionsHistory';
import ViewLoading from '../components/Loading/ViewLoading';

const filterConfig = [
  {
    label: <FormattedMessage id="ui-users.feefines.ownerLabel" />,
    name: 'owner',
    cql: 'feeFineOwner',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.accounts.history.columns.status" />,
    name: 'status',
    cql: 'paymentStatus.name',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.details.field.feetype" />,
    name: 'type',
    cql: 'feeFineType',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.details.field.type" />,
    name: 'material',
    cql: 'materialType',
    values: [],
  },
];

const queryFunction = (findAll, queryTemplate, sortMap, fConfig, failOnCondition, nsParams, a) => {
  const getCql = makeQueryFunction(findAll, queryTemplate, sortMap, fConfig, failOnCondition, nsParams);
  return (queryParams, pathComponents, resourceValues, logger) => {
    let cql = getCql(queryParams, pathComponents, resourceValues, logger);
    const userId = a[0].value;
    if (cql === undefined) { cql = `userId=${userId}`; } else { cql = `(${cql}) and (userId=${userId})`; }
    return cql;
  };
};

const args = [
  { name: 'user', value: 'x' },
];

class AccountsHistoryContainer extends React.Component {
  static manifest = Object.freeze({
    accountHistory: {
      type: 'okapi',
      resource: 'accounts',
      path: 'accounts/:{accountid}',
    },
    accountActions: {
      type: 'okapi',
      records: 'feefineactions',
      accumulate: 'true',
      path: 'feefineactions?query=(accountId=:{accountid}&limit=50',
    },
    activeRecord: {
      accountId: '0',
    },
  });

  componentDidMount() {
    const { match: { params } } = this.props;
    this.props.mutator.activeRecord.update({ records: 50, comments: 200, userId: params.id });
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
    const user = this.getUser();
    const loans = resources.loans ? resources.loans.records : [];
    const patronGroup = this.getPatronGroup();
    if (!user) return (<ViewLoading inPaneset defaultWidth="100%" paneTitle="Loading accounts" />);
    return (
      <AccountActionsHistory user={user} loans={loans} patronGroup={patronGroup} {...this.props} />
    );
  }
}

export default stripesConnect(AccountsHistoryContainer);
