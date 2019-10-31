import React from 'react';
import PropTypes from 'prop-types';
import {
  isEmpty,
  omit,
  size,
  get,
} from 'lodash';

import { stripesShape } from '@folio/stripes/core';

import withRenew from '../../../withRenew';
import TableModel from './components/OpenLoansWithStaticData';
import { getOpenRequestsPath } from '../../../util';

class OpenLoansControl extends React.Component {
  static manifest = Object.freeze({
    query: {},
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
      accumulate: 'true',
      fetch: false,
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
      path: 'accounts?query=userId=%{activeRecord.user}&limit=100',
    },
    activeRecord: {},
  });

  static propTypes = {
    stripes: stripesShape.isRequired,
    mutator: PropTypes.shape({
      query: PropTypes.object.isRequired,
      activeRecord: PropTypes.object,
      loanPolicies: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      requests: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }),
    resources: PropTypes.shape({
      query: PropTypes.object,
      requests: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }),
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    loanPolicies: PropTypes.object.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    patronBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
    renew: PropTypes.func.isRequired,
    buildRecords: PropTypes.func.isRequired,
    onClickViewAllAccounts: PropTypes.func.isRequired,
    onClickViewOpenAccounts: PropTypes.func.isRequired,
    onClickViewChargeFeeFine: PropTypes.func.isRequired,
    onClickViewClosedAccounts: PropTypes.func.isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.possibleColumns = [
      '  ',
      'title',
      'itemStatus',
      'dueDate',
      'requests',
      'barcode',
      'Fee/Fine',
      'Call number',
      'Contributors',
      'renewals',
      'loanPolicy',
      'location',
      'loanDate',
      ' ',
    ];

    // list of columns that can be shown/hidden, excludes ellipsis and checkboxes column
    this.controllableColumns = [
      'title',
      'itemStatus',
      'dueDate',
      'requests',
      'barcode',
      'Fee/Fine',
      'Call number',
      'Contributors',
      'renewals',
      'loanPolicy',
      'location',
      'loanDate',
    ];

    this.state = {
      checkedLoans: {},
      allChecked: false,
      visibleColumns: this.controllableColumns.map(columnName => ({
        title: columnName,
        status: true,
      })),
      patronBlockedModal: false,
      changeDueDateDialogOpen:false,
      activeLoan: null,
    };

    props.mutator.activeRecord.update({ user: props.user.id });

    this.permissions = { allRequests: 'ui-users.requests.all' };
  }

  toggleAll = (e) => {
    const { loans } = this.props;
    const checkedLoans = e.target.checked
      ? loans.reduce((memo, loan) => Object.assign(memo, { [loan.id]: loan }), {})
      : {};

    this.setState(({ allChecked }) => ({
      allChecked: !allChecked,
      checkedLoans
    }));
  };

  getLoanPolicy = (policyId) => {
    const { loanPolicies } = this.props;

    return loanPolicies[policyId];
  };

  isLoanChecked = (id) => {
    const { checkedLoans } = this.state;

    return (id in checkedLoans);
  };

  toggleItem = (e, loan) => {
    e.stopPropagation();
    const { checkedLoans: loans } = this.state;
    const { loans: existingLoans } = this.props;

    const id = loan.id;
    const checkedLoans = (loans[id])
      ? omit(loans, id)
      : { ...loans, [id]: loan };
    const allChecked = size(checkedLoans) === existingLoans;

    this.setState({ checkedLoans, allChecked });
  };

  toggleColumn = (e) => {
    this.setState(({ visibleColumns }) => ({
      visibleColumns: visibleColumns.map(column => {
        if (column.title === e) {
          const status = column.status;
          column.status = status !== true;
        }
        return column;
      })
    }));
  };

  renewSelected = () => {
    const { checkedLoans } = this.state;
    const {
      renew,
      user,
    } = this.props;
    const selectedLoans = Object.values(checkedLoans);

    renew(selectedLoans, user);
    this.setState({ checkedLoans: {}, allChecked: false });
  };

  hideChangeDueDateDialog = () => {
    this.setState({
      changeDueDateDialogOpen: false,
      activeLoan: null,
    });
  };

  showChangeDueDateDialog = () => {
    this.setState({
      changeDueDateDialogOpen: true,
    });
  };

  onClosePatronBlockedModal = () => {
    this.setState({
      patronBlockedModal: false,
    });
  };

  openPatronBlockedModal = () => {
    this.setState({
      patronBlockedModal: true,
    });
  };

  /**
   * change handler for the options-menu prevents the event from bubbling
   * up to the event handler attached to the row.
   */
  handleOptionsChange = (itemMeta, e) => {
    e.preventDefault();
    e.stopPropagation();

    const {
      loan,
      action,
    } = itemMeta;

    if (action && this[action]) {
      this[action](loan);
    }
  };

  itemDetails(loan, e) {
    if (e) e.preventDefault();

    const {
      resources: {
        query,
      },
      mutator: {
        query: {
          update,
        },
      },
    } = this.props;
    const {
      item:{
        instanceId,
        holdingsRecordId,
      },
      itemId,
    } = loan;

    // none of the query params relevent to finding a user
    // are relevent to finding instances so we purge them all.
    const q = {};
    Object.keys(query).forEach((k) => { q[k] = null; });

    update({
      _path: `/inventory/view/${instanceId}/${holdingsRecordId}/${itemId}`,
      ...q,
    });
  }

  changeDueDate = (loan) => {
    this.setState({
      activeLoan: loan.id,
      changeDueDateDialogOpen: true,
    });
  };

  showLoanPolicy = (loan, e) => {
    if (e) e.preventDefault();

    const {
      resources: {
        query,
      },
      mutator: {
        query: {
          update,
        },
      },
    } = this.props;
    const q = {};

    Object.keys(query).forEach((k) => { q[k] = null; });

    update({
      _path: `/settings/circulation/loan-policies/${loan.loanPolicyId}`,
      ...q,
    });
  };

  discoverRequests = (loan) => {
    const { history } = this.props;
    const query = get(loan, ['item', 'barcode']);
    const path = getOpenRequestsPath(query);
    
    history.push(path);
  };

  feefine = (loan, e) => {
    const { onClickViewChargeFeeFine } = this.props;

    onClickViewChargeFeeFine(e, loan);
  };

  renew = (loan) => {
    const {
      patronBlocks,
      renew,
      user,
    } = this.props;
    const countRenew = patronBlocks.filter(b => b.renewals === true);

    if (isEmpty(countRenew)) {
      renew([loan], user);
    } else {
      this.openPatronBlockedModal();
    }
  };

  feefinedetails = (loan, e) => {
    const {
      resources,
      onClickViewAllAccounts,
      onClickViewOpenAccounts,
      onClickViewClosedAccounts,
      onClickViewAccountActionsHistory,
    } = this.props;
    const accounts = get(resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];

    if (accountsLoan.length === 1) {
      onClickViewAccountActionsHistory(e, { id: accountsLoan[0].id });
    } else if (accountsLoan.length > 1) {
      const open = accountsLoan.filter(a => a.status.name === 'Open') || [];

      if (open.length === accountsLoan.length) {
        onClickViewOpenAccounts(e, loan);
      } else if (open.length === 0) {
        onClickViewClosedAccounts(e, loan);
      } else {
        onClickViewAllAccounts(e, loan);
      }
    }
  };

  feeFineCount = (loan) => {
    const { resources } = this.props;
    const accounts = get(resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    return accountsLoan.length;
  };

  render() {
    const {
      visibleColumns,
      checkedLoans,
      activeLoan,
      changeDueDateDialogOpen,
      allChecked,
      patronBlockedModal,
    } = this.state;

    const {
      requestCounts,
      loans,
      stripes,
      onClickViewLoanActionsHistory,
      user,
      buildRecords,
      patronGroup,
      patronBlocks,
      resources,
    } = this.props;
    return (
      <div data-test-open-loans>
        <TableModel
          patronBlockedModal={patronBlockedModal}
          onClosePatronBlockedModal={this.onClosePatronBlockedModal}
          openPatronBlockedModal={this.openPatronBlockedModal}
          patronBlocks={patronBlocks}
          patronGroup={patronGroup}
          buildRecords={buildRecords}
          visibleColumns={visibleColumns}
          checkedLoans={checkedLoans}
          requestCounts={requestCounts}
          activeLoan={activeLoan}
          changeDueDateDialogOpen={changeDueDateDialogOpen}
          loans={loans}
          stripes={stripes}
          feeFineCount={this.feeFineCount}
          onClickViewLoanActionsHistory={onClickViewLoanActionsHistory}
          user={user}
          toggleAll={this.toggleAll}
          toggleItem={this.toggleItem}
          isLoanChecked={this.isLoanChecked}
          requestRecords={(resources.requests || {}).records || []}
          resources={resources}
          getLoanPolicy={this.getLoanPolicy}
          handleOptionsChange={this.handleOptionsChange}
          possibleColumns={this.possibleColumns}
          hideChangeDueDateDialog={this.hideChangeDueDateDialog}
          renewSelected={this.renewSelected}
          showChangeDueDateDialog={this.showChangeDueDateDialog}
          toggleColumn={this.toggleColumn}
          allChecked={allChecked}
        />
      </div>
    );
  }
}

export default withRenew(OpenLoansControl);
