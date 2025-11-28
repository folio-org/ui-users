import PropTypes from 'prop-types';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import {
  Headline,
  Badge,
  Loading,
  Accordion,
} from '@folio/stripes/components';
import {
  IfPermission,
  useCallout,
} from '@folio/stripes/core';

import {
  useAssignedUsers,
  usePermissionSet,
  useAssignedUsersMutation,
} from './hooks';
import AssignUsers from './AssignUsers';
import AssignedUsersList from './AssignedUsersList';
import { getUpdatedUsersList } from './utils';

const AssignedUsersContainer = ({
  permissionSetId,
  expanded = true,
  onToggle,
  tenantId
}) => {
  const callout = useCallout();
  const intl = useIntl();

  const { permissionSet, isLoading: isPermissionSetLoading, refetch } = usePermissionSet({
    permissionSetId,
    tenantId
  });
  const { grantedTo, permissionName } = permissionSet;

  const { users, isLoading, isFetching } = useAssignedUsers({
    tenantId,
    permissionSetId,
    grantedToIds: grantedTo,
  });
  const { assignUsers, unassignUsers, isLoading: isMutationLoading } = useAssignedUsersMutation({
    permissionSetId,
    tenantId,
    permissionName,
  });

  const handleAssignUsers = async (selectedUsers) => {
    const { added, removed } = getUpdatedUsersList(users, selectedUsers);

    let assignResult = { attempted: 0, successful: 0, totalSelected: 0 };
    if (added.length) {
      assignResult = await assignUsers(added);
    }

    if (removed.length) {
      await unassignUsers(removed);
    }

    if (added.length) {
      if (assignResult.successful === assignResult.totalSelected) {
        callout.sendCallout({
          message: <FormattedMessage id="ui-users.permissions.assignUsers.actions.message.success" />,
          type: 'success',
        });
      } else if (assignResult.successful > 0) {
        callout.sendCallout({
          message: <FormattedMessage id="ui-users.permissions.assignUsers.actions.message.partialSuccess" />,
          type: 'error',
        });
      } else {
        callout.sendCallout({
          message: <FormattedMessage id="ui-users.permissions.assignUsers.actions.message.allFailed" />,
          type: 'error',
        });
      }
    } else if (removed.length) {
      callout.sendCallout({
        message: <FormattedMessage id="ui-users.permissions.assignUsers.actions.message.success" />,
        type: 'success',
      });
    }

    if (removed.length || added.length) {
      refetch();
    }
  };

  const isPermissionsLoading = isPermissionSetLoading || isLoading;

  return (
    <Accordion
      open={expanded}
      id="assignedUsers"
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.permissions.assignedUsers" /></Headline>}
      displayWhenClosed={
        isPermissionsLoading ? <Loading /> : <Badge>{users.length}</Badge>
      }
      displayWhenOpen={
        <IfPermission perm="perms.users.item.post">
          <AssignUsers
            assignUsers={handleAssignUsers}
            selectedUsers={users}
            tenantId={tenantId}
          />
        </IfPermission>
      }
    >
      {isPermissionsLoading ?
        <Loading />
        : (
          <AssignedUsersList
            isFetching={isFetching || isMutationLoading}
            users={users}
          />
        )}
    </Accordion>
  );
};

AssignedUsersContainer.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  permissionSetId: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};

export default AssignedUsersContainer;
