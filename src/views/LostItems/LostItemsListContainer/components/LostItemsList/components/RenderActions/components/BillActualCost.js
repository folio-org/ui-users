import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button } from '@folio/stripes/components';

import {
  ACTUAL_COST_TYPES,
  BILL_AND_DO_NOT_BILL_ACTUAL_COST_PROP_TYPES,
} from '../../../../../../constants';

const BillActualCost = ({
  actualCostRecord,
  setActualCostModal,
  actualCost,
  setActualCost,
}) => {
  const onClick = () => {
    setActualCostModal({
      isOpen: true,
    });
    setActualCost({
      ...actualCost,
      type: ACTUAL_COST_TYPES.BILL,
      actualCostRecord,
    });
  };

  return (
    <Button
      data-testid="billActualCostButton"
      buttonStyle="dropdownItem"
      onClick={onClick}
    >
      <FormattedMessage id="ui-users.lostItems.list.columnName.action.bill" />
    </Button>
  );
};

BillActualCost.propTypes = BILL_AND_DO_NOT_BILL_ACTUAL_COST_PROP_TYPES;

export default BillActualCost;
