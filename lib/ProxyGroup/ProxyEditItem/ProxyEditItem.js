import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LayoutHeader from '@folio/stripes-components/lib/LayoutHeader';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import { Field } from 'redux-form';

import { getFullName, formatDateTime } from '../../../util';
import css from './ProxyEditItem.css';

const relationStatusValues = ['Active', 'Inactive'];
const proxySponsorValues = ['Sponsor', 'Proxy'];
const yesNoValues = ['Yes', 'No'];

const ProxyEditItem = ({ name, record, onDelete }, { stripes }) => {
  const relationStatusOptions = relationStatusValues.map(val => ({
    label: val, value: val, selected: record.meta && record.meta.status === val }));
  const requestForSponsorOptions = yesNoValues.map(val => ({
    label: val, value: val, selected: record.meta && record.meta.requestForSponsor === val }));
  const notificationsToOptions = proxySponsorValues.map(val => ({
    label: val, value: val, selected: record.meta && record.meta.notificationsTo === val }));
  const accrueToOptions = proxySponsorValues.map(val => ({
    label: val, value: val, selected: record.meta && record.meta.accrueTo === val }));

  const proxyLink = (
    <div>
      <Link to={`/users/view/${record.user.id}`}>{getFullName(record.user)}</Link>
      {record.meta.createdDate && <span className={css.creationLabel}>(Relationship created: {formatDateTime(record.meta.createdDate, stripes.locale)})</span>}
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
                <Field label="Relationship Status" name={`${name}.meta.status`} component={Select} dataOptions={[{ label: 'Select status', value: '' }, ...relationStatusOptions]} fullWidth />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <Field
                  component={Datepicker}
                  label="Expiration Date"
                  dateFormat="YYYY-MM-DD"
                  name={`${name}.meta.expirationDate`}
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
                <Field label="Proxy can request for sponsor" name={`${name}.meta.requestForSponsor`} component={Select} dataOptions={[...requestForSponsorOptions]} fullWidth />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <Field label="Notifications sent to" name={`${name}.meta.notificationsTo`} component={Select} dataOptions={[...notificationsToOptions]} fullWidth />
              </Col>
            </Row>
          </Col>
          <Col xs={4}>
            <Row>
              <Col xs={12}>
                <Field label="Fees/fines accrue to" name={`${name}.meta.accrueTo`} component={Select} dataOptions={[...accrueToOptions]} fullWidth />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};

ProxyEditItem.contextTypes = {
  stripes: PropTypes.shape({
    locale: PropTypes.string,
  }).isRequired,
};

ProxyEditItem.propTypes = {
  record: PropTypes.object,
  name: PropTypes.string,
  onDelete: PropTypes.func,
};

export default ProxyEditItem;
