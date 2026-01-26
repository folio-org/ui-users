import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { IfPermission } from '@folio/stripes/core';
import { Button, Icon } from '@folio/stripes/components';

/**
 * ActionMenuDeleteButton
 * Handle display of the "Delete" button in the Action menu.
 * Some users should not be editable in the UI:
 * {
 *   "scope": "mod-users",
 *   "key": "suppressEdit",
 *   "value": [user-id-1, user-id-2, ...]
 * }
 *
 * This function checks the ID from the URL against that list.
 *
 * @returns component
 */
const ActionMenuDeleteButton = ({ id, suppressList, onToggle, handleDeleteClick }) => {
  const suppress = suppressList?.includes(id);

  let button = <></>;
  if (!suppress) {
    button = (
      <IfPermission perm="ui-users.delete,ui-users.open-transactions.view">
        <Button
          buttonStyle="dropdownItem"
          data-test-actions-menu-check-delete
          id="clickable-checkdeleteuser"
          onClick={() => {
            handleDeleteClick();
            onToggle();
          }}
        >
          <Icon icon="trash">
            <FormattedMessage id="ui-users.details.checkDelete" />
          </Icon>
        </Button>
      </IfPermission>
    );
  }

  return button;
};

ActionMenuDeleteButton.propTypes = {
  handleDeleteClick: PropTypes.func,
  id: PropTypes.string,
  onToggle: PropTypes.func,
  suppressList: PropTypes.arrayOf(PropTypes.string),
};

export default ActionMenuDeleteButton;
