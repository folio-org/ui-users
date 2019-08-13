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
    assignedPermissionIds,
    togglePermission,
    onHeaderClick,
    sortOrder,
    sortedColumn,
    visibleColumns,
    setAssignedPermissionIds
  } = props;

  const allChecked = sortedPermissions.every(({ id }) => assignedPermissionIds.includes(id));

  const toggleAllPermissions = ({ target: { checked } }) => {
    let result = [...assignedPermissionIds];

    if (checked) {
      sortedPermissions.forEach(({ id }) => {
        if (!result.includes(id)) {
          result.push(id);
        }
      });
    } else {
      result = assignedPermissionIds.filter((assignedPermissionId) => !sortedPermissions.find(
        ({ id: sortedPermissionId }) => sortedPermissionId === assignedPermissionId
      ));
    }

    setAssignedPermissionIds(result);
  };

  return (
    <div data-test-permissions-list>
      <MultiColumnList
        columnWidths={{
          selected: '35',
          status: '20%',
        }}
        visibleColumns={visibleColumns}
        contentData={sortedPermissions}
        columnMapping={{
          selected:
          (
            <div data-test-select-all-permissions>
              <CheckBoxColumn
                value="selectAll"
                checked={allChecked}
                onChange={toggleAllPermissions}
              />
            </div>
          ),
          permissionName: <FormattedMessage id="ui-users.information.name" />,
          status: <FormattedMessage id="ui-users.information.status" />,
        }}
        formatter={{
          selected: permission => (
            <CheckBoxColumn
              value={permission.id}
              checked={assignedPermissionIds.includes(permission.id)}
              onChange={() => togglePermission(permission.id)}
            />
          ),
          // eslint-disable-next-line react/prop-types
          permissionName: ({ displayName, permissionName }) => (
            <div data-test-permission-name>
              { displayName || permissionName }
            </div>
          ),
          status: permission => {
            const statusText = `ui-users.permissions.modal.${
              assignedPermissionIds.includes(permission.id)
                ? 'assigned'
                : 'unassigned'
            }`;

            return <div data-test-permission-status><FormattedMessage id={statusText} /></div>;
          },
        }}
        onRowClick={(e, { id: permissionId }) => togglePermission(permissionId)}
        onHeaderClick={onHeaderClick}
        sortDirection={sortOrders[sortOrder].fullName}
        sortedColumn={sortedColumn}
      />
    </div>
  );
};

PermissionsList.propTypes = {
  sortedColumn: PropTypes.string.isRequired,
  sortedPermissions: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
  assignedPermissionIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  sortOrder: PropTypes.string.isRequired,
  togglePermission: PropTypes.func.isRequired,
  onHeaderClick: PropTypes.func.isRequired,
  setAssignedPermissionIds: PropTypes.func.isRequired,
};

export default PermissionsList;
