import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { Link } from 'react-router-dom';
import { getFullName } from '../../../util';
import css from './index.css';

const UserDetails = (props) => {
  const user = props.user || {};

  return (
    <div className={css.root}>
      <Row><FormattedMessage id="ui-users.charge.patron" /></Row>
      <Row>
        <Col style={{ 'marginRight': '10px' }}>
          <Link to={`/users/view/${user.id}`}>
            {`${getFullName(user)}`}
          </Link>
        </Col>
        <Col style={{ 'marginRight': '10px' }}>
          <FormattedMessage id="ui-users.charge.barcode" />
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
