import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { IfPermission } from '@folio/stripes/core';
import { Button, Icon } from '@folio/stripes/components';

/**
 * actionMenuEditButton
 * Handle display of the "Edit" button in the Action menu.
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
const ActionMenuEditButton = ({ id, suppressList, onToggle, goToEdit, editButton }) => {
  const suppress = suppressList?.includes(id);

  let button = <></>;
  if (!suppress) {
    button = (
      <IfPermission perm="ui-users.edit">
        <Button
          buttonStyle="dropdownItem"
          data-test-actions-menu-edit
          id="clickable-edituser"
          onClick={() => {
            onToggle();
            goToEdit();
          }}
          buttonRef={editButton}
        >
          <Icon icon="edit">
            <FormattedMessage id="ui-users.edit" />
          </Icon>
        </Button>
      </IfPermission>
    );
  }

  return button;
};

ActionMenuEditButton.propTypes = {
  editButton: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
  id: PropTypes.string,
  goToEdit: PropTypes.func,
  onToggle: PropTypes.func,
  suppressList: PropTypes.arrayOf(PropTypes.string),
};

export default ActionMenuEditButton;
