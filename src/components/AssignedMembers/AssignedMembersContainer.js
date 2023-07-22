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

import useGetUsers from './hooks/useAssignedUsers/useAssignedUsers';
import AssignedMembersList from './AssignedMembersList';

const AssignedMembersContainer = ({ grantedToIds, expanded, onToggle }) => {
  const stripes = useStripes();
  const tenantId = stripes.okapi.tenant;

  const { users, isLoading } = useGetUsers({ grantedToIds, tenantId });

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
  grantedToIds: PropTypes.arrayOf(PropTypes.string),
  expanded: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};

AssignedMembersContainer.defaultProps = {
  grantedToIds: [],
  expanded: true,
};

export default AssignedMembersContainer;
