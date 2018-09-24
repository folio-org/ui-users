import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { Popover } from '@folio/stripes/components';
import { Icon } from '@folio/stripes/components';

import { MultiColumnList } from '@folio/stripes/components';

const propTypes = {
  stripes: PropTypes.shape({
    formatDateTime: PropTypes.func.isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }),
  }),
  failedRenewals: PropTypes.arrayOf(PropTypes.object),
  successRenewals: PropTypes.arrayOf(PropTypes.object),
  requestCounts: PropTypes.object,
  height: PropTypes.number,
  loanPolicies: PropTypes.object,
  errorMessages: PropTypes.object,
};

const defaultProps = {
  height: 300,
};

const BulkRenewedLoansList = (props) => {
  const { formatMessage } = props.stripes.intl;
  const { stripes, failedRenewals, successRenewals } = props;
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
      height={props.height}
      contentData={[...failedRenewals, ...successRenewals]}
      visibleColumns={visibleColumns}
      columnMapping={{
        renewalStatus: formatMessage({ id: 'ui-users.brd.header.renewalStatus' }),
        title: formatMessage({ id: 'ui-users.brd.header.title' }),
        itemStatus: formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
        currentDueDate: formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
        requestQueue: formatMessage({ id: 'ui-users.loans.details.requests' }),
        barcode: formatMessage({ id: 'ui-users.information.barcode' }),
        callNumber: formatMessage({ id: 'ui-users.loans.details.callNumber' }),
        loanPolicy: formatMessage({ id: 'ui-users.loans.details.loanPolicy' }),
      }}
      formatter={{
        renewalStatus: loan => {
          if (failedRenewals.filter(loanObject => loanObject.id === loan.id).length > 0) {
            return (props.errorMessages) ? (
              <Popover position="bottom" alignment="start">
                <span style={{ ...iconAlignStyle, ...pointerStyle }} data-role="target">
                  <Icon size="medium" icon="validation-error" status="warn" />
                  <FormattedMessage id="ui-users.brd.failedRenewal" />
                </span>
                <p data-role="popover" style={popoverStyle}>{props.errorMessages[loan.id]}</p>
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
        currentDueDate: loan => stripes.formatDateTime(get(loan, ['dueDate'])),
        requestQueue: loan => props.requestCounts[loan.itemId] || 0,
        barcode: loan => get(loan, ['item', 'barcode']),
        callNumber: loan => get(loan, ['item', 'callNumber']),
        loanPolicy: loan => props.loanPolicies[loan.loanPolicyId],
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
