import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Headline,
  Badge,
  Loading,
  Accordion,
} from '@folio/stripes/components';
import { useCallout } from '@folio/stripes/core';

import useAssignedUsers from './hooks/useAssignedUsers';
import useAssignedUsersMutation from './hooks/useAssignedUsersMutation';
import AssignedUsersList from './AssignedUsersList';
import { findObjectDifferences } from './utils';

const AssignedUsersContainer = ({ permissionsSet, expanded, onToggle, tenantId }) => {
  const callout = useCallout();
  const intl = useIntl();

  const { grantedTo, id: permissionSetId, permissionName } = permissionsSet;
  const [grantedToIds, setGrantedToIds] = useState(grantedTo);

  const { users, isLoading, refetch } = useAssignedUsers({ grantedToIds, permissionSetId, tenantId });

  const handleMutationSuccess = () => {
    refetch();
    callout.sendCallout({
      message: <FormattedMessage id="ui-users.permissions.assignUsers.actions.message.success" />,
      type: 'success',
    });
  };

  const handleMutationError = async ({ response, message }) => {
    const errorMessageId = 'ui-users.permissions.assignUsers.actions.message.error';

    const error = await response?.text();
    const statusCode = response?.status;
    let errorMessage = error || message;

    if (statusCode === 403 || statusCode === 405) {
      errorMessage = <FormattedMessage id="ui-users.permissions.assignUsers.actions.message.permission.error" />;
    }

    return callout.sendCallout({
      message: intl.formatMessage({ id: errorMessageId }, { error: errorMessage }),
      type: 'error',
      timeout: 0,
    });
  };

  const { assignUsers, removeUsers } = useAssignedUsersMutation({ permissionSetId, tenantId, permissionName, setGrantedToIds });

  const handleAssignUsers = async (selectedUsers) => {
    const { added, removed } = findObjectDifferences(users, selectedUsers);

    if (added.length) await assignUsers(added, { onError: handleMutationError });

    if (removed.length) await removeUsers(removed, { onError: handleMutationError });

    if (removed.length || added.length) {
      handleMutationSuccess();
    }
  };

  return (
    <Accordion
      open={expanded}
      id="assignedUsers"
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.permissions.assignedUsers" /></Headline>}
      displayWhenClosed={
        isLoading ? <Loading /> : <Badge>{users.length}</Badge>
      }
    >
      { isLoading ? <Loading /> : <AssignedUsersList assignUsers={handleAssignUsers} users={users} /> }
    </Accordion>
  );
};

AssignedUsersContainer.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  permissionsSet: PropTypes.shape({
    grantedTo: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.string,
    permissionName: PropTypes.string,
  }),
  tenantId: PropTypes.string,
};

AssignedUsersContainer.defaultProps = {
  expanded: true,
  permissionsSet: { grantedTo: [] },
};

export default AssignedUsersContainer;
