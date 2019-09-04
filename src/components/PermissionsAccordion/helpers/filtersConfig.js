import React from 'react';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

export const permissionTypeFilterConfig = {
  label: (<FormattedMessage id="ui-users.permissions.modal.filter.permissionType.label" />),
  name: 'permissionType',
  cql: 'permissionType',
  values: [
    {
      displayName: <FormattedMessage id="ui-users.permissions.modal.filter.permissionType.permissionSets" />,
      name: 'permissionSets',
      cql: 'permissionSets',
      value: false,
    },
    {
      displayName: <FormattedMessage id="ui-users.permissions.modal.filter.permissionType.basePermissions" />,
      name: 'basePermissions',
      cql: 'basePermissions',
      value: false,
    },
  ],
  filter(permissions, filters) {
    const {
      [`${this.name}.${this.values[0].name}`]: showPermissionSets,
      [`${this.name}.${this.values[1].name}`]: showBasePermissions,
    } = filters;

    return permissions.filter(({ mutable, subPermissions }) => {
      const isBasePermission = !mutable && isEmpty(subPermissions);

      return (
        (showPermissionSets && !isBasePermission && !showBasePermissions)
          || (!showPermissionSets && isBasePermission && showBasePermissions)
          || (showPermissionSets && showBasePermissions)
          || !Object.keys(filters).some((key) => (key.startsWith(this.name)))
      );
    });
  }
};

export const statusFilterConfig = {
  label: (<FormattedMessage id="ui-users.permissions.modal.filter.status.label" />),
  name: 'status',
  cql: 'status',
  values: [
    {
      displayName: <FormattedMessage id="ui-users.permissions.modal.assigned" />,
      name: 'assigned',
      cql: 'assigned',
      value: false,
    },
    {
      displayName: <FormattedMessage id="ui-users.permissions.modal.unassigned" />,
      name: 'unassigned',
      cql: 'unassigned',
      value: true,
    },
  ],
  filter(permissions, filters, assignedPermissionIds) {
    const {
      [`${this.name}.${this.values[0].name}`]: showAssigned,
      [`${this.name}.${this.values[1].name}`]: showUnassigned,
    } = filters;

    return permissions.filter(({ id }) => {
      const permissionAssigned = assignedPermissionIds.includes(id);

      return (
        (showUnassigned && !permissionAssigned && !showAssigned)
          || (!showUnassigned && permissionAssigned && showAssigned)
          || (showUnassigned && showAssigned)
          || !Object.keys(filters).some((key) => (key.startsWith(this.name)))
      );
    });
  }
};
