import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import { Button } from '@folio/stripes/components';

import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  DEFAULT_VALUE,
} from '../../../../../../constants';

const LoanDetailsLink = ({ actualCostRecord }) => {
  const userId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_ID], DEFAULT_VALUE);
  const loanId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOAN_ID], DEFAULT_VALUE);
  const isLoanDetailsLinkActive = userId && loanId;
  const loanDetailsLink = `/users/${userId}/loans/view/${loanId}`;

  return (
    <Button
      data-testid="loanDetailsLink"
      buttonStyle="dropdownItem"
      to={loanDetailsLink}
      disabled={!isLoanDetailsLinkActive}
    >
      <FormattedMessage id="ui-users.lostItems.list.columnName.action.loanDetails" />
    </Button>
  );
};

LoanDetailsLink.propTypes = {
  actualCostRecord: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    loan: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default LoanDetailsLink;
