import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  get,
  find,
} from 'lodash';
import {
  FormattedTime,
  FormattedDate,
  FormattedMessage,
} from 'react-intl';

import {
  Icon,
  MultiColumnList,
} from '@folio/stripes/components';

import getNewDueDate from './helpers/getNewDate';

class BulkOverrideLoansList extends Component {
  static propTypes = {
    height: PropTypes.number,
    stripes: PropTypes.shape({
      formatDateTime: PropTypes.func.isRequired,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }).isRequired,
      store: PropTypes.object.isRequired,
    }).isRequired,
    allChecked: PropTypes.bool.isRequired,
    loanPolicies: PropTypes.object.isRequired,
    errorMessages: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    toggleAll: PropTypes.func.isRequired,
    toggleItem: PropTypes.func.isRequired,
    isLoanChecked: PropTypes.func.isRequired,
    failedRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
    loanPoliciesRecords: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  static defaultProps = {
    height: 300,
  };

  constructor(props) {
    super(props);

    this.columnWidth = {
      '  ': 35,
      'currentDueDate': 100,
      'newDueDate': 100,
      'callNumber': 120
    };

    this.visibleColumns = [
      '  ',
      'renewalStatus',
      'newDueDate',
      'title',
      'itemStatus',
      'currentDueDate',
      'requestQueue',
      'barcode',
      'callNumber',
      'renewals',
      'loanPolicy',
    ];
  }

  newDueDateFormatter = loan => {
    const { loanPoliciesRecords } = this.props;
    const {
      loanPolicyId,
      dueDate,
    } = loan;

    const loanPolicy = find(loanPoliciesRecords, { id: loanPolicyId });
    const {
      renewable,
      loansPolicy: {
        period: {
          duration,
          intervalId,
        } = {}
      }
    } = loanPolicy;

    if (renewable) {
      const newDueDate = getNewDueDate(duration, intervalId, dueDate);

      return (
        <div>
          <FormattedDate value={newDueDate} />
          ,
          <FormattedTime value={newDueDate} />
        </div>
      );
    } else {
      return <FormattedMessage id="ui-users.override.emptyNewDueDate" />;
    }
  };

  render() {
    const {
      failedRenewals,
      height,
      toggleAll,
      isLoanChecked,
      toggleItem,
      errorMessages,
      requestCounts,
      loanPolicies,
      allChecked,
    } = this.props;

    return (
      <MultiColumnList
        interactive={false}
        height={height}
        contentData={failedRenewals}
        visibleColumns={this.visibleColumns}
        columnMapping={{
          '  ': (
            <input
              type="checkbox"
              checked={allChecked}
              name="check-all"
              onChange={toggleAll}
            />
          ),
          'renewalStatus': <FormattedMessage id="ui-users.brd.header.renewalStatus" />,
          'newDueDate': <FormattedMessage id="ui-users.brd.header.newDueDate" />,
          'title': <FormattedMessage id="ui-users.brd.header.title" />,
          'itemStatus': <FormattedMessage id="ui-users.loans.columns.itemStatus" />,
          'currentDueDate': <FormattedMessage id="ui-users.loans.columns.dueDate" />,
          'requestQueue': <FormattedMessage id="ui-users.loans.details.requests" />,
          'barcode': <FormattedMessage id="ui-users.information.barcode" />,
          'callNumber': <FormattedMessage id="ui-users.loans.details.callNumber" />,
          'renewals': <FormattedMessage id="ui-users.loans.columns.renewals" />,
          'loanPolicy': <FormattedMessage id="ui-users.loans.details.loanPolicy" />,
        }}
        formatter={{
          '  ': loan => (
            <input
              checked={isLoanChecked(loan.id)}
              onChange={e => toggleItem(e, loan)}
              type="checkbox"
            />
          ),
          'renewalStatus': loan => {
            return (errorMessages) ? (
              <div>
                <div>
                  <Icon
                    size="medium"
                    icon="validation-error"
                    status="warn"
                  />
                  <FormattedMessage id="ui-users.brd.failedRenewal" />
                </div>
                <div>
                  {errorMessages[loan.id]}
                </div>
              </div>
            ) : null;
          },
          'newDueDate': this.newDueDateFormatter,
          'title': loan => get(loan, ['item', 'title']),
          'itemStatus': loan => get(loan, ['item', 'status', 'name']),
          'currentDueDate': loan => (
            <div>
              <FormattedDate value={loan.dueDate} />
              ,
              <br />
              <FormattedTime value={loan.dueDate} />
            </div>
          ),
          'requestQueue': loan => requestCounts[loan.itemId] || 0,
          'barcode': loan => get(loan, ['item', 'barcode']),
          'callNumber': loan => get(loan, ['item', 'callNumber']),
          'renewals': loan => get(loan, 'renewalCount', 0),
          'loanPolicy': loan => loanPolicies[loan.loanPolicyId],
        }}
        columnWidths={this.columnWidth}
      />
    );
  }
}

export default BulkOverrideLoansList;
