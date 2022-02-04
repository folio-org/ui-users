import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Button } from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';

const ItemDetailsOption = ({ loan }) => {
  const itemDetailsLink = `/inventory/view/${loan.item?.instanceId}/${loan.item?.holdingsRecordId}/${loan.itemId}`;

  return loan.item?.instanceId ? (
    <IfPermission perm="inventory.items.item.get">
      <Button
        buttonStyle="dropdownItem"
        to={itemDetailsLink}
      >
        <FormattedMessage id="ui-users.itemDetails" />
      </Button>
    </IfPermission>
  )
    :
    <></>;
};

ItemDetailsOption.propTypes = {
  loan: PropTypes.shape({
    item: PropTypes.shape({
      instanceId: PropTypes.string,
      holdingsRecordId: PropTypes.string,
    }),
    itemId: PropTypes.string,
  })
};


export default ItemDetailsOption;
