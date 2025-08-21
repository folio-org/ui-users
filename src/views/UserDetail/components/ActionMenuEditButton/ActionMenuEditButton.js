import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { IfPermission } from '@folio/stripes/core';
import { Button, Icon } from '@folio/stripes/components';

import { shouldSuppress } from '../utils';

/**
 * actionMenuEditButton
 * Handle display of the "Edit" button in the Action menu.
 * Some users should not be editable in the UI; these are stored in a
 * serialized array in a configuration entry:
 * {
 *   "module": "@folio/users",
 *   "configName": "suppressEdit",
 *   "value": "SERIALIZED_JSON_ARRAY"
 * }
 *
 * This function checks the ID from the URL against that list.
 *
 * @returns component
 */
const ActionMenuEditButton = ({ id, suppressList, onToggle, goToEdit, editButton }) => {
  const suppress = shouldSuppress(suppressList, id);

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
  suppressList: PropTypes.shape({
    records: PropTypes.arrayOf(PropTypes.shape({}))
  }),
};

export default ActionMenuEditButton;
