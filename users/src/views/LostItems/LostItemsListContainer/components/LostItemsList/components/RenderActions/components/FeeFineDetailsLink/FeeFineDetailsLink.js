import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { get } from 'lodash';

import { Button } from '@folio/stripes/components';

import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  DEFAULT_VALUE, LOST_ITEM_STATUSES,
} from '../../../../../../../constants';

const FeeFineDetailsLink = ({
  actualCostRecord,
  isBilled,
  billedRecords,
}) => {
  let feeFineId;
  const history = useHistory();
  const status = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.STATUS], DEFAULT_VALUE);
  const userId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_ID], DEFAULT_VALUE);
  const isLinkEnabled = status === LOST_ITEM_STATUSES.BILLED || isBilled;

  if (status === LOST_ITEM_STATUSES.BILLED) {
    feeFineId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_ACCOUNT_ID], DEFAULT_VALUE);
  } else if (isBilled) {
    feeFineId = billedRecords.find(rec => rec.id === actualCostRecord.id).feeFineId;
  }

  const feeFineDetailsLink = `/users/${userId}/accounts/view/${feeFineId}`;
  const handleClick = () => {
    history.push(feeFineDetailsLink);
  };

  return (
    <Button
      data-testid="feeFineDetailsLink"
      buttonStyle="dropdownItem"
      onClick={handleClick}
      disabled={!isLinkEnabled}
    >
      <FormattedMessage id="ui-users.lostItems.list.columnName.action.feeFineDetails" />
    </Button>
  );
};

FeeFineDetailsLink.propTypes = {
  actualCostRecord: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    feeFine: PropTypes.shape({
      accountId: PropTypes.string,
    }).isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  isBilled: PropTypes.bool.isRequired,
  billedRecords: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    feeFineId: PropTypes.string,
  })),
};

export default FeeFineDetailsLink;
