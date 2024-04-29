import React from 'react';
import { FormattedMessage } from 'react-intl';

const filtersConfig = {
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
      value: false,
    },
  ],
  filter(roles, filters, assignedRoleIds) {
    const {
      [`${this.name}.${this.values[0].name}`]: showAssigned,
      [`${this.name}.${this.values[1].name}`]: showUnassigned,
    } = filters;

    return roles.filter(({ id }) => {
      const permissionAssigned = assignedRoleIds.includes(id);

      return (
        (showUnassigned && !permissionAssigned && !showAssigned)
          || (!showUnassigned && permissionAssigned && showAssigned)
          || (showUnassigned && showAssigned)
          || !Object.keys(filters).some((key) => (key.startsWith(this.name)))
      );
    });
  }
};

export default filtersConfig;
