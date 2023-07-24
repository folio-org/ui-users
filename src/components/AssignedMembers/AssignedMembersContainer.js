import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { useStripes } from '@folio/stripes/core';
import {
  Headline,
  Badge,
  Loading,
  Accordion,
} from '@folio/stripes/components';

import useAssignedUsers from './hooks/useAssignedUsers';
import AssignedMembersList from './AssignedMembersList';

const AssignedMembersContainer = ({ permissionsSet, expanded, onToggle }) => {
  const stripes = useStripes();
  const tenantId = stripes.okapi.tenant;

  const { users, isLoading } = useAssignedUsers({ grantedToIds: permissionsSet.grantedTo, tenantId });

  if (isLoading) {
    return <Loading />;
  }

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
      { isLoading ? <Loading /> : <AssignedMembersList users={users} /> }
    </Accordion>
  );
};

AssignedMembersContainer.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  permissionsSet: PropTypes.shape({
    grantedTo: PropTypes.arrayOf(PropTypes.string),
  }),
};

AssignedMembersContainer.defaultProps = {
  expanded: true,
  permissionsSet: { grantedTo: [] },
};

export default AssignedMembersContainer;
