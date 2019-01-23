import React from 'react';
import PropTypes from 'prop-types';
import {
  isEmpty,
  omit,
  size,
  get,
} from 'lodash';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { stripesShape } from '@folio/stripes/core';

import withRenew from '../../../withRenew';
import TableModel from './components/OpenLoansWithStaticData';
import isOverridePossible from './helpers/isOverridePossible';

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
    patronGroup: PropTypes.object.isRequired,
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
      patronBlockedModal: false,
      changeDueDateDialogOpen:false,
      activeLoan: null,
    };

    props.mutator.activeRecord.update({ user: props.user.id });

    this.permissions = { allRequests: 'ui-users.requests.all' };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { loans } = nextProps;

    if (prevState.loans.length < nextProps.loans.length) {
      return { loans };
    }

    return null;
  }

  componentDidMount() {
    const { loans } = this.state;

    if (loans.length > 0) {
      this.fetchLoanPolicyNames();
      this.getOpenRequestsCount();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { loans } = this.state;

    if (loans.length > prevState.loans.length) {
      this.fetchLoanPolicyNames();
      this.getOpenRequestsCount();
    }
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
    const { checkedLoans: loans } = this.state;
    const { loans: existingLoans } = this.props;

    const id = loan.id;
    const checkedLoans = (loans[id])
      ? omit(loans, id)
      : { ...loans, [id]: loan };
    const allChecked = size(checkedLoans) === existingLoans;

    this.setState({ checkedLoans, allChecked });
  };

  getOpenRequestsCount() {
    const {
      stripes,
      mutator: {
        loanPolicies: {
          reset,
          GET,
        },
      },
    } = this.props;

    const { loans } = this.state;

    if (!stripes.hasPerm(this.permissions.allRequests)) {
      return;
    }

    const q = loans.map(loan => {
      return `itemId==${loan.itemId}`;
    }).join(' or ');

    const query = `(${q}) and status==("Open - Awaiting pickup" or "Open - Not yet filled") sortby requestDate desc`;

    reset();
    GET({ params: { query } })
      .then((requestRecords) => {
        const requestCountObject = requestRecords.reduce((map, record) => {
          map[record.itemId] = map[record.itemId]
            ? ++map[record.itemId]
            : 1;

          return map;
        }, {});
        this.setState({ requestCounts: requestCountObject });
      });
  }

  fetchLoanPolicyNames() {
    const query = this.state.loans.map(loan => `id==${loan.loanPolicyId}`).join(' or ');
    const {
      mutator: {
        loanPolicies: {
          reset,
          GET,
        },
      },
    } = this.props;

    reset();
    GET({ params: { query } })
      .then((loanPolicies) => {
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
    const { checkedLoans } = this.state;
    const selectedLoans = Object.values(checkedLoans);
    const renewSuccess = [];
    const renewFailure = [];
    const bulkRenewal = (selectedLoans.length > 1);
    const errorMsg = {};
    const renewedLoans = selectedLoans.map((loan) => {
      return this.renew(loan)
        .then((renewedLoan) => renewSuccess.push(renewedLoan))
        .catch((error) => {
          renewFailure.push(loan);
          const stringErrorMessage = get(error, 'props.values.message.props.values.message', '');

          errorMsg[loan.id] = {
            ...error,
            ...isOverridePossible(stringErrorMessage),
          };
        });
    });

    this.setState({ errorMsg });

    // map(p => p.catch(e => e)) turns all rejections into resolved values for the promise.all to wait for everything to finish
    Promise.all(renewedLoans.map(p => p.catch(e => e)))
      .then(() => {
        const isOneFailed = isEmpty(renewSuccess) && renewFailure.length === 1;

        if (bulkRenewal || isOneFailed) {
          this.setState({
            renewSuccess,
            renewFailure,
            bulkRenewalDialogOpen: true
          });
        } else {
          this.showSingleRenewCallout(renewSuccess[0]);
        }
      });

    this.setState({ checkedLoans: {}, allChecked: false });
  };

  showRequestQueue = (loan, e) => {
    if (e) e.preventDefault();

    const q = {};
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

    Object.keys(query).forEach((k) => { q[k] = null; });

    q.query = get(loan, ['item', 'barcode']);
    q.filters = 'requestStatus.open - not yet filled,requestStatus.open - awaiting pickup';
    q.sort = 'Request Date';

    update({
      _path: '/requests',
      ...q,
    });
  };

  // eslint-disable-next-line consistent-return
  renew(loan) {
    const {
      user,
      renew,
      patronBlocks,
    } = this.props;

    const countRenews = patronBlocks.filter(a => a.renewals === true);

    if (isEmpty(countRenews)) {
      return renew(loan, user, true);
    }

    this.openPatronBlockedModal();
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
      activeLoan: null,
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

  feefine = (loan, e) => {
    const { onClickViewChargeFeeFine } = this.props;

    onClickViewChargeFeeFine(e, loan);
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
      loanPolicies,
      errorMsg,
      requestCounts,
      renewSuccess,
      renewFailure,
      bulkRenewalDialogOpen,
      activeLoan,
      changeDueDateDialogOpen,
      allChecked,
      patronBlockedModal,
    } = this.state;

    const {
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
      <TableModel
        patronBlockedModal={patronBlockedModal}
        onClosePatronBlockedModal={this.onClosePatronBlockedModal}
        openPatronBlockedModal={this.openPatronBlockedModal}
        patronBlocks={patronBlocks}
        patronGroup={patronGroup}
        buildRecords={buildRecords}
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
        feeFineCount={this.feeFineCount}
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
