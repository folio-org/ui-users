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
    visibleColumns,
  } = props;
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
              checked={subPermissionsIds.includes(permission.id)}
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
              subPermissionsIds.includes(permission.id)
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
  subPermissionsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  sortOrder: PropTypes.string.isRequired,
  allChecked: PropTypes.bool.isRequired,
  togglePermission: PropTypes.func.isRequired,
  onHeaderClick: PropTypes.func.isRequired,
  toggleAllPermissions: PropTypes.func.isRequired,
};

export default PermissionsList;
