import { FormattedMessage } from 'react-intl';

import { IfPermission } from '@folio/stripes/core';
import {
  Button,
  Icon,
} from '@folio/stripes/components';

import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  LOST_ITEM_STATUSES,
} from '../../views/LostItems/constants';

const LostItemsLink = () => {
  const lostItemsLink = `/users/lost-items?filters=${ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.STATUS]}.${LOST_ITEM_STATUSES.OPEN}`;

  return (
    <IfPermission perm="ui-users.lost-items.requiring-actual-cost">
      <Button
        data-testid="lostItemsLink"
        to={lostItemsLink}
        buttonStyle="dropdownItem"
      >
        <Icon icon="edit">
          <FormattedMessage id="ui-users.actionMenu.lostItems" />
        </Icon>
      </Button>
    </IfPermission>
  );
};

export default LostItemsLink;
