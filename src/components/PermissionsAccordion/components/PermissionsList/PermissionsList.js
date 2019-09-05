import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEmpty, orderBy } from 'lodash';

import { MultiColumnList } from '@folio/stripes/components';
import CheckboxColumn from '../CheckboxColumn';
import { sortOrders } from '../../constants';

const PermissionsList = (props) => {
  const {
    filteredPermissions,
    assignedPermissionIds,
    togglePermission,
    visibleColumns,
    setAssignedPermissionIds
  } = props;

  const [sortedColumn, setSortedColumn] = useState('permissionName');
  const [sortOrder, setSortOrder] = useState(sortOrders.asc.name);

  const sorters = {
    permissionName: ({ permissionName, displayName }) => displayName || permissionName,
    status: ({ id, permissionName }) => [assignedPermissionIds.includes(id), permissionName],
    type: ({ subPermissions, mutable, permissionName }) => [!mutable && isEmpty(subPermissions), permissionName],
  };

  const sortedPermissions = orderBy(filteredPermissions, sorters[sortedColumn], sortOrder);
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

  const onHeaderClick = (e, { name: columnName }) => {
    if (sortedColumn !== columnName) {
      setSortedColumn(columnName);
      setSortOrder(sortOrders.desc.name);
    } else {
      const newSortOrder = (sortOrder === sortOrders.desc.name)
        ? sortOrders.asc.name
        : sortOrders.desc.name;
      setSortOrder(newSortOrder);
    }
  };

  return (
    <div data-test-permissions-list>
      <MultiColumnList
        id="list-permissions"
        columnWidths={{
          selected: '35px',
          status: '20%',
          type: '25%',
        }}
        visibleColumns={visibleColumns}
        contentData={sortedPermissions}
        columnMapping={{
          selected:
          (
            <div data-test-select-all-permissions>
              <CheckboxColumn
                permissionName="select-all"
                value="selectAll"
                checked={allChecked}
                onChange={toggleAllPermissions}
              />
            </div>
          ),
          permissionName: <FormattedMessage id="ui-users.information.name" />,
          status: <FormattedMessage id="ui-users.information.status" />,
          type: <FormattedMessage id="ui-users.permissions.modal.type" />,
        }}
        formatter={{
          selected: permission => (
            <CheckboxColumn
              permissionName={permission.permissionName}
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
          // eslint-disable-next-line react/prop-types
          type: ({ mutable, subPermissions }) => {
            const isBasePermission = !mutable && isEmpty(subPermissions);
            const typeText = `ui-users.permissions.modal.${
              isBasePermission
                ? 'base'
                : 'permissionSet'
            }`;

            return <div data-test-permission-type><FormattedMessage id={typeText} /></div>;
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
  filteredPermissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      permissionName: PropTypes.string.isRequired,
      subPermissions: PropTypes.arrayOf(PropTypes.string).isRequired,
      dummy: PropTypes.bool.isRequired,
      mutable: PropTypes.bool.isRequired,
      visible: PropTypes.bool.isRequired,
    })
  ).isRequired,
  assignedPermissionIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  togglePermission: PropTypes.func.isRequired,
  setAssignedPermissionIds: PropTypes.func.isRequired,
};

export default PermissionsList;
