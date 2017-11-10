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

const relationStatusValues = [{
  label: 'Select relationship status', value: '',
  label: 'Active', value: 'Active',
  label: 'Inactive', value: 'Inactive',
}];

const proxySponsorValues = [{
  label: 'Sponsor', value: 'Sponsor',
  label: 'Proxy', value: 'Proxy',
}];

const yesNoValues = [{
  label: 'Yes', value: 'Yes',
  label: 'No', value: 'No',
}];

export default class ProxyItem extends React.Component {
  static propTypes = {
    proxy: PropTypes.object,
  };

  render() {
    const { proxy } = this.props;
    const proxyLink = (<Link to={`/users/view/${proxy.id}`}>{getFullName(proxy)}</Link>);


    return (
      <div className={css.item}>
        <LayoutHeader level={3} title={proxyLink} />
        <div className={css.content}>
          <Row>
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field label="Relationship Status" name="status" component={Select} dataOptions={relationStatusValues} fullWidth />
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
                    name="expirationDate"
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
                  <Field label="Proxy can request for sponsor" name="requestForSponsor" component={Select} dataOptions={yesNoValues} fullWidth />
                </Col>
              </Row>
             </Col>
             <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field label="Notifications sent to" name="notificationsTo" component={Select} dataOptions={proxySponsorValues} fullWidth />
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field label="Fees/fines accrue to" name="accrueTo" component={Select} dataOptions={proxySponsorValues} fullWidth />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
