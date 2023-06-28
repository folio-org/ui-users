import React from 'react';
import PropTypes from 'prop-types';

import {
  FormattedMessage,
} from 'react-intl';
import {
  Button,
  Icon,
} from '@folio/stripes/components';
import {
  IfPermission,
} from '@folio/stripes/core';

import PermissionLabel from '../PermissionLabel';
import css from './PermissionsAccordion.css';

const PermissionsAccordionListItem = ({ item, index, fields, showPerms, permToDelete, changePermissions }) => {
  return (
    <li
      key={item.id}
      data-permission-name={`${item.permissionName}`}
    >
      <PermissionLabel permission={item} showRaw={showPerms} />
      <IfPermission perm={permToDelete}>
        <FormattedMessage id="ui-users.permissions.removePermission">
          {aria => (
            <Button
              buttonStyle="fieldControl"
              align="end"
              type="button"
              id={`clickable-remove-permission-${item.permissionName}`}
              onClick={() => {
                changePermissions(fields.value.filter((_, idx) => idx !== index));
              }}
              aria-label={`${aria}: ${item.permissionName}`}
            >
              <Icon
                icon="times-circle"
                iconClassName={css.removePermissionIcon}
                iconRootClass={css.removePermissionButton}
              />
            </Button>
          )}
        </FormattedMessage>
      </IfPermission>
    </li>
  );
};

PermissionsAccordionListItem.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  fields: PropTypes.object,
  showPerms: PropTypes.bool,
  permToDelete: PropTypes.string,
  changePermissions: PropTypes.func.isRequired,
};

export default PermissionsAccordionListItem;
