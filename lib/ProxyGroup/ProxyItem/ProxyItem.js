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
  function msg(msgId) {
    return stripes.intl.formatMessage({ id: msgId });
  }
  const link = (
    <div>
      <Link to={`/users/view/${record.user.id}`}>{getFullName(record.user)}</Link>
      {record.proxy && record.proxy.metadata && record.proxy.metadata.createdDate && <span className={css.creationLabel}>
(Relationship created:
        {stripes.formatDateTime(record.proxy.metadata.createdDate)}
)
                                                                                     </span>}
    </div>
  );

  const expirationDate = (record.proxy && record.proxy.expirationDate) ? stripes.formatDateTime(record.proxy.expirationDate) : '-';

  return (
    <div className={css.item}>
      <LayoutHeader level={3} title={link} noActions />
      <div className={css.content}>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label={msg('ui-users.proxy.relationshipStatus')} value={_.get(record, ['proxy', 'status'], '-')} />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label={msg('ui-users.expirationDate')} value={expirationDate} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label={msg('ui-users.proxy.requestForSponsor')} value={_.get(record, ['proxy', 'requestForSponsor'], '-')} />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label={msg('ui-users.proxy.notificationsTo')} value={_.get(record, ['proxy', 'notificationsTo'], '-')} />
              </Col>
            </Row>
          </Col>
          { /*
          Accrue-to functionality not yet available on backend
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue label={msg('ui-users.proxy.accrueTo')} value={_.get(record, ['proxy', 'accrueTo'], '-')} />
              </Col>
            </Row>
          </Col>
          */ }
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
