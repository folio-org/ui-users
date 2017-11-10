import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';

import { getFullName } from '../../../util';
import css from './ProxyItem.css';

const ProxyItem = ({ proxy }) => {
  const proxyLink = (<Link to={`/users/view/${proxy.user.id}`}>{getFullName(proxy.user)}</Link>);

  return (
    <div className={css.item}>
      <h5>{proxyLink}</h5>
      <Row>
        <Col xs={4}>
          <Row>
            <Col xs={12}>
              <KeyValue label="Relationship Status" value={_.get(proxy, ['meta', 'status'], '-')} />
            </Col>
          </Row>
        </Col>
        <Col xs={4}>
          <Row>
            <Col xs={12}>
              <KeyValue label="Expiration Date" value={_.get(proxy, ['meta', 'expirationDate'], '-')} />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <Row>
            <Col xs={12}>
              <KeyValue label="Proxy can request for sponsor" value={_.get(proxy, ['meta', 'requestForSponsor'], '-')} />
            </Col>
          </Row>
        </Col>
        <Col xs={4}>
          <Row>
            <Col xs={12}>
              <KeyValue label="Notifications sent to" value={_.get(proxy, ['meta', 'notificationsTo'], '-')} />
            </Col>
          </Row>
        </Col>
        <Col xs={4}>
          <Row>
            <Col xs={12}>
              <KeyValue label="Fees/fines accrue to" value={_.get(proxy, ['meta', 'accrueTo'], '-')} />
            </Col>
          </Row>
        </Col>
      </Row>
      <br />
    </div>
  );
};

ProxyItem.propTypes = {
  proxy: PropTypes.object,
};

export default ProxyItem;
