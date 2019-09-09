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

import { stripesShape } from '@folio/stripes/core';

import OpenLoans from '../../OpenLoans';
import Modals from '../Modals/Modals';
import OpenLoansSubHeader from '../OpenLoansSubHeader/OpenLoansSubHeader';
import getListDataFormatter from '../../helpers/getListDataFormatter';

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
    getLoanPolicie: PropTypes.func.isRequired,
    handleOptionsChange: PropTypes.func.isRequired,
    openPatronBlockedModal: PropTypes.func.isRequired,
    showChangeDueDateDialog: PropTypes.func.isRequired,
    hideChangeDueDateDialog: PropTypes.func.isRequired,
    onClosePatronBlockedModal: PropTypes.func.isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    feeFineCount: PropTypes.number,
  };

  setFormatters() {
    const {
      intl: { formatMessage },
      toggleItem,
      isLoanChecked,
      requestRecords,
      requestCounts,
      resources,
      getLoanPolicie,
      handleOptionsChange,
      stripes,
      feeFineCount,
    } = this.props;

    this.tableData = getListDataFormatter(
      formatMessage,
      toggleItem,
      isLoanChecked,
      requestRecords,
      requestCounts,
      resources,
      getLoanPolicie,
      handleOptionsChange,
      stripes,
      this.getFeeFine,
      this.getContributorslist,
      feeFineCount,
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
      changeDueDateDialogOpen,
      loans,
      stripes,
      onClickViewLoanActionsHistory,
      user,
      possibleColumns,
      hideChangeDueDateDialog,
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
      requestCounts
    } = this.props;

    this.setFormatters();
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
          requestCounts={requestCounts}
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
          changeDueDateDialogOpen={changeDueDateDialogOpen}
          hideChangeDueDateDialog={hideChangeDueDateDialog}
          onClosePatronBlockedModal={onClosePatronBlockedModal}
        />
      </React.Fragment>
    );
  }
}

export default injectIntl(OpenLoansWithStaticData);
