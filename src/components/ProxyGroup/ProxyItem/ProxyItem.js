import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  KeyValue,
  LayoutHeader,
  NoValue,
  FormattedTime,
  FormattedDate,
} from '@folio/stripes/components';

import { getFullName } from '../../util';
import css from './ProxyItem.css';

const ProxyItem = ({ record }) => {
  if (!record.user) {
    return <FormattedMessage id="ui-users.errors.proxies.invalidUserLabel" />;
  }

  const creationDateTime = <FormattedTime
    value={record.proxy.metadata.createdDate}
    day="numeric"
    month="numeric"
    year="numeric"
  />;
  const relationshipCreatedMsg = <FormattedMessage id="ui-users.proxy.relationshipCreated" />;
  const link = (
    <div>
      <Link to={`/users/view/${record.user.id}`}>{getFullName(record.user)}</Link>
      {record.proxy && record.proxy.metadata && record.proxy.metadata.createdDate && (
      <span className={css.creationLabel}>

        (
        {relationshipCreatedMsg}
          {' '}
          {creationDateTime}

        )
      </span>
      )}
    </div>
  );

  const expirationDate = (record.proxy && record.proxy.expirationDate) ?
    <FormattedDate value={record.proxy.expirationDate} /> : <NoValue />;

  return (
    <div className={css.item}>
      <LayoutHeader level={3} title={link} noActions />
      <div className={css.content}>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue
                  data-testid="status"
                  label={<FormattedMessage id="ui-users.proxy.relationshipStatus" />}
                  value={_.get(record, ['proxy', 'status'], <NoValue />)}
                />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue
                  data-testid="expirationDate"
                  label={<FormattedMessage id="ui-users.expirationDate" />}
                  value={expirationDate}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue
                  data-testid="requestForSponsor"
                  label={<FormattedMessage id="ui-users.proxy.requestForSponsor" />}
                  value={_.get(record, ['proxy', 'requestForSponsor'], <NoValue />)}
                />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue
                  data-testid="notificationsTo"
                  label={<FormattedMessage id="ui-users.proxy.notificationsTo" />}
                  value={_.get(record, ['proxy', 'notificationsTo'], <NoValue />)}
                />
              </Col>
            </Row>
          </Col>
          { /*
          Accrue-to functionality not yet available on backend
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <KeyValue
                  data-testid="accrueTo"
                  label={<FormattedMessage id="ui-users.proxy.accrueTo" />}
                  value={_.get(record, ['proxy', 'accrueTo'], <NoValue />)}
                />
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
};

export default ProxyItem;
