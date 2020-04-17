import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import {
  FormattedMessage,
  FormattedTime,
} from 'react-intl';

import {
  Icon,
  MultiColumnList,
} from '@folio/stripes/components';
import { effectiveCallNumber } from '@folio/stripes/util';

import css from './BulkRenewedLoansList.css';

const propTypes = {
  height: PropTypes.number,
  failedRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
  successRenewals: PropTypes.arrayOf(PropTypes.object).isRequired,
  requestCounts: PropTypes.object.isRequired,
  loanPolicies: PropTypes.object.isRequired,
  errorMessages: PropTypes.object.isRequired,
};

const defaultProps = {
  height: 300,
};

const BulkRenewedLoansList = (props) => {
  const {
    failedRenewals,
    successRenewals,
    height,
    errorMessages,
    requestCounts,
    loanPolicies,
  } = props;

  const visibleColumns = [
    'renewalStatus',
    'title',
    'itemStatus',
    'currentDueDate',
    'requestQueue',
    'barcode',
    'callNumber',
    'loanPolicy',
  ];

  return (
    <MultiColumnList
      interactive={false}
      height={height}
      contentData={[
        ...failedRenewals,
        ...successRenewals,
      ]}
      visibleColumns={visibleColumns}
      columnMapping={{
        renewalStatus: <FormattedMessage id="ui-users.brd.header.renewalStatus" />,
        title: <FormattedMessage id="ui-users.brd.header.title" />,
        itemStatus: <FormattedMessage id="ui-users.loans.columns.itemStatus" />,
        currentDueDate: <FormattedMessage id="ui-users.loans.columns.dueDate" />,
        requestQueue: <FormattedMessage id="ui-users.loans.details.requests" />,
        barcode: <FormattedMessage id="ui-users.information.barcode" />,
        callNumber: <FormattedMessage id="ui-users.loans.details.effectiveCallNumber" />,
        loanPolicy: <FormattedMessage id="ui-users.loans.details.loanPolicy" />,
      }}
      formatter={{
        renewalStatus: loan => {
          if (failedRenewals.filter(loanObject => loanObject.id === loan.id).length > 0) {
            const errorMessage = get(errorMessages[loan.id], 'props.values.message', '');

            return (errorMessages) ? (
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
                  {errorMessage}
                </div>
              </div>
            ) : null;
          } else {
            return (
              <span className={css.iconAlign}>
                <Icon
                  size="medium"
                  icon="check-circle"
                  status="success"
                />
                <FormattedMessage id="ui-users.brd.successfulRenewal" />
              </span>
            );
          }
        },
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
        callNumber: loan => (<div data-test-bulk-renew-call-numbers>{effectiveCallNumber(loan)}</div>),
        loanPolicy: loan => loanPolicies[loan.loanPolicyId],
      }}
      columnWidths={{
        currentDueDate: 100,
        callNumber: 120
      }}
    />
  );
};

BulkRenewedLoansList.defaultProps = defaultProps;
BulkRenewedLoansList.propTypes = propTypes;

export default BulkRenewedLoansList;
