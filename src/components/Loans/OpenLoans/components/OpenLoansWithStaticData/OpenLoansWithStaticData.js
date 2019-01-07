import React from 'react';
import {
  get,
  isEmpty,
} from 'lodash';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
} from 'react-intl';

import { Callout } from '@folio/stripes/components';
import { stripesShape } from '@folio/stripes/core';

import OpenLoans from '../../OpenLoans';
import Modals from '../Modals/Modals';
import OpenLoansSubHeader from '../OpenLoansSubHeader/OpenLoansSubHeader';
import getListDataFormatter from '../../helpers/getListDataFormatter';

// can be implemented as class, should be discussed
class OpenLoansWithStaticData extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
    errorMsg: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    patronGroup: PropTypes.object.isRequired,
    loanPolicies: PropTypes.object.isRequired,
    checkedLoans: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    renewSuccess: PropTypes.arrayOf(PropTypes.object).isRequired,
    renewFailure: PropTypes.arrayOf(PropTypes.object).isRequired,
    allChecked: PropTypes.bool.isRequired,
    patronBlockedModal: PropTypes.bool.isRequired,
    bulkRenewalDialogOpen: PropTypes.bool.isRequired,
    changeDueDateDialogOpen: PropTypes.bool.isRequired,
    toggleAll: PropTypes.func.isRequired,
    toggleItem: PropTypes.func.isRequired,
    calloutRef: PropTypes.func.isRequired,
    buildRecords: PropTypes.func.isRequired,
    toggleColumn: PropTypes.func.isRequired,
    renewSelected: PropTypes.func.isRequired,
    isLoanChecked: PropTypes.func.isRequired,
    getLoanPolicie: PropTypes.func.isRequired,
    handleOptionsChange: PropTypes.func.isRequired,
    hideBulkRenewalDialog: PropTypes.func.isRequired,
    openPatronBlockedModal: PropTypes.func.isRequired,
    showChangeDueDateDialog: PropTypes.func.isRequired,
    hideChangeDueDateDialog: PropTypes.func.isRequired,
    onClosePatronBlockedModal: PropTypes.func.isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    feeFineCount: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.tableData = getListDataFormatter(
      props.intl.formatMessage,
      props.toggleItem,
      props.isLoanChecked,
      props.requestRecords,
      props.requestCounts,
      props.resources,
      props.getLoanPolicie,
      props.handleOptionsChange,
      props.stripes,
      this.getFeeFine,
      this.getContributorslist,
      props.feeFineCount,
    );

    this.callout = null;
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
    'feefine',
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
    let remaining = 0;

    accountsLoan.forEach(a => {
      remaining += parseFloat(a.remaining);
    });

    return (remaining === 0) ? '-' : remaining.toFixed(2);
  };

  getContributorslist = (loan) => {
    const contributors = get(loan, ['item', 'contributors']);
    const contributorsList = [];

    if (typeof contributors !== 'undefined') {
      Object.keys(contributors).forEach(contributor => contributorsList.push(`${contributors[contributor].name}, `));
    }

    return contributorsList;
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
      loans,
      stripes,
      onClickViewLoanActionsHistory,
      user,
      possibleColumns,
      hideChangeDueDateDialog,
      hideBulkRenewalDialog,
      renewSelected,
      showChangeDueDateDialog,
      toggleColumn,
      calloutRef,
      buildRecords,
      patronBlocks,
      patronGroup,
      patronBlockedModal,
      onClosePatronBlockedModal,
      openPatronBlockedModal,
    } = this.props;

    this.columnMapping = this.getColumnMapping();
    return (
      <React.Fragment>
        {!isEmpty(loans) &&
        <OpenLoansSubHeader
          loans={loans}
          patronBlocks={patronBlocks}
          columnMapping={this.columnMapping}
          checkedLoans={checkedLoans}
          visibleColumns={visibleColumns}
          renewSelected={renewSelected}
          toggleColumn={toggleColumn}
          showChangeDueDateDialog={showChangeDueDateDialog}
          buildRecords={buildRecords}
          openPatronBlockedModal={openPatronBlockedModal}
        />}
        <OpenLoans
          stripes={stripes}
          loans={loans}
          visibleColumns={visibleColumns}
          sortMap={this.sortMap}
          loanFormatter={this.loanFormatter}
          columnMapping={this.columnMapping}
          sortOrder={this.sortOrder}
          onClickViewLoanActionsHistory={onClickViewLoanActionsHistory}
          possibleColumns={possibleColumns}
        />
        <Modals
          patronBlocks={patronBlocks}
          patronBlockedModal={patronBlockedModal}
          patronGroup={patronGroup}
          stripes={stripes}
          loans={loans}
          user={user}
          loanPolicies={loanPolicies}
          errorMsg={errorMsg}
          requestCounts={requestCounts}
          renewSuccess={renewSuccess}
          renewFailure={renewFailure}
          bulkRenewalDialogOpen={bulkRenewalDialogOpen}
          changeDueDateDialogOpen={changeDueDateDialogOpen}
          activeLoan={activeLoan}
          checkedLoans={checkedLoans}
          hideChangeDueDateDialog={hideChangeDueDateDialog}
          onClosePatronBlockedModal={onClosePatronBlockedModal}
          hideBulkRenewalDialog={hideBulkRenewalDialog}
        />
        <Callout ref={calloutRef} />
      </React.Fragment>
    );
  }
}

export default injectIntl(OpenLoansWithStaticData);
