import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  concat,
} from 'lodash';

import { stripesConnect } from '@folio/stripes/core';
import { LoadingView } from '@folio/stripes/components';

import { LoansListing } from '../views';

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
        limit: '200',
      },
      records: 'usergroups',
    },
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId==:{id}) sortby id&limit=100000',
      permissionsRequired: 'circulation.loans.collection.get',
      shouldRefresh: (_, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/loan-anonymization/));
      },
    },
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
      accumulate: 'true',
      fetch: false,
    },
    hasManualPatronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=(userId==:{id})&limit=2000',
      permissionsRequired: 'manualblocks.collection.get',
    },
    hasAutomatedPatronBlocks: {
      type: 'okapi',
      records: 'automatedPatronBlocks',
      path: 'automated-patron-blocks/:{id}?limit=2000',
      permissionsRequired: 'automated-patron-blocks.collection.get',
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
      path: 'accounts?query=userId==:{id}&limit=10000',
    },
    renew: {
      fetch: false,
      type: 'okapi',
      path: 'circulation/renew-by-barcode',
      POST: {
        path: 'circulation/renew-by-barcode',
      },
      throwErrors: false,
    },
    anonymize: {
      type: 'okapi',
      fetch: false,
      POST: {
        path: 'loan-anonymization/by-user/%{activeRecord.user}',
      },
    },
    activeRecord: {},
  });

  static propTypes = {
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selUser: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
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
    const loansHistory = get(resources, ['loansHistory', 'records'], []);
    const manualPatronBlocks = get(resources, ['hasManualPatronBlocks', 'records'], []);
    const automatedPatronBlocks = get(resources, ['hasAutomatedPatronBlocks', 'records'], []);
    const patronBlocks = concat(automatedPatronBlocks, manualPatronBlocks);

    if (!user) return (<LoadingView defaultWidth="100%" paneTitle="Loading loans" />);
    return (
      <LoansListing
        patronBlocks={patronBlocks}
        user={user}
        loansHistory={loansHistory}
        patronGroup={patronGroup}
        {...this.props}
      />
    );
  }
}

export default stripesConnect(LoansListingContainer);
