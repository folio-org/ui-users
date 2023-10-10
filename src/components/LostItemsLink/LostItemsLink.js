import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

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

const LostItemsLink = ({ disabled }) => {
  const history = useHistory();

  return (
    <IfPermission perm="ui-users.lost-items.requiring-actual-cost">
      <Button
        data-testid="lostItemsLink"
        to={{
          pathname: '/users/lost-items',
          search: `?filters=${ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.STATUS]}.${LOST_ITEM_STATUSES.OPEN}`,
          state: {
            pathname: history?.location?.pathname,
            search: history?.location?.search,
          },
        }}
        disabled={disabled}
        buttonStyle="dropdownItem"
      >
        <Icon icon="edit">
          <FormattedMessage id="ui-users.actionMenu.lostItems" />
        </Icon>
      </Button>
    </IfPermission>
  );
};

LostItemsLink.propTypes = {
  disabled: PropTypes.bool,
};

LostItemsLink.defaultProps = {
  disabled: false,
};

export default LostItemsLink;
