import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import {
  concat,
  isEmpty,
} from 'lodash';

import {
  stripesConnect,
  withStripes,
} from '@folio/stripes/core';
import { Callout } from '@folio/stripes/components';

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
      fetch: false,
      accumulate: 'true',
      throwErrors: false,
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
      path: 'circulation/loans?query=(userId==:{id}) sortby id&limit=2000',
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
      path: 'loan-storage/loan-history?query=(loan.id==:{loanid})&limit=2000',
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
      path: 'accounts?query=(loanId==:{loanid})&limit=2000',
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
      path: 'manualblocks?query=(userId==:{id})&limit=2000',
      permissionsRequired: 'manualblocks.collection.get',
    },
    hasAutomatedPatronBlocks: {
      type: 'okapi',
      records: 'automatedPatronBlocks',
      path: 'automated-patron-blocks/:{id}?limit=2000',
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
        hasLoaded: PropTypes.bool.isRequired,
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
      loanAccountsActions: PropTypes.shape({
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
    mutator: PropTypes.shape({
      selUser: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.calloutRef = React.createRef();
  }

  componentDidMount() {
    this.props.mutator.selUser.GET()
      .catch(() => {
        this.showErrorCallout('ui-users.errors.userNotFound');
      });
  }

  getLoan = () => {
    const { resources, match: { params: { loanid } } } = this.props;
    const userLoans = (resources.loanHistory || {}).records || [];
    if (userLoans.length === 0 || !loanid) return undefined;
    const loan = userLoans.find(l => l.id === loanid) || {};
    return loan;
  }

  getLoanAccountActions = () => {
    const {
      resources,
      match: {
        params: { loanid }
      }
    } = this.props;
    const loanAccountActions = (resources.loanAccountsActions || {}).records || [];

    return loanAccountActions.filter(l => l.loanId === loanid) || [];
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
    if ((loanActions && loanActions.records.length > 0) && (users && users.records.length === 0)) {
      const records = loanActions.records
        .filter(loanAction => loanAction?.loan?.action)
        .map(loanAction => loanAction.loan);

      return records;
    }
    return [];
  }

  isLoading = () => {
    const {
      resources: {
        loanActions,
        loanHistory,
        users,
      },
    } = this.props;
    const loan = this.getLoan();
    const user = this.getUser();

    const isUser = user === null ? false : !user;
    const isUserId = user === null ? false : loan?.userId !== user?.id;

    return !loanActions.hasLoaded ||
      !loanHistory.hasLoaded ||
      !users.hasLoaded ||
      !loan ||
      isUser ||
      isUserId;
  }

  showErrorCallout = (messageId) => {
    this.calloutRef.current.sendCallout({
      type: 'error',
      message: <FormattedMessage id={messageId} />,
    });
  }

  render() {
    const {
      resources: {
        loanActions,
        loanHistory,
        users,
      }
    } = this.props;

    const loan = this.getLoan();
    const loanActionsWithUser = this.joinLoanActionsWithUpdatingUser(
      loanActions,
      users
    );

    return (
      <>
        <LoanDetails
          loans={isEmpty(loan) ? [] : [loan]}
          loanActionsWithUser={loanActionsWithUser}
          loan={loan}
          loanAccountActions={this.getLoanAccountActions()}
          loanIsMissing={isEmpty(loan) && loanHistory.hasLoaded}
          user={this.getUser()}
          patronGroup={this.getPatronGroup()}
          patronBlocks={this.getPatronBlocks()}
          isLoading={this.isLoading()}
          showErrorCallout={this.showErrorCallout}
          {...this.props}
        />
        <Callout ref={this.calloutRef} />
      </>
    );
  }
}

export default compose(
  stripesConnect,
  withStripes,
)(LoanDetailContainer);
