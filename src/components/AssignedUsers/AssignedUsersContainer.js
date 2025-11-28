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

  const handleMutationError = async ({ response, message }) => {
    const errorMessageId = 'ui-users.permissions.assignUsers.actions.message.error';

    const error = await response?.text();
    const statusCode = response?.status;
    let errorMessage = error || message;

    if (statusCode === 403 || statusCode === 405) {
      errorMessage = <FormattedMessage id="ui-users.permissions.assignUsers.actions.message.permission.error" />;
    }

    callout.sendCallout({
      message: intl.formatMessage({ id: errorMessageId }, { error: errorMessage }),
      type: 'error',
      timeout: 0,
    });
  };

  const handleAssignUsers = async (selectedUsers) => {
    const { added, removed } = getUpdatedUsersList(users, selectedUsers);

    let totalRequested = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;

    if (added.length) {
      try {
        const result = await assignUsers(added);
        totalRequested += result.requested;
        totalSuccessful += result.successful;
        totalFailed += result.failed;
      } catch (error) {
        await handleMutationError(error);
      }
    }

    if (removed.length) {
      try {
        const result = await unassignUsers(removed);
        totalRequested += result.requested;
        totalSuccessful += result.successful;
        totalFailed += result.failed;
      } catch (error) {
        await handleMutationError(error);
      }
    }

    if (totalRequested > 0) {
      if (totalSuccessful > 0) {
        refetch();
      }

      if (totalFailed === 0) {
        // All users were successfully assigned/unassigned
        callout.sendCallout({
          message: intl.formatMessage({ id: 'ui-users.permissions.assignUsers.actions.message.success' }),
          type: 'success',
        });
      } else if (totalSuccessful === 0) {
        // No users were assigned/unassigned
        callout.sendCallout({
          message: intl.formatMessage({ id: 'ui-users.permissions.assignUsers.actions.message.failure' }),
          type: 'error',
        });
      } else {
        // Some users were assigned/unassigned, but not all
        callout.sendCallout({
          message: intl.formatMessage({ id: 'ui-users.permissions.assignUsers.actions.message.partialFailure' }),
          type: 'error',
        });
      }
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
