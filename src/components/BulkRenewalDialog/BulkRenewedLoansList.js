import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import {
  Icon,
  MultiColumnList,
  Popover,
} from '@folio/stripes/components';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
  intlShape,
} from 'react-intl';

const propTypes = {
  failedRenewals: PropTypes.arrayOf(PropTypes.object),
  successRenewals: PropTypes.arrayOf(PropTypes.object),
  requestCounts: PropTypes.object,
  height: PropTypes.number,
  loanPolicies: PropTypes.object,
  errorMessages: PropTypes.object,
  intl: intlShape.isRequired,
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
    intl,
  } = props;
  const iconAlignStyle = { display: 'flex', alignItems: 'center' };
  const pointerStyle = { cursor: 'pointer' };
  const popoverStyle = { maxWidth: '300px', textAlign: 'justify' };

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
      contentData={[...failedRenewals, ...successRenewals]}
      visibleColumns={visibleColumns}
      columnMapping={{
        renewalStatus: intl.formatMessage({ id: 'ui-users.brd.header.renewalStatus' }),
        title: intl.formatMessage({ id: 'ui-users.brd.header.title' }),
        itemStatus: intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
        currentDueDate: intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
        requestQueue: intl.formatMessage({ id: 'ui-users.loans.details.requests' }),
        barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
        callNumber: intl.formatMessage({ id: 'ui-users.loans.details.callNumber' }),
        loanPolicy: intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' }),
      }}
      formatter={{
        renewalStatus: loan => {
          if (failedRenewals.filter(loanObject => loanObject.id === loan.id).length > 0) {
            return (errorMessages) ? (
              <Popover position="bottom" alignment="start">
                <span style={{ ...iconAlignStyle, ...pointerStyle }} data-role="target">
                  <Icon size="medium" icon="validation-error" status="warn" />
                  <FormattedMessage id="ui-users.brd.failedRenewal" />
                </span>
                <p data-role="popover" style={popoverStyle}>{errorMessages[loan.id]}</p>
              </Popover>
            ) : null;
          } else {
            return (
              <span style={iconAlignStyle}>
                <Icon size="medium" icon="validation-check" status="success" />
                <FormattedMessage id="ui-users.brd.successfulRenewal" />
              </span>
            );
          }
        },
        title: loan => get(loan, ['item', 'title']),
        itemStatus: loan => get(loan, ['item', 'status', 'name']),
        currentDueDate: loan => <FormattedTime value={get(loan, ['dueDate'])} day="numeric" month="numeric" year="numeric" />,
        requestQueue: loan => requestCounts[loan.itemId] || 0,
        barcode: loan => get(loan, ['item', 'barcode']),
        callNumber: loan => get(loan, ['item', 'callNumber']),
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

export default injectIntl(BulkRenewedLoansList);
