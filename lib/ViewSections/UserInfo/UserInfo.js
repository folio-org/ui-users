import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';

import { formatDate } from '../../../util';
import css from './UserInfo.css';


const UserInfo = ({ user, patronGroup, stripes }) => {
  const userStatus = (_.get(user, ['active'], '') ? 'active' : 'inactive');

  return (
    <div>
      <section className={css.root}>
        <div className={css.label}>
          <h2>User information</h2>
        </div>

        <Row>
          <Col xs={3}>
            <KeyValue label="Last name" value={_.get(user, ['personal', 'lastName'], '')} />
          </Col>
          <Col xs={3}>
            <KeyValue label="First name" value={_.get(user, ['personal', 'firstName'], '')} />
          </Col>
          <Col xs={3}>
            <KeyValue label="Middle name" value={_.get(user, ['personal', 'middleName'], '')} />
          </Col>
          <Col xs={3}>
            <KeyValue label="Barcode" value={_.get(user, ['barcode'], '')} />
          </Col>
        </Row>

        <Row>
          <Col xs={3}>
            <KeyValue label="Patron group" value={patronGroup.group} />
          </Col>
          <Col xs={3}>
            <KeyValue label="Status" value={userStatus} />
          </Col>
          <Col xs={3}>
            <KeyValue label="Expiration date" value={formatDate(_.get(user, ['expirationDate'], ''), stripes.locale)} />
          </Col>
          <Col xs={3}>
            <KeyValue label="Username" value={_.get(user, ['username'], '')} />
          </Col>
        </Row>
      </section>
      <br />
      <div className={css.separator} />
    </div>
  );
};

UserInfo.propTypes = {
  stripes: PropTypes.object,
  user: PropTypes.object,
  patronGroup: PropTypes.object,
};

export default UserInfo;
