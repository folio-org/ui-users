import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { MultiColumnList } from '@folio/stripes/components';
import CheckboxColumn from '../CheckboxColumn/CheckboxColumn';

const visibleColumns = ['selected', 'roleName', 'status'];

const UserRolesList = ({ assignedUserRoleIds,
  filteredRoles,
  toggleRole,
  toggleRoleList,
  tenantId }) => {
  const allChecked = filteredRoles.every(filteredRole => assignedUserRoleIds[tenantId]?.includes(filteredRole.id));

  const handleToggleRoleList = (event) => {
    toggleRoleList(event.target.checked, filteredRoles);
  };

  return (
    <div data-test-user-roles-list>
      <MultiColumnList
        id="list-user-roles"
        columnWidths={{
          selected: '35px',
        }}
        visibleColumns={visibleColumns}
        contentData={filteredRoles}
        columnMapping={{
          selected:
            (
              <div data-test-select-all-user-roles>
                <CheckboxColumn
                  roleName="select-all"
                  value="selectAll"
                  checked={allChecked}
                  onChange={handleToggleRoleList}
                />
              </div>
            ),
          roleName: <FormattedMessage id="ui-users.information.name" />,
          status: <FormattedMessage id="ui-users.information.status" />,
        }}
        formatter={{
          selected: role => (
            <CheckboxColumn
              permissionName={role.permissionName}
              value={role.id}
              // eslint-disable-next-line react/prop-types
              checked={assignedUserRoleIds[tenantId]?.includes(role.id)}
              onChange={() => toggleRole(role.id)}
            />
          ),
          // eslint-disable-next-line react/prop-types
          roleName: role => (
            <div data-test-role-name>
              {role.name}
            </div>
          ),
          status: role => {
            const status = assignedUserRoleIds[tenantId]?.includes(role.id)
              ? 'assigned'
              : 'unassigned';
            const statusText = `ui-users.roles.modal.${status}`;
            return <div data-test-role-status><FormattedMessage id={statusText} /></div>;
          }
        }}
      />
    </div>
  );
};

UserRolesList.propTypes = {
  assignedUserRoleIds: PropTypes.object.isRequired,
  filteredRoles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  toggleRole: PropTypes.func.isRequired,
  toggleRoleList: PropTypes.func.isRequired,
  tenantId: PropTypes.string.isRequired
};

export default UserRolesList;
