import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import Popover from '@folio/stripes-components/lib/Popover';
import Icon from '@folio/stripes-components/lib/Icon';

import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';

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
        renewalStatus: formatMessage({ id: 'stripes-smart-components.brd.header.renewalStatus' }),
        title: formatMessage({ id: 'stripes-smart-components.cddd.header.title' }),
        itemStatus: formatMessage({ id: 'stripes-smart-components.cddd.header.itemStatus' }),
        currentDueDate: formatMessage({ id: 'stripes-smart-components.brd.header.dueDate' }),
        requestQueue: formatMessage({ id: 'stripes-smart-components.cddd.header.requestQueue' }),
        barcode: formatMessage({ id: 'stripes-smart-components.cddd.header.barcode' }),
        callNumber: formatMessage({ id: 'stripes-smart-components.cddd.header.callNumber' }),
        loanPolicy: formatMessage({ id: 'stripes-smart-components.cddd.header.loanPolicy' }),
      }}
      formatter={{
        renewalStatus: loan => {
          if (failedRenewals.filter(loanObject => loanObject.id === loan.id).length > 0) {
            return (props.errorMessages) ? (
              <Popover position="top" alignment="end">
                <span style={{ ...iconAlignStyle, ...pointerStyle }} data-role="target">
                  <Icon size="medium" icon="validation-error" color="red" />
                  <FormattedMessage id="stripes-smart-components.brd.failedRenewal" />
                </span>
                <p data-role="popover">{props.errorMessages[loan.id]}</p>
              </Popover>
            ) : null;
          } else {
            return (
              <span style={iconAlignStyle}>
                <Icon size="medium" icon="validation-check" color="green" />
                <FormattedMessage id="stripes-smart-components.brd.successfulRenewal" />
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
