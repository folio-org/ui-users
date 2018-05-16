import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LayoutHeader from '@folio/stripes-components/lib/LayoutHeader';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import { Field } from 'redux-form';

import { getFullName } from '../../../util';
import css from './ProxyEditItem.css';


const ProxyEditItem = ({ name, record, onDelete, intl, stripes }) => {
  const relationStatusValues = [intl.formatMessage({ id: 'ui-users.active' }), intl.formatMessage({ id: 'ui-users.inactive' })];
  const proxySponsorValues = [intl.formatMessage({ id: 'ui-users.sponsor' }), intl.formatMessage({ id: 'ui-users.proxy' })];
  const yesNoValues = [intl.formatMessage({ id: 'ui-users.yes' }), intl.formatMessage({ id: 'ui-users.no' })];

  const relationStatusOptions = relationStatusValues.map(val => ({ label: val, value: val, selected: record.proxy && record.proxy.status === val }));
  const requestForSponsorOptions = yesNoValues.map(val => ({ label: val, value: val, selected: record.proxy && record.proxy.requestForSponsor === val }));
  const notificationsToOptions = proxySponsorValues.map(val => ({ label: val, value: val, selected: record.proxy && record.proxy.notificationsTo === val }));
  const accrueToOptions = proxySponsorValues.map(val => ({ label: val, value: val, selected: record.proxy && record.proxy.accrueTo === val }));

  const proxyLink = (
    <div>
      <Link to={`/users/view/${record.user.id}`}>{getFullName(record.user)}</Link>
      {record.proxy && record.proxy.meta && record.proxy.meta.createdDate && <span className={css.creationLabel}>(<FormattedMessage id="ui-users.proxy.relationshipCreated" />: {stripes.formatDateTime(record.proxy.meta.createdDate)})</span>}
    </div>
  );

  return (
    <div className={css.item}>
      <LayoutHeader level={3} title={proxyLink} onDelete={() => onDelete(record)} />
      <div className={css.content}>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <Field label={intl.formatMessage({ id: 'ui-users.proxy.relationshipStatus' })} name={`${name}.proxy.status`} component={Select} dataOptions={[{ label: 'Select status', value: '' }, ...relationStatusOptions]} fullWidth />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <Field
                  component={Datepicker}
                  label={intl.formatMessage({ id: 'ui-users.expirationDate' })}
                  dateFormat="YYYY-MM-DD"
                  name={`${name}.proxy.expirationDate`}
                  backendDateStandard="YYYY-MM-DD"
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <Field label={intl.formatMessage({ id: 'ui-users.proxy.requestForSponsor' })} name={`${name}.proxy.requestForSponsor`} component={Select} dataOptions={[...requestForSponsorOptions]} fullWidth />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <Field label={intl.formatMessage({ id: 'ui-users.proxy.notificationsTo' })} name={`${name}.proxy.notificationsTo`} component={Select} dataOptions={[...notificationsToOptions]} fullWidth />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <Field label={intl.formatMessage({ id: 'ui-users.proxy.accrueTo' })} name={`${name}.proxy.accrueTo`} component={Select} dataOptions={[...accrueToOptions]} fullWidth />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};

ProxyEditItem.propTypes = {
  intl: PropTypes.object.isRequired,
  record: PropTypes.object,
  name: PropTypes.string,
  onDelete: PropTypes.func,
  stripes: PropTypes.object,
};

export default ProxyEditItem;
