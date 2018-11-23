import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import withRenew from '../../../withRenew';
import TableModel from './components/OpenLoansWithStaticData';


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
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
      formatDate: PropTypes.func.isRequired,
      formatDateTime: PropTypes.func.isRequired,
    }),
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
    onClickViewOpenAccounts: PropTypes.func.isRequired,
    onClickViewClosedAccounts: PropTypes.func.isRequired,
    onClickViewAllAccounts: PropTypes.func.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    renew: PropTypes.func,
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
    onClickViewChargeFeeFine: PropTypes.func.isRequired,
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
      loans: [],
      renewFailure: [],
      renewSuccess: [],
      loanPolicies: {},
      checkedLoans: {},
      requestCounts: {},
      errorMsg: {},
      bulkRenewalDialogOpen: false,
      allChecked: false,
      visibleColumns: this.controllableColumns.map(columnName => ({
        title: columnName,
        status: true,
      })),
      changeDueDateDialogOpen:false,
      activeLoan: null,
    };

    props.mutator.activeRecord.update({ user: props.user.id });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { loans } = nextProps;
    if (prevState.loans.length < nextProps.loans.length) {
      return { loans };
    }
    return null;
  }

  componentDidMount() {
    if (this.state.loans.length > 0) {
      this.fetchLoanPolicyNames();
      this.getOpenRequestsCount();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.loans.length > prevState.loans.length) {
      this.fetchLoanPolicyNames();
      this.getOpenRequestsCount();
    }
  }

  toggleAll = (e) => {
    const { loans } = this.props;
    const checkedLoans = (e.target.checked)
      ? loans.reduce((memo, loan) => (Object.assign(memo, { [loan.id]: loan })), {})
      : {};

    this.setState(({ allChecked }) => ({
      allChecked: !allChecked,
      checkedLoans
    }));
  };

  getLoanPolicie = (policieId) => {
    const { loanPolicies } = this.state;

    return loanPolicies[policieId];
  };

  isLoanChecked = (id) => {
    const { checkedLoans } = this.state;

    return (id in checkedLoans);
  };

  toggleItem = (e, loan) => {
    e.stopPropagation();

    const id = loan.id;
    const loans = this.state.checkedLoans;
    const checkedLoans = (loans[id])
      ? _.omit(loans, id)
      : { ...loans, [id]: loan };
    const allChecked = _.size(checkedLoans) === this.props.loans.length;
    this.setState({ checkedLoans, allChecked });
  };

  getOpenRequestsCount() {
    const q = this.state.loans.map(loan => {
      return `itemId==${loan.itemId}`;
    }).join(' or ');

    const query = `(${q}) and status==("Open - Awaiting pickup" or "Open - Not yet filled") sortby requestDate desc`;
    this.props.mutator.requests.reset();
    this.props.mutator.requests.GET({ params: { query } }).then((requestRecords) => {
      const requestCountObject = requestRecords.reduce((map, record) => {
        map[record.itemId] = map[record.itemId] ? ++map[record.itemId] : 1;
        return map;
      }, {});
      this.setState({ requestCounts: requestCountObject });
    });
  }

  fetchLoanPolicyNames() {
    const query = this.state.loans.map(loan => `id==${loan.loanPolicyId}`).join(' or ');

    this.props.mutator.loanPolicies.reset();
    this.props.mutator.loanPolicies.GET({ params: { query } }).then((loanPolicies) => {
      const loanPolicyObject = loanPolicies.reduce((map, loanPolicy) => {
        map[loanPolicy.id] = loanPolicy.name;
        return map;
      }, {});
      this.setState({ loanPolicies: loanPolicyObject });
    });
  }

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
    const selectedLoans = Object.values(this.state.checkedLoans);
    const renewSuccess = [];
    const renewFailure = [];
    const bulkRenewal = (selectedLoans.length > 1);
    const errorMsg = {};
    const renewedLoans = selectedLoans.map((loan) => {
      return this.renew(loan, bulkRenewal)
        .then((renewedLoan) => renewSuccess.push(renewedLoan))
        .catch((error) => {
          renewFailure.push(loan);
          errorMsg[loan.id] = error;
        });
    });

    this.setState({ errorMsg });

    // map(p => p.catch(e => e)) turns all rejections into resolved values for the promise.all to wait for everything to finish
    Promise.all(renewedLoans.map(p => p.catch(e => e)))
      .then(() => {
        if (bulkRenewal) {
          this.setState({ renewSuccess, renewFailure, bulkRenewalDialogOpen: true });
        }
      });

    this.setState({ checkedLoans: {}, allChecked: false });
  };

  renew(loan, bulkRenewal) {
    const { user, renew } = this.props;
    const promise = renew(loan, user, bulkRenewal);

    if (bulkRenewal) return promise;
    const singleRenewalFailure = [];
    promise
      .then(() => this.showSingleRenewCallout(loan))
      .catch(() => {
        singleRenewalFailure.push(loan);
      });
    return promise;
  }

  showSingleRenewCallout(loan) {
    const message = (
      <span>
        <SafeHTMLMessage
          id="ui-users.loans.item.renewed.callout"
          values={{ title: loan.item.title }}
        />
      </span>
    );

    this.callout.sendCallout({ message });
  }

  hideChangeDueDateDialog = () => {
    this.setState({
      changeDueDateDialogOpen: false,
      activeLoan: undefined,
    });
  };

  hideBulkRenewalDialog = () => {
    this.setState({
      bulkRenewalDialogOpen: false,
    });
  };

  showChangeDueDateDialog = () => {
    this.setState({
      changeDueDateDialogOpen: true,
    });
  };

  /**
   * change handler for the options-menu prevents the event from bubbling
   * up to the event handler attached to the row.
   */
  handleOptionsChange = (itemMeta, e) => {
    e.preventDefault();
    e.stopPropagation();

    const { loan, action } = itemMeta;

    if (action && this[action]) {
      this[action](loan);
    }
  };

  itemDetails(loan, e) {
    if (e) e.preventDefault();

    // none of the query params relevent to finding a user
    // are relevent to finding instances so we purge them all.
    const q = {};
    Object.keys(this.props.resources.query).forEach((k) => { q[k] = null; });

    this.props.mutator.query.update({
      _path: `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`,
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
    const q = {};
    Object.keys(this.props.resources.query).forEach((k) => { q[k] = null; });

    this.props.mutator.query.update({
      _path: `/settings/circulation/loan-policies/${loan.loanPolicyId}`,
      ...q,
    });
  };

  feefine = (loan, e) => {
    this.props.onClickViewChargeFeeFine(e, loan);
  };

  feefinedetails = (loan, e) => {
    const accounts = _.get(this.props.resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    if (accountsLoan.length === 1) {
      this.props.onClickViewAccountActionsHistory(e, { id: accountsLoan[0].id });
    } else if (accountsLoan.length > 1) {
      const open = accountsLoan.filter(a => a.status.name === 'Open') || [];
      if (open.length === accountsLoan.length) {
        this.props.onClickViewOpenAccounts(e, loan);
      } else if (open.length === 0) {
        this.props.onClickViewClosedAccounts(e, loan);
      } else {
        this.props.onClickViewAllAccounts(e, loan);
      }
    }
  };

  render() {
    const {
      visibleColumns,
      checkedLoans,
      loanPolicies,
      errorMsg,
      requestCounts,
      renewSuccess,
      renewFailure,
      bulkRenewalDialogOpen,
      activeLoan,
      changeDueDateDialogOpen,
      resources = {},
      allChecked,
    } = this.state;

    const {
      loans,
      stripes,
      onClickViewLoanActionsHistory,
      user,
    } = this.props;

    return (
      <TableModel
        visibleColumns={visibleColumns}
        checkedLoans={checkedLoans}
        loanPolicies={loanPolicies}
        errorMsg={errorMsg}
        requestCounts={requestCounts}
        renewSuccess={renewSuccess}
        renewFailure={renewFailure}
        bulkRenewalDialogOpen={bulkRenewalDialogOpen}
        activeLoan={activeLoan}
        changeDueDateDialogOpen={changeDueDateDialogOpen}
        loans={loans}
        stripes={stripes}
        onClickViewLoanActionsHistory={onClickViewLoanActionsHistory}
        user={user}
        toggleAll={this.toggleAll}
        toggleItem={this.toggleItem}
        isLoanChecked={this.isLoanChecked}
        requestRecords={(resources.requests || {}).records || []}
        resources={resources}
        getLoanPolicie={this.getLoanPolicie}
        handleOptionsChange={this.handleOptionsChange}
        possibleColumns={this.possibleColumns}
        hideChangeDueDateDialog={this.hideChangeDueDateDialog}
        hideBulkRenewalDialog={this.hideBulkRenewalDialog}
        renewSelected={this.renewSelected}
        showChangeDueDateDialog={this.showChangeDueDateDialog}
        toggleColumn={this.toggleColumn}
        calloutRef={(ref) => { this.callout = ref; }}
        allChecked={allChecked}
      />
    );
  }
}

export default withRenew(OpenLoansControl);
