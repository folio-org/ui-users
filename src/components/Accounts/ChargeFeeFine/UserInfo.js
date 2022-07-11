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
      <Row>
        <Col md={{ offset: 2 }} />
        <Col>
          <FormattedMessage id="ui-users.charge.patron" />
          :
        </Col>
        <Col className={css.userInfoLink} auto>
          <Link to={`/users/view/${user.id}`}>
            {`${getFullName(user)}`}
          </Link>
        </Col>
        <Col className={css.userInfoLink} auto>
          <FormattedMessage id="ui-users.charge.barcode" />
          :
        </Col>
        <Col auto>
          <Link to={`/users/view/${user.id}`}>
            {user.barcode}
          </Link>
        </Col>
        <Col md={{ offset: 2 }} />
      </Row>
    </div>
  );
};

UserInfo.propTypes = {
  user: PropTypes.object,
};

export default UserInfo;
