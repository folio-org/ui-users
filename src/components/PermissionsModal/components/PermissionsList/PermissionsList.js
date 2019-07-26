import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  MultiColumnList
} from '@folio/stripes/components';
import CheckBoxColumn from '../CheckboxColumn';
import { sortOrders } from '../../constants';

const PermissionsList = (props) => {
  const {
    sortedPermissions,
    subPermissionsIds,
    toggleAllPermissions,
    togglePermission,
    onHeaderClick,
    sortOrder,
    sortedColumn,
    allChecked,
  } = props;
  return (
    <MultiColumnList
      columnWidths={{
        selected: '35',
        status: '20%',
      }}
      visibleColumns={
        [
          'selected',
          'permissionName',
          'status',
        ]
      }
      contentData={sortedPermissions}
      columnMapping={{
        selected:
          (
            <CheckBoxColumn
              value="selectAll"
              checked={allChecked}
              onChange={toggleAllPermissions}
            />
          ),
        permissionName: <FormattedMessage id="ui-users.information.name" />,
        status: <FormattedMessage id="ui-users.information.status" />,
      }}
      formatter={{
        selected: ({ id: permissionId }) => (
          <CheckBoxColumn
            value={permissionId}
            checked={subPermissionsIds.includes(permissionId)}
            onChange={() => togglePermission(permissionId)}
          />
        ),
        permissionName: ({ displayName, permissionName }) => displayName || permissionName,
        status: ({ id }) => {
          return subPermissionsIds.includes(id)
            ? <FormattedMessage id="ui-users.permissions.modal.assigned" />
            : <FormattedMessage id="ui-users.permissions.modal.unassigned" />;
        },
      }}
      onRowClick={(e, { id: permissionId }) => togglePermission(permissionId)}
      onHeaderClick={onHeaderClick}
      sortDirection={sortOrders[sortOrder].fullName}
      sortedColumn={sortedColumn}
    />
  );
};

PermissionsList.propTypes = {
  sortedColumn: PropTypes.string.isRequired,
  sortedPermissions: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
  subPermissionsIds: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  sortOrder: PropTypes.string.isRequired,
  allChecked: PropTypes.bool.isRequired,
  togglePermission: PropTypes.func.isRequired,
  onHeaderClick: PropTypes.func.isRequired,
  toggleAllPermissions: PropTypes.func.isRequired,
};

export default PermissionsList;
