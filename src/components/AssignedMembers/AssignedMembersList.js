import React from 'react';
import PropTypes from 'prop-types';

import {
  Row,
  Col,
  MultiColumnList,
} from '@folio/stripes/components';

import { COLUMN_MAPPING, COLUMN_WIDTH, VISIBLE_COLUMNS } from './constants';

const AssignedMembersList = ({ users }) => (
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
      />
    </Col>
  </Row>
);

AssignedMembersList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object),
};

AssignedMembersList.defaultProps = {
  users: [],
};

export default AssignedMembersList;
