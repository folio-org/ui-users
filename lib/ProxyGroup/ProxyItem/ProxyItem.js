import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import LayoutHeader from '@folio/stripes-components/lib/LayoutHeader';

import { getFullName } from '../../../util';
import css from './ProxyItem.css';

const ProxyItem = ({ record, stripes }) => {
  const link = (
    <div>
      <Link to={`/users/view/${record.user.id}`}>{getFullName(record.user)}</Link>
      {record.meta.createdDate && <span className={css.creationLabel}>(Relationship created: {stripes.formatDateTime(record.meta.createdDate)})</span>}
    </div>
  );

  return (
    <div className={css.item}>
      <LayoutHeader level={3} title={link} noActions />
      <div className={css.content}>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label="Relationship Status" value={_.get(record, ['meta', 'status'], '-')} />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label="Expiration Date" value={_.get(record, ['meta', 'expirationDate'], '-')} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label="Proxy can request for sponsor" value={_.get(record, ['meta', 'requestForSponsor'], '-')} />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label="Notifications sent to" value={_.get(record, ['meta', 'notificationsTo'], '-')} />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label="Fees/fines accrue to" value={_.get(record, ['meta', 'accrueTo'], '-')} />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};

ProxyItem.propTypes = {
  record: PropTypes.object,
  stripes: PropTypes.object,
};

export default ProxyItem;
