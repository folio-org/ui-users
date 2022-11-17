import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { stripesConnect } from '@folio/stripes/core';
import { LoadingView } from '@folio/stripes/components';

import CurrentUserServicePointAbsenteeErrorModal from '../components/CurrentUserServicePointAbsenteeErrorModal';
import { AccountsListing } from '../views';
import { MAX_RECORDS } from '../constants';
import {
  filterConfig,
  queryFunction,
  args,
} from './feeFineConfig';

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
        limit: '200',
      },
      records: 'usergroups',
    },
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: {} },
    comments: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions?query=(userId==:{id} and comments=*)&limit=%{activeRecord.comments}',
      shouldRefresh: (resource, action, refresh) => {
        return refresh || action.meta.path === 'accounts' || action.meta.path === 'accounts-bulk';
      },
    },
    filter: {
      type: 'okapi',
      records: 'accounts',
      recordsRequired: '%{activeRecord.records}',
      path: `accounts?query=userId==:{id}&limit=${MAX_RECORDS}`,
    },
    loans: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId==:{id}) sortby id&limit=2000',
      permissionsRequired: 'circulation.loans.collection.get',
    },
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
    activeRecord: {
      records: MAX_RECORDS,
    },
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
      loans: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      query: PropTypes.object,
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selUser: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    okapi: PropTypes.shape({
      currentUser: PropTypes.shape({
        curServicePoint: PropTypes.shape({
          id: PropTypes.string,
        }),
      }).isRequired,
    }).isRequired,
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
    const loans = resources?.loans ? resources.loans.records : [];
    const patronGroup = this.getPatronGroup();

    if (!this.props.okapi.currentUser.curServicePoint?.id) {
      return <CurrentUserServicePointAbsenteeErrorModal />;
    }

    if (!user) {
      return (
        <LoadingView
          defaultWidth="100%"
          paneTitle={<FormattedMessage id="ui-users.accounts.loading" />}
        />
      );
    }
    return (
      <AccountsListing user={user} loans={loans} patronGroup={patronGroup} {...this.props} />
    );
  }
}

export default stripesConnect(AccountsListingContainer);
