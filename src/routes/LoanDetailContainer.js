import isEmpty from 'lodash/isEmpty';
import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { concat } from 'lodash';
import { stripesConnect, withStripes } from '@folio/stripes/core';
import { LoanDetails } from '../views';

class LoanDetailContainer extends React.Component {
  static manifest = Object.freeze({
    modified: {},
    users: {
      type: 'okapi',
      records: 'users',
      resourceShouldRefresh: true,
      path: (_q, _p, _r, _l, props) => {
        if (props.resources.loanActions &&
          props.resources.loanActions.records.length > 0) {
          const query = [...new Set(props.resources.loanActions.records
            .map(r => `id==${r.loan.metadata.updatedByUserId}`))]
            .join(' or ');
          return `users?query=(${query})`;
        }
        return null;
      },
    },
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
    loanHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId==:{id}) sortby id&limit=100',
      permissionsRequired: 'circulation.loans.collection.get',
    },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      resourceShouldRefresh: true,
      records: 'requests',
      accumulate: 'true',
      fetch: false,
    },
    loanActions: {
      type: 'okapi',
      path: 'loan-storage/loan-history?query=(loan.id==:{loanid})&limit=100',
      records: 'loansHistory',
      resourceShouldRefresh: true,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;

        return refresh || (path && path.match(/circulation/));
      },
    },
    loanAccountsActions: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=(loanId=:{loanid})&limit=1000',
      resourceShouldRefresh: true,
      shouldRefresh: (_, action, refresh) => refresh || (action?.meta?.path ?? '').match(/circulation/),
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
      path: 'manualblocks?query=(userId==:{id})&limit=100',
      permissionsRequired: 'manualblocks.collection.get',
    },
    hasAutomatedPatronBlocks: {
      type: 'okapi',
      records: 'automatedPatronBlocks',
      path: 'automated-patron-blocks/:{id}?limit=100',
      permissionsRequired: 'automated-patron-blocks.collection.get',
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
  });

  static propTypes = {
    resources: PropTypes.shape({
      loanHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      hasManualPatronBlocks: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      hasAutomatedPatronBlocks: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      selUser: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loanActions: PropTypes.object,
      users: PropTypes.object,
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string,
        loanid: PropTypes.string,
      })
    }),
  }

  getLoan = () => {
    const { resources, match: { params: { loanid } } } = this.props;
    const userLoans = (resources.loanHistory || {}).records || [];
    if (userLoans.length === 0 || !loanid) return undefined;
    const loan = userLoans.find(l => l.id === loanid) || {};
    return loan;
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

  getPatronBlocks = () => {
    const { resources } = this.props;
    const automatedPatronBlocks = resources?.hasAutomatedPatronBlocks?.records ?? [];
    const manualPatronBlocks = resources?.hasManualPatronBlocks?.records ?? [];

    return concat(automatedPatronBlocks, manualPatronBlocks);
  }

  joinLoanActionsWithUpdatingUser = (loanActions, users) => {
    if ((loanActions && loanActions.records.length > 0) &&
    (users && users.records.length > 0)) {
      const userMap = users.records.reduce((memo, user) => {
        return Object.assign(memo, { [user.id]: user });
      }, {});

      const records = loanActions.records.filter(la => la?.loan?.action).map(la => {
        return { ...la.loan, user: userMap[la.loan.metadata.updatedByUserId] };
      });

      // this.props.mutator.loanActionsWithUser.replace({ records });
      return records;
    }
    return [];
  }

  render() {
    const {
      resources : {
        loanActions,
        users,
      }
    } = this.props;

    const loan = this.getLoan();
    const loanActionsWithUser = this.joinLoanActionsWithUpdatingUser(
      loanActions,
      users
    );

    return (
      <LoanDetails
        loans={isEmpty(loan) ? [] : [loan]}
        loanActionsWithUser={loanActionsWithUser}
        loan={loan}
        user={this.getUser()}
        patronGroup={this.getPatronGroup()}
        patronBlocks={this.getPatronBlocks()}
        {...this.props}
      />
    );
  }
}

export default compose(
  stripesConnect,
  withStripes,
)(LoanDetailContainer);
