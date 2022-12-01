import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { IfPermission } from '@folio/stripes/core';
import { Button, Icon } from '@folio/stripes/components';

/**
 * ActionMenuDeleteButton
 * Handle display of the "Delete" button in the Action menu.
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
const ActionMenuDeleteButton = ({ id, suppressEdit, onToggle, handleDeleteClick }) => {
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
      <IfPermission perm="ui-users.delete,ui-users.opentransactions">
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
  suppressEdit: PropTypes.bool,
};

export default ActionMenuDeleteButton;
