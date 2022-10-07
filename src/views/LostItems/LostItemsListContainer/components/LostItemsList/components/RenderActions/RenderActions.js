import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';
import {
  get,
} from 'lodash';

import {
  Button,
  Dropdown,
  DropdownMenu,
  IconButton,
} from '@folio/stripes/components';

import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
} from '../../../../../constants';

const PatronDetailsLink = ({ actualCostRecord }) => {
  const userId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_ID], '');
  const isPatronDetailsLinkActive = userId;
  const patronDetailsLink = `/users/preview/${userId}`;

  return (
    <Button
      data-testid="patronDetailsLink"
      buttonStyle="dropdownItem"
      to={patronDetailsLink}
      disabled={!isPatronDetailsLinkActive}
    >
      <FormattedMessage id="ui-users.lostItems.list.columnName.action.patronDetails" />
    </Button>
  );
};

PatronDetailsLink.propTypes = {
  actualCostRecord: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const LoanDetailsLink = ({ actualCostRecord }) => {
  const userId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_ID], '');
  const loanId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.LOAN_ID], '');
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

const ItemDetailsLink = ({ actualCostRecord }) => {
  const itemId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.ITEM_ID], '');
  const instanceId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_ID], '');
  const holdingsRecordId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.HOLDINGS_RECORD_ID], '');
  const isItemDetailsLinkActive = itemId && instanceId && holdingsRecordId;
  const itemDetailsLink = `/inventory/view/${instanceId}/${holdingsRecordId}/${itemId}`;

  return (
    <Button
      data-testid="itemDetailsLink"
      buttonStyle="dropdownItem"
      to={itemDetailsLink}
      disabled={!isItemDetailsLinkActive}
    >
      <FormattedMessage id="ui-users.lostItems.list.columnName.action.itemDetails" />
    </Button>
  );
};

ItemDetailsLink.propTypes = {
  actualCostRecord: PropTypes.shape({
    item: PropTypes.shape({
      id: PropTypes.string.isRequired,
      holdingsRecordId: PropTypes.string.isRequired,
    }).isRequired,
    instance: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const RenderActions = ({ actualCostRecord }) => {
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
        <PatronDetailsLink actualCostRecord={actualCostRecord} />
        <LoanDetailsLink actualCostRecord={actualCostRecord} />
        <ItemDetailsLink actualCostRecord={actualCostRecord} />
      </DropdownMenu>
    </Dropdown>
  );
};

RenderActions.propTypes = {
  actualCostRecord: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    loan: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    item: PropTypes.shape({
      id: PropTypes.string.isRequired,
      holdingsRecordId: PropTypes.string.isRequired,
    }).isRequired,
    instance: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default RenderActions;
