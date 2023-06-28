import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button } from '@folio/stripes/components';

import {
  ACTUAL_COST_TYPES,
  BILL_AND_DO_NOT_BILL_ACTUAL_COST_PROP_TYPES,
} from '../../../../../../../constants';

const DoNotBillActualCost = ({
  actualCostRecord,
  setActualCostModal,
  actualCost,
  setActualCost,
  disabled,
}) => {
  const onClick = () => {
    setActualCostModal({
      isOpen: true,
    });
    setActualCost({
      ...actualCost,
      type: ACTUAL_COST_TYPES.DO_NOT_BILL,
      actualCostRecord,
    });
  };

  return (
    <Button
      data-testid="doNotBillActualCostButton"
      buttonStyle="dropdownItem"
      onClick={onClick}
      disabled={disabled}
    >
      <FormattedMessage id="ui-users.lostItems.list.columnName.action.doNotBill" />
    </Button>
  );
};

DoNotBillActualCost.propTypes = BILL_AND_DO_NOT_BILL_ACTUAL_COST_PROP_TYPES;

export default DoNotBillActualCost;
