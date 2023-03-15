import React from 'react';
import PropTypes from 'prop-types';

import {
  Dropdown,
  DropdownMenu,
  IconButton,
} from '@folio/stripes/components';

import {
  BillActualCost,
  DoNotBillActualCost,
  ItemDetailsLink,
  LoanDetailsLink,
  PatronDetailsLink,
} from './components';
import {
  ACTUAL_COST_PROP_TYPES,
  LOST_ITEM_STATUSES,
} from '../../../../../constants';
import { getRecordStatus } from '../../util';

const RenderActions = ({
  actualCostRecord,
  setActualCostModal,
  actualCost,
  setActualCost,
  billedRecords,
  cancelledRecords,
}) => {
  const isNotOpenStatus = actualCostRecord.status !== LOST_ITEM_STATUSES.OPEN;
  const {
    isBilled,
    isCancelled,
  } = getRecordStatus(actualCostRecord.id, billedRecords, cancelledRecords);
  const isBillButtonDisabled = isNotOpenStatus || isBilled || isCancelled;

  return (
    <Dropdown
      data-testid="lostItemsListActionsDropdown"
      renderTrigger={({ getTriggerProps }) => (
        <IconButton
          icon="ellipsis"
          {...getTriggerProps()}
        />
      )}
    >
      <DropdownMenu
        data-role="menu"
        data-testid="lostItemsListActionsDropdownMenu"
      >
        <BillActualCost
          actualCostRecord={actualCostRecord}
          setActualCostModal={setActualCostModal}
          actualCost={actualCost}
          setActualCost={setActualCost}
          disabled={isBillButtonDisabled}
        />
        <DoNotBillActualCost
          actualCostRecord={actualCostRecord}
          setActualCostModal={setActualCostModal}
          actualCost={actualCost}
          setActualCost={setActualCost}
          disabled={isBillButtonDisabled}
        />
        <PatronDetailsLink actualCostRecord={actualCostRecord} />
        <LoanDetailsLink actualCostRecord={actualCostRecord} />
        <ItemDetailsLink actualCostRecord={actualCostRecord} />
      </DropdownMenu>
    </Dropdown>
  );
};

RenderActions.propTypes = {
  setActualCostModal: PropTypes.func.isRequired,
  actualCostRecord: PropTypes.shape({
    status: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string,
      middleName: PropTypes.string,
    }).isRequired,
    loan: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    item: PropTypes.shape({
      id: PropTypes.string.isRequired,
      materialType: PropTypes.string.isRequired,
      holdingsRecordId: PropTypes.string.isRequired,
    }).isRequired,
    feeFine: PropTypes.shape({
      owner: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    instance: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  actualCost: ACTUAL_COST_PROP_TYPES,
  setActualCost: PropTypes.func.isRequired,
  billedRecords: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    billedAmount: PropTypes.string,
  })).isRequired,
  cancelledRecords: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RenderActions;
