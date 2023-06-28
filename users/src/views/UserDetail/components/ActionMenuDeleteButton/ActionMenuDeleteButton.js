import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { IfPermission } from '@folio/stripes/core';
import { Button, Icon } from '@folio/stripes/components';

import { shouldSuppress } from '../utils';

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
const ActionMenuDeleteButton = ({ id, suppressList, onToggle, handleDeleteClick }) => {
  const suppress = shouldSuppress(suppressList, id);

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
  suppressList: PropTypes.shape({
    records: PropTypes.arrayOf(PropTypes.object)
  }),
};

export default ActionMenuDeleteButton;
