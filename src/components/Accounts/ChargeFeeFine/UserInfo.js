import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from '@folio/stripes/components';
import { Link } from 'react-router-dom';
import { getFullName } from '../../util';
import css from './index.css';

const UserInfo = (props) => {
  const user = props.user || {};

  return (
    <div className={css.root}>
      <Row><FormattedMessage id="ui-users.charge.patron" /></Row>
      <Row>
        <Col className={css.userInfoLink}>
          <Link to={`/users/view/${user.id}`}>
            {`${getFullName(user)}`}
          </Link>
        </Col>
        <Col className={css.userInfoLink}>
          <FormattedMessage id="ui-users.charge.barcode" />
          {': '}
          <Link to={`/users/view/${user.id}`}>
            {user.barcode}
          </Link>
        </Col>
      </Row>
    </div>
  );
};

UserInfo.propTypes = {
  user: PropTypes.object,
};

export default UserInfo;
