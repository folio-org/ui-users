import React from 'react';
import {
  get,
  isEmpty,
} from 'lodash';
import PropTypes from 'prop-types';
import {
  injectIntl,
  FormattedMessage,
  FormattedNumber,
} from 'react-intl';

import { stripesShape } from '@folio/stripes/core';
import { NoValue } from '@folio/stripes/components';

import OpenLoans from '../../OpenLoans';
import Modals from '../Modals/Modals';
import OpenLoansSubHeader from '../OpenLoansSubHeader/OpenLoansSubHeader';
import getListDataFormatter from '../../helpers/getListDataFormatter';
import { refundClaimReturned } from '../../../../../constants';

class OpenLoansWithStaticData extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    stripes: stripesShape.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    activeLoan: PropTypes.string,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    patronBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
    requestRecords: PropTypes.arrayOf(PropTypes.object).isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.object).isRequired,
    possibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    resources: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
    checkedLoans: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    allChecked: PropTypes.bool.isRequired,
    patronBlockedModal: PropTypes.bool.isRequired,
    changeDueDateDialogOpen: PropTypes.bool.isRequired,
    toggleAll: PropTypes.func.isRequired,
    toggleItem: PropTypes.func.isRequired,
    buildRecords: PropTypes.func.isRequired,
    toggleColumn: PropTypes.func.isRequired,
    renewSelected: PropTypes.func.isRequired,
    isLoanChecked: PropTypes.func.isRequired,
    getLoanPolicy: PropTypes.func.isRequired,
    handleOptionsChange: PropTypes.func.isRequired,
    openPatronBlockedModal: PropTypes.func.isRequired,
    showChangeDueDateDialog: PropTypes.func.isRequired,
    hideChangeDueDateDialog: PropTypes.func.isRequired,
    onClosePatronBlockedModal: PropTypes.func.isRequired,
    feeFineCount: PropTypes.func.isRequired,
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      showBulkClaimReturnedModal: false,
    };
  }

  setFormatters() {
    const {
      intl: { formatMessage },
      toggleItem,
      isLoanChecked,
      requestRecords,
      requestCounts,
      resources,
      getLoanPolicy,
      handleOptionsChange,
      stripes,
      feeFineCount,
      user,
    } = this.props;

    this.tableData = getListDataFormatter(
      formatMessage,
      toggleItem,
      isLoanChecked,
      requestRecords,
      requestCounts,
      resources,
      getLoanPolicy,
      handleOptionsChange,
      stripes,
      this.getFeeFine,
      this.getContributorslist,
      feeFineCount,
      user,
    );

    this.sortMap = this.getSortMap();
    this.loanFormatter = this.getLoanFormatter();
    this.sortOrder = this.getSortOrder();
  }

  sortOrderKeys = [
    'title',
    'itemStatus',
    'dueDate',
    'requests',
    'barcode',
    'feefineIncurred',
    'callNumber',
    'contributors',
    'renewals',
    'loanPolicy',
    'location',
    'loanDate',
  ];

  getSortMap = () => {
    return this.sortOrderKeys.reduce((sortMap, key) => {
      const {
        view,
        sorter,
      } = this.tableData[key];

      sortMap[view] = sorter;

      return sortMap;
    }, {});
  };

  getSortOrder = () => {
    return this.sortOrderKeys.map(key => this.tableData[key].view);
  };

  getColumnMapping = () => {
    const { intl:{ formatMessage } } = this.props;
    return Object.keys(this.tableData).reduce(
      (columnMapping, objKey) => {
        const {
          view,
          key,
        } = this.tableData[objKey];

        if (view) {
          columnMapping[key] = view;
        } else if (key === '  ') {
          const {
            allChecked,
            toggleAll,
          } = this.props;

          columnMapping[key] = (
            <input
              type="checkbox"
              checked={allChecked}
              name="check-all"
              aria-label={formatMessage({ id: 'ui-users.loans.selectAllLoans' })}
              onChange={toggleAll}
            />
          );
        }
        return columnMapping;
      }, {}
    );
  };

  getLoanFormatter = () => {
    return Object.keys(this.tableData).reduce(
      (loanFormatter, objKey) => {
        const {
          formatter,
          key,
        } = this.tableData[objKey];

        loanFormatter[key] = formatter;

        return loanFormatter;
      }, {}
    );
  };

  getFeeFine = (loan) => {
    const { resources } = this.props;
    const accounts = get(resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    const suspendedStatus = accountsLoan.filter(a => a?.paymentStatus?.name === refundClaimReturned.PAYMENT_STATUS) || [];
    let amount = 0;

    accountsLoan.forEach(a => {
      amount += parseFloat(a.amount);
    });

    if (amount === 0) return <NoValue />;

    amount = <FormattedNumber value={amount} minimumFractionDigits={2} />;

    return (suspendedStatus.length > 0) ?
      <FormattedMessage id="ui-users.loans.details.accounts.suspended" values={{ amount }} />
      :
      amount;
  };

  getContributorslist = (loan) => {
    const contributors = get(loan, ['item', 'contributors']);
    const contributorsList = [];

    if (typeof contributors !== 'undefined') {
      Object.keys(contributors).forEach(contributor => contributorsList.push(`${contributors[contributor].name}, `));
    }

    return contributorsList;
  };

  onClickOpenBulkClaimReturned = () => {
    this.setState({ showBulkClaimReturnedModal: true });
  }

  onCancelBulkClaimReturned = () => {
    this.setState({ showBulkClaimReturnedModal: false });
  }

  render() {
    const {
      visibleColumns,
      checkedLoans,
      changeDueDateDialogOpen,
      loans,
      stripes,
      user,
      possibleColumns,
      hideChangeDueDateDialog,
      requestCounts,
      renewSelected,
      showChangeDueDateDialog,
      toggleColumn,
      buildRecords,
      patronBlocks,
      patronGroup,
      patronBlockedModal,
      onClosePatronBlockedModal,
      openPatronBlockedModal,
      activeLoan,
      isLoanChecked,
    } = this.props;
    const { showBulkClaimReturnedModal } = this.state;

    this.setFormatters();
    this.columnMapping = this.getColumnMapping();

    return (
      <>
        {!isEmpty(loans) &&
        <OpenLoansSubHeader
          loans={loans}
          user={user}
          patronBlocks={patronBlocks}
          columnMapping={this.columnMapping}
          checkedLoans={checkedLoans}
          visibleColumns={visibleColumns}
          renewSelected={renewSelected}
          toggleColumn={toggleColumn}
          showChangeDueDateDialog={showChangeDueDateDialog}
          buildRecords={buildRecords}
          openPatronBlockedModal={openPatronBlockedModal}
          openBulkClaimReturnedModal={this.onClickOpenBulkClaimReturned}
        />}
        <OpenLoans
          stripes={stripes}
          loans={loans}
          requestCounts={requestCounts}
          isLoanChecked={isLoanChecked}
          visibleColumns={visibleColumns}
          sortMap={this.sortMap}
          loanFormatter={this.loanFormatter}
          columnMapping={this.columnMapping}
          sortOrder={this.sortOrder}
          possibleColumns={possibleColumns}
          history={this.props.history}
          location={this.props.location}
          match={this.props.match}
        />
        <Modals
          user={user}
          loans={loans}
          stripes={stripes}
          activeLoan={activeLoan}
          patronGroup={patronGroup}
          patronBlocks={patronBlocks}
          checkedLoans={checkedLoans}
          patronBlockedModal={patronBlockedModal}
          openPatronBlockedModal={openPatronBlockedModal}
          renewSelected={renewSelected}
          changeDueDateDialogOpen={changeDueDateDialogOpen}
          hideChangeDueDateDialog={hideChangeDueDateDialog}
          onClosePatronBlockedModal={onClosePatronBlockedModal}
          showBulkClaimReturnedModal={showBulkClaimReturnedModal}
          onBulkClaimReturnedCancel={this.onCancelBulkClaimReturned}
          requestCounts={requestCounts}
        />
      </>
    );
  }
}

export default injectIntl(OpenLoansWithStaticData);
