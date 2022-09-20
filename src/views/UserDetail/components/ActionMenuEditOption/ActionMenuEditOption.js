import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { IfPermission } from '@folio/stripes/core';
import { Button, Icon } from '@folio/stripes/components';

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
const ActionMenuEditButton = ({ id, suppressEdit, onToggle, goToEdit, editButton }) => {
  let suppress = false;
  if (suppressEdit?.records?.[0]) {
    try {
      const value = suppressEdit?.records?.[0]?.value;
      if (value) {
        const list = JSON.parse(value);
        if (Array.isArray(list)) {
          suppress = !!list.find(i => i === id);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`could not parse JSON: ${suppressEdit?.records?.[0]}`, e);
    }
  }

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
  suppressEdit: PropTypes.bool,
};

export default ActionMenuEditButton;
