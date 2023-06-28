import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import {
  isEmpty,
  isArray,
  omit,
  size,
} from 'lodash';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import { stripesShape } from '@folio/stripes/core';
import { LoadingView } from '@folio/stripes/components';

import {
  nav,
  getRenewalPatronBlocksFromPatronBlocks,
  formatDateAndTime,
} from '../../util';

import {
  withRenew,
  withDeclareLost,
  withClaimReturned,
  withMarkAsMissing,
} from '../../Wrappers';
import TableModel from './components/OpenLoansWithStaticData';

class OpenLoansControl extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
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
      loanAccount: PropTypes.object,
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
    location: PropTypes.object.isRequired,
    match: PropTypes.object,
    patronGroup: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    loanPolicies: PropTypes.object.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    patronBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
    renew: PropTypes.func.isRequired,
    declareLost: PropTypes.func.isRequired,
    claimReturned: PropTypes.func.isRequired,
    markAsMissing: PropTypes.func.isRequired,
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
      'feefineIncurred',
      'callNumber',
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
      'feefineIncurred',
      'callNumber',
      'Contributors',
      'renewals',
      'loanPolicy',
      'location',
      'loanDate',
    ];

    this.excludedDefault = [
      'loanDate',
      'Contributors',
      'location'
    ];

    this.state = {
      checkedLoans: {},
      allChecked: false,
      visibleColumns: this.controllableColumns
        .map(columnName => ({
          title: columnName,
          status: !this.excludedDefault.includes(columnName),
        })),
      patronBlockedModal: false,
      changeDueDateDialogOpen:false,
      activeLoan: null,
      renewing: false,
    };

    props.mutator.activeRecord.update({ user: props.user.id });

    this.permissions = { allRequests: 'ui-users.requests.all' };
  }

  toggleAll = e => {
    const { loans } = this.props;
    const checkedLoans = e.target.checked
      ? loans.reduce((memo, loan) => Object.assign(memo, { [loan.id]: loan }), {})
      : {};

    this.setState(({ allChecked }) => ({
      allChecked: !allChecked,
      checkedLoans
    }));
  };

  getLoanPolicy = policyId => {
    const { loanPolicies } = this.props;

    return loanPolicies[policyId];
  };

  isLoanChecked = id => {
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

  toggleColumn = e => {
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

  renewSelected = async (additionalInfo = '') => {
    const { checkedLoans } = this.state;
    const {
      renew,
      user,
    } = this.props;
    const selectedLoans = Object.values(checkedLoans);

    this.setState({ renewing: true });

    await renew(selectedLoans, user, additionalInfo);
    this.setState({ checkedLoans: {}, allChecked: false, renewing: false });
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

  handleOptionsChange = itemMeta => {
    const {
      loan,
      action,
      itemRequestCount,
    } = itemMeta;

    if (action && this[action]) {
      this[action](loan, itemRequestCount);
    }
  };

  renew = loan => {
    const {
      patronBlocks,
      renew,
      user,
    } = this.props;
    const countRenew = patronBlocks.filter(b => b.renewals === true || b.blockRenewals === true);

    if (isEmpty(countRenew)) {
      renew([loan], user);
    } else {
      this.setState({ checkedLoans: [loan] });
      this.openPatronBlockedModal();
    }
  };

  changeDueDate = loan => {
    this.setState({
      activeLoan: loan.id,
      changeDueDateDialogOpen: true,
    });
  };

  declareLost = (loan, itemRequestCount) => this.props.declareLost(loan, itemRequestCount);

  claimReturned = (loan, itemRequestCount) => this.props.claimReturned(loan, itemRequestCount);

  markAsMissing = (loan, itemRequestCount) => this.props.markAsMissing(loan, itemRequestCount);

  feefineDetails = (loan, e) => {
    const {
      resources,
      history,
      match: { params }
    } = this.props;
    const accounts = resources?.loanAccount?.records || [];
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];

    if (accountsLoan.length === 1) {
      nav.onClickViewAccountActionsHistory(e, { id: accountsLoan[0].id }, history, params);
    } else if (accountsLoan.length > 1) {
      const open = accountsLoan.filter(a => a.status.name === 'Open') || [];

      if (open.length === accountsLoan.length) {
        nav.onClickViewOpenAccounts(e, loan, history, params);
      } else if (open.length === 0) {
        nav.onClickViewClosedAccounts(e, loan, history, params);
      } else {
        nav.onClickViewAllAccounts(e, loan, history, params);
      }
    }
  };

  feeFineCount = loan => {
    const { resources } = this.props;
    const accounts = resources?.loanAccount?.records || [];
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    return accountsLoan.length;
  };

  parseContributors(record) {
    const { item } = record;
    // There is a small chance that the item object could be missing
    const contributors = item?.contributors;

    return contributors && isArray(contributors) ?
      {
        ...record,
        item: {
          ...item,
          contributors: contributors
            .map((currentContributor) => currentContributor.name)
            .join('; ')
        }
      } : record;
  }

  buildRecords = (records) => {
    const {
      intl: {
        formatTime,
      },
    } = this.props;

    return records.map(record => {
      const result = this.parseContributors(record);

      result.dueDate = formatDateAndTime(result.dueDate, formatTime);
      result.loanDate = formatDateAndTime(result.loanDate, formatTime);
      return result;
    });
  }

  render() {
    const {
      visibleColumns,
      checkedLoans,
      activeLoan,
      changeDueDateDialogOpen,
      allChecked,
      patronBlockedModal,
      renewing,
    } = this.state;

    const {
      requestCounts,
      loans,
      stripes,
      history,
      match,
      user,
      patronGroup,
      patronBlocks,
      resources,
      location,
    } = this.props;

    return (
      <div data-test-open-loans>
        {renewing
          ? <LoadingView data-test-form-page paneTitle={<FormattedMessage id="ui-users.renewInProgress" />} defaultWidth="100%" />
          : <TableModel
              patronBlockedModal={patronBlockedModal}
              onClosePatronBlockedModal={this.onClosePatronBlockedModal}
              openPatronBlockedModal={this.openPatronBlockedModal}
              patronBlocks={getRenewalPatronBlocksFromPatronBlocks(patronBlocks)}
              patronGroup={patronGroup}
              buildRecords={this.buildRecords}
              visibleColumns={visibleColumns}
              checkedLoans={checkedLoans}
              requestCounts={requestCounts}
              activeLoan={activeLoan}
              changeDueDateDialogOpen={changeDueDateDialogOpen}
              loans={loans}
              stripes={stripes}
              feeFineCount={this.feeFineCount}
              history={history}
              location={location}
              match={match}
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
        }
      </div>
    );
  }
}

export default compose(
  withRenew,
  withDeclareLost,
  withClaimReturned,
  withMarkAsMissing,
  injectIntl,
)(OpenLoansControl);
