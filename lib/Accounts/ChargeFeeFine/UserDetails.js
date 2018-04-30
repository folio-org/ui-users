import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { Link } from 'react-router-dom';
import { getFullName } from '../util';
import css from './index.css';

const UserDetails = (props) => {
  const user = props.user || {};

  return (
    <div className={css.root}>
      <Row>Patron</Row>
      <Row>
        <Col>
          <Link to={`/users/view/${user.id}`}>
            {`${getFullName(user)}   `}
          </Link>
        </Col>
        <Col>{'Barcode: '}
          <Link to={`/users/view/${user.id}`}>
            {user.barcode}
          </Link>
        </Col>
      </Row>
    </div>
  );
};

UserDetails.propTypes = {
  user: PropTypes.object,
};

export default UserDetails;
