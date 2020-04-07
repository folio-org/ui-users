import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import {
  FormattedTime,
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import {
  Icon,
  MultiColumnList,
} from '@folio/stripes/components';
import { effectiveCallNumber } from '@folio/stripes/util';

class BulkOverrideLoansList extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    height: PropTypes.number,
    allChecked: PropTypes.bool.isRequired,
    loanPolicies: PropTypes.object.isRequired,
    errorMessages: PropTypes.object.isRequired,
    requestCounts: PropTypes.object.isRequired,
    toggleAll: PropTypes.func.isRequired,
    toggleItem: PropTypes.func.isRequired,
    isLoanChecked: PropTypes.func.isRequired,
    failedRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  static defaultProps = {
    height: 300,
  };

  constructor(props) {
    super(props);

    this.columnWidth = {
      'isChecked': 35,
      'currentDueDate': 100,
      'newDueDate': 100,
      'callNumber': 120
    };

    this.visibleColumns = [
      'isChecked',
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

  newDueDateFormatter = ({ autoNewDueDate }) => (
    <FormattedMessage id={`ui-users.override.${
      autoNewDueDate
        ? 'autoNewDueDate'
        : 'emptyNewDueDate'
    }`}
    />
  );

  getShortErrorMessage = (errorMessage) => {
    return get(errorMessage, 'props.values.message', '');
  };

  rowUpdater = ({ id }) => {
    const { isLoanChecked } = this.props;

    return isLoanChecked(id);
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
      intl: {
        formatMessage
      },
    } = this.props;

    return (
      <MultiColumnList
        interactive={false}
        height={height}
        contentData={failedRenewals}
        visibleColumns={this.visibleColumns}
        columnMapping={{
          isChecked: (
            <input
              type="checkbox"
              checked={allChecked}
              name="check-all"
              onChange={toggleAll}
            />
          ),
          renewalStatus: formatMessage({ id: 'ui-users.brd.header.renewalStatus' }),
          newDueDate:  formatMessage({ id: 'ui-users.brd.header.newDueDate' }),
          title:  formatMessage({ id: 'ui-users.brd.header.title' }),
          itemStatus:  formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
          currentDueDate:  formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
          requestQueue:  formatMessage({ id: 'ui-users.loans.details.requests' }),
          barcode:  formatMessage({ id: 'ui-users.information.barcode' }),
          callNumber:  formatMessage({ id: 'ui-users.loans.details.effectiveCallNumber' }),
          renewals:  formatMessage({ id: 'ui-users.loans.columns.renewals' }),
          loanPolicy:  formatMessage({ id: 'ui-users.loans.details.loanPolicy' }),
        }}
        formatter={{
          isChecked: loan => (
            <input
              checked={isLoanChecked(loan.id)}
              onChange={e => toggleItem(e, loan)}
              type="checkbox"
            />
          ),
          renewalStatus: loan => {
            return (
              errorMessages &&
              <div>
                <div>
                  <Icon
                    size="medium"
                    icon="exclamation-circle"
                    status="warn"
                  />
                  <FormattedMessage id="ui-users.brd.failedRenewal">
                    {message => `${message}:`}
                  </FormattedMessage>
                </div>
                <div>
                  {this.getShortErrorMessage(errorMessages[loan.id])}
                </div>
              </div>
            );
          },
          newDueDate: this.newDueDateFormatter,
          title: loan => get(loan, ['item', 'title']),
          itemStatus: loan => get(loan, ['item', 'status', 'name']),
          currentDueDate: loan => (
            <FormattedTime
              value={get(loan, ['dueDate'])}
              day="numeric"
              month="numeric"
              year="numeric"
            />
          ),
          requestQueue: loan => requestCounts[loan.itemId] || 0,
          barcode: loan => get(loan, ['item', 'barcode']),
          callNumber: loan => (<div data-test-bulk-override-call-numbers>{effectiveCallNumber(loan)}</div>),
          renewals: loan => get(loan, 'renewalCount', 0),
          loanPolicy: loan => loanPolicies[loan.loanPolicyId],
        }}
        columnWidths={this.columnWidth}
        rowUpdater={this.rowUpdater}
      />
    );
  }
}

export default injectIntl(BulkOverrideLoansList);
