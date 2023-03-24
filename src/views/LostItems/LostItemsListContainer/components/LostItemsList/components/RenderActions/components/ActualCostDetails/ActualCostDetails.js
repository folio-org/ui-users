import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button } from '@folio/stripes/components';

import {
  ACTUAL_COST_DETAILS_PROP_TYPES,
} from '../../../../../../../constants';

const ActualCostDetails = ({
  actualCostRecord,
  actualCostRecord: {
    additionalInfoForPatron,
    additionalInfoForStaff,
    feefine,
  },
  actualCost,
  setActualCost,
  setActualCostDetailsModal,
  disabled,
}) => {
  const onClick = () => {
    setActualCostDetailsModal({
      isOpen: true,
    });
    setActualCost({
      ...actualCost,
      actualCostRecord,
      additionalInfo: {
        actualCostToBill: feefine?.billedAmount,
        additionalInformationForPatron: additionalInfoForPatron,
        additionalInformationForStaff: additionalInfoForStaff,
      }
    });
  };

  return (
    <Button
      data-testid="actualCostDetailsButton"
      buttonStyle="dropdownItem"
      onClick={onClick}
      disabled={disabled}
    >
      <FormattedMessage id="ui-users.lostItems.list.columnName.action.actualCostDetails" />
    </Button>
  );
};

ActualCostDetails.propTypes = ACTUAL_COST_DETAILS_PROP_TYPES;

export default ActualCostDetails;
