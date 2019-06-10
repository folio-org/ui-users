import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { stripesConnect } from '@folio/stripes/core';
import { makeQueryFunction } from '@folio/stripes/smart-components';

import { AccountsListing } from '../components/Views';
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

class AccountsListingContainer extends React.Component {
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
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: {} },
    comments: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions?query=(userId=:{id} and comments=*)&limit=%{activeRecord.comments}',
    },
    filter: {
      type: 'okapi',
      records: 'accounts',
      recordsRequired: '%{activeRecord.records}',
      path: 'accounts?query=userId=:{id}&limit=100',
    },
    loans: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=:{id}) sortby id&limit=100',
      permissionsRequired: 'circulation.loans.collection.get',
    },
    feefineshistory: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      recordsRequired: '%{activeRecord.records}',
      perRequest: 50,
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
    },
    activeRecord: { records: 50 },
    user: {},
  });

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }),
    resources: PropTypes.shape({
      feefineshistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      query: PropTypes.object,
    }),
    okapi: PropTypes.object,
    user: PropTypes.object,
    // onCancel: PropTypes.func.isRequired,
    // onClickViewChargeFeeFine: PropTypes.func.isRequired,
    openAccounts: PropTypes.bool,
    patronGroup: PropTypes.object,
    mutator: PropTypes.shape({
      user: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }),
      activeRecord: PropTypes.object,
    }),
    parentMutator: PropTypes.shape({
      query: PropTypes.object.isRequired,
    }),
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    // addRecord: PropTypes.bool,
    num: PropTypes.number,
    // handleAddRecords: PropTypes.func,
  };

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
    if (!user) return (<ViewLoading defaultWidth="100%" paneTitle="Loading accounts" />);
    return (
      <AccountsListing user={user} loans={loans} patronGroup={patronGroup} {...this.props} />
    );
  }
}

export default stripesConnect(AccountsListingContainer);
