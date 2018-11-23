import React from 'react';
import _ from 'lodash';
import {
  FormattedTime,
  FormattedDate,
} from 'react-intl';
import PropTypes from 'prop-types';

import { Callout } from '@folio/stripes/components';

import ActionsDropdown from '../ActionsDropdown/index';
import ContributorsView from '../ContributorsView/index';
import OpenLoansSubHeader from '../OpenLoansSubHeader/OpenLoansSubHeader';
import OpenLoans from '../../OpenLoans';
import Modals from '../Modals/Modals';

// can be implemented as class, should be discussed
class OpenLoansWithStaticData extends React.Component {
  static propTypes = {
    allChecked:PropTypes.bool.isRequired,
    toggleAll:PropTypes.func.isRequired,
    toggleItem:PropTypes.func.isRequired,
    isLoanChecked:PropTypes.func.isRequired,
    requestRecords:PropTypes.arrayOf(PropTypes.object).isRequired,
    resources:PropTypes.object.isRequired,
    getLoanPolicie:PropTypes.func.isRequired,
    handleOptionsChange:PropTypes.func.isRequired,
    checkedLoans: PropTypes.object.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.object).isRequired,
    possibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    renewSelected: PropTypes.func.isRequired,
    showChangeDueDateDialog: PropTypes.func.isRequired,
    toggleColumn: PropTypes.func.isRequired,
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
      formatDate: PropTypes.func.isRequired,
      formatDateTime: PropTypes.func.isRequired,
    }),
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    loanPolicies: PropTypes.object.isRequired,
    errorMsg: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    renewSuccess: PropTypes.arrayOf(PropTypes.object).isRequired,
    renewFailure: PropTypes.arrayOf(PropTypes.object).isRequired,
    bulkRenewalDialogOpen: PropTypes.bool.isRequired,
    changeDueDateDialogOpen: PropTypes.bool.isRequired,
    activeLoan: PropTypes.string,
    hideChangeDueDateDialog: PropTypes.func.isRequired,
    hideBulkRenewalDialog: PropTypes.func.isRequired,
    calloutRef: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.tableData = this.getTableData();
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
      const { view, sorter } = this.tableData[key];
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

  getFeeFine = (loan, resources) => {
    const accounts = _.get(resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    let remaining = 0;

    accountsLoan.forEach(a => {
      remaining += parseFloat(a.remaining);
    });

    return (remaining === 0) ? '-' : remaining.toFixed(2);
  };

  getContributorslist = (loan) => {
    const contributors = _.get(loan, ['item', 'contributors']);
    const contributorsList = [];

    if (typeof contributors !== 'undefined') {
      Object.keys(contributors).forEach(contributor => contributorsList.push(`${contributors[contributor].name}, `));
    } else {
      contributorsList.push('-');
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
    } = this.props;

    this.columnMapping = this.getColumnMapping();

    return (
      <React.Fragment>
        {!_.isEmpty(loans) &&
        <OpenLoansSubHeader
          loans={loans}
          columnMapping={this.columnMapping}
          checkedLoans={checkedLoans}
          visibleColumns={visibleColumns}
          renewSelected={renewSelected}
          toggleColumn={toggleColumn}
          showChangeDueDateDialog={showChangeDueDateDialog}
        />}
        <OpenLoans
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
          hideBulkRenewalDialog={hideBulkRenewalDialog}
        />
        <Callout ref={calloutRef} />
      </React.Fragment>
    );
  }

  getTableData() {
    const {
      stripes:{
        intl:{
          formatMessage
        }
      },
      toggleItem,
      isLoanChecked,
      requestRecords,
      requestCounts,
      resources,
      getLoanPolicie,
      handleOptionsChange,
    } = this.props;

    return {
      '  ' : {
        key : '  ',
        formatter: loan => (
          <input
            checked={isLoanChecked(loan.id)}
            onClick={e => toggleItem(e, loan)}
            onChange={e => toggleItem(e, loan)}
            type="checkbox"
          />
        ),
      },
      'title': {
        key: 'title',
        view: formatMessage({ id: 'ui-users.loans.columns.title' }),
        formatter:  loan => {
          const title = _.get(loan, ['item', 'title'], '');
          if (title) {
            const titleToDisplay = (title.length >= 77) ? `${title.substring(0, 77)}...` : title;
            return `${titleToDisplay} (${_.get(loan, ['item', 'materialType', 'name'])})`;
          }
          return '-';
        },
        sorter: loan => _.get(loan, ['item', 'title']),
      },
      'itemStatus': {
        key: 'itemStatus',
        view: formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
        formatter:  loan => `${_.get(loan, ['item', 'status', 'name'], '')}`,
        sorter: loan => _.get(loan, ['item', 'status', 'name'], ''),
      },
      'barcode': {
        key: 'barcode',
        view: formatMessage({ id: 'ui-users.loans.columns.barcode' }),
        formatter: loan => _.get(loan, ['item', 'barcode'], ''),
        sorter: loan => _.get(loan, ['item', 'barcode']),
      },
      'feefine': {
        key:'Fee/Fine',
        view: formatMessage({ id: 'ui-users.loans.columns.feefine' }),
        formatter: loan => this.getFeeFine(loan, resources),
        sorter: loan => this.getFeeFine(loan, resources),
      },
      'loanDate': {
        key:'loanDate',
        view: formatMessage({ id: 'ui-users.loans.columns.loanDate' }),
        formatter: loan => (<FormattedDate value={loan.loanDate} />),
        sorter: loan => loan.loanDate,
      },
      'requests': {
        key:'requests',
        view: formatMessage({ id: 'ui-users.loans.details.requests' }),
        formatter: (loan) => requestCounts[loan.itemId] || 0,
        sorter:  (loan) => requestCounts[loan.itemId] || 0,
      },
      'callNumber': {
        key:'Call number',
        view: formatMessage({ id: 'ui-users.loans.details.callNumber' }),
        formatter:  loan => _.get(loan, ['item', 'callNumber'], '-'),
        sorter: loan => _.get(loan, ['item', 'callNumber']),
      },
      'loanPolicy': {
        key:'loanPolicy',
        view: formatMessage({ id: 'ui-users.loans.details.loanPolicy' }),
        formatter: (loan) => getLoanPolicie(loan.loanPolicyId),
        sorter: loan => getLoanPolicie(loan.loanPolicyId),
      },
      'contributors': {
        key:'Contributors',
        view: formatMessage({ id: 'ui-users.loans.columns.contributors' }),
        formatter: (loan) => {
          // eslint-disable-next-line react/no-this-in-sfc
          return (<ContributorsView contributorsList={this.getContributorslist(loan)} />);
        },
        sorter: loan => {
          const contributorsList = this.getContributorslist(loan);
          return contributorsList.join(' ');
        },
      },
      'dueDate': {
        key:'dueDate',
        view: formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
        formatter: loan => (
          <div>
            <FormattedDate value={loan.dueDate} />
,
            <FormattedTime value={loan.dueDate} />
          </div>),
        sorter: loan => loan.dueDate,
      },
      'renewals': {
        key:'renewals',
        view: formatMessage({ id: 'ui-users.loans.columns.renewals' }),
        formatter: loan => loan.renewalCount || 0,
        sorter: loan => loan.renewalCount,
      },
      'location': {
        key:'location',
        view: formatMessage({ id: 'ui-users.loans.details.location' }),
        formatter: loan => `${_.get(loan, ['item', 'location', 'name'], '')}`,
        sorter: loan => _.get(loan, ['item', 'location', 'name'], ''),
      },
      ' ': {
        key: ' ',
        formatter: (loan) => {
          let requestQueue = false;

          if (requestRecords.length > 0) {
            requestRecords.forEach(r => {
              if (r.itemId === loan.itemId) requestQueue = true;
            });
          }
          return (
            <ActionsDropdown
              loan={loan}
              requestQueue={requestQueue}
              handleOptionsChange={handleOptionsChange}
            />
          );
        },
      }
    };
  }
}

export default OpenLoansWithStaticData;
