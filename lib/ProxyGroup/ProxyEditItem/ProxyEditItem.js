import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LayoutHeader from '@folio/stripes-components/lib/LayoutHeader';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Select from '@folio/stripes-components/lib/Select';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import { Field } from 'redux-form';

import { getFullName, getRowURL, getAnchoredRowFormatter } from '../../../util';
import css from './ProxyEditItem.css';

const relationStatusValues = ['Active', 'Inactive'];
const proxySponsorValues = ['Sponsor', 'Proxy'];
const yesNoValues = ['Yes', 'No'];

export default class ProxyEditItem extends React.Component {
  static propTypes = {
    field: PropTypes.object,
    name: PropTypes.string,
    index: PropTypes.number,
    onDelete: PropTypes.func,
  };

  render() {
    const { name, index } = this.props;
    const proxy = this.props.field;

    const proxyLink = (<Link to={`/users/view/${proxy.id}`}>{getFullName(proxy)}</Link>);
    const relationStatusOptions = relationStatusValues.map(val => ({
      label: val, value: val, selected: proxy.meta && proxy.meta.status === val }));
    const requestForSponsorOptions = yesNoValues.map(val => ({
      label: val, value: val, selected: proxy.meta && proxy.meta.requestForSponsor === val }));
    const notificationsToOptions = proxySponsorValues.map(val => ({
      label: val, value: val, selected: proxy.meta && proxy.meta.notificationsTo === val }));
    const accrueToOptions = proxySponsorValues.map(val => ({
      label: val, value: val, selected: proxy.meta && proxy.meta.accrueTo === val }));

    return (
      <div className={css.item}>
        <LayoutHeader level={3} title={proxyLink} onDelete={() => this.props.onDelete(index)} />
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
                  <Field label="Proxy can request for sponsor" name={`${name}.meta.requestForSponsor`} component={Select} dataOptions={[{ label: 'Select one', value: '' }, ...requestForSponsorOptions]} fullWidth />
                </Col>
              </Row>
             </Col>
             <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field label="Notifications sent to" name={`${name}.meta.notificationsTo`} component={Select} dataOptions={[{ label: 'Select one', value: '' }, ...notificationsToOptions]} fullWidth />
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field label="Fees/fines accrue to" name={`${name}.meta.accrueTo`} component={Select} dataOptions={[{ label: 'Select one', value: '' }, ...accrueToOptions]} fullWidth />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
