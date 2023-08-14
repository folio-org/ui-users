import PropTypes from 'prop-types';

import {
  Row,
  Col,
  MultiColumnList,
} from '@folio/stripes/components';

import {
  COLUMN_MAPPING,
  COLUMN_WIDTH,
  VISIBLE_COLUMNS,
} from './constants';

const AssignedUsersList = ({ users, isFetching }) => (
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
);

AssignedUsersList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object),
  isFetching: PropTypes.bool,
};

AssignedUsersList.defaultProps = {
  users: [],
  isFetching: false,
};

export default AssignedUsersList;
