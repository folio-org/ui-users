import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LayoutHeader from '@folio/stripes-components/lib/LayoutHeader';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import { Field, stopSubmit, setSubmitFailed, getFormSubmitErrors } from 'redux-form';

import { getFullName } from '../../../util';
import css from './ProxyEditItem.css';

class ProxyEditItem extends React.Component {

  constructor(props) {
    super();
    this.state = { statusDisabled: false };
  }

  translate(id) {
    const { intl } = this.props;
    return intl.formatMessage({ id: `ui-users.${id}` });
  }

  updateStatus(date) {
    const { name, change, intl, index, namespace, stripes: { store } } = this.props;
    const statusField = `${name}.proxy.status`;
    const today = moment().endOf('day');

    if (moment(date).endOf('day').isSameOrBefore(today)) {
      const message = intl.formatMessage({ id: `ui-users.proxy.errors.expired` });
      change(statusField, "Inactive");
      this.setState({ statusDisabled: true });
      this.dispatchError(statusField, message);
    }
    else {
      change(statusField, "Active");
      this.setState({ statusDisabled: false });
    }
  }

  dispatchError(fieldName, message) {
    const { namespace, index, stripes: { store } } = this.props;
    const errors = getFormSubmitErrors('userForm')(store.getState());
    errors[namespace] = errors[namespace] || new Array(index + 1);
    errors[namespace][index] = { proxy: { status: message } };
    store.dispatch(stopSubmit('userForm', errors));
    store.dispatch(setSubmitFailed('userForm', [fieldName]));
  }

  render() {
    const { name, record, onDelete, intl, stripes } = this.props;

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
                  <Field
                    disabled={this.state.statusDisabled}
                    label={intl.formatMessage({ id: 'ui-users.proxy.relationshipStatus' })}
                    name={`${name}.proxy.status`}
                    component={Select}
                    dataOptions={[{ label: 'Select status', value: '' }, ...relationStatusOptions]}
                    fullWidth
                  />
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
                    onChange={(e, date) => this.updateStatus(date)}
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
  }
}

ProxyEditItem.propTypes = {
  intl: PropTypes.object.isRequired,
  index: PropTypes.number,
  record: PropTypes.object,
  namespace: PropTypes.string,
  name: PropTypes.string,
  onDelete: PropTypes.func,
  stripes: PropTypes.object,
  change: PropTypes.func.isRequired,
};

export default ProxyEditItem;
