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

const ItemDetailsLink = ({ actualCostRecord }) => {
  const itemId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.ITEM_ID], DEFAULT_VALUE);
  const instanceId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_ID], DEFAULT_VALUE);
  const holdingsRecordId = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.HOLDINGS_RECORD_ID], DEFAULT_VALUE);
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

export default ItemDetailsLink;
