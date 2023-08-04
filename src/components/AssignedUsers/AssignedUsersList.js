import React from 'react';
import PropTypes from 'prop-types';

import { IfPermission } from '@folio/stripes/core';
import {
  Row,
  Col,
  MultiColumnList,
} from '@folio/stripes/components';

import {
  COLUMN_MAPPING,
  COLUMN_WIDTH,
  VISIBLE_COLUMNS
} from './constants';
import AssignMembers from './AssignUsers';

const AssignedUsersList = ({ users, assignUsers, isFetching }) => (
  <>
    <Row end="xs">
      <Col xs={12}>
        <IfPermission perm="perms.users.item.post">
          <AssignMembers assignUsers={assignUsers} selectedUsers={users} />
        </IfPermission>
      </Col>
    </Row>

    <Row
      start="xs"
      data-test-assigned-users
    >
      <Col xs={12}>
        <MultiColumnList
          contentData={users}
          visibleColumns={VISIBLE_COLUMNS}
          columnMapping={COLUMN_MAPPING}
          columnWidths={COLUMN_WIDTH}
          loading={isFetching}
        />
      </Col>
    </Row>
  </>
);

AssignedUsersList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object),
  assignUsers: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
};

AssignedUsersList.defaultProps = {
  users: [],
  isFetching: false,
};

export default AssignedUsersList;
