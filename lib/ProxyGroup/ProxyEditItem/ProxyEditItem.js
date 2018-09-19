import React from 'react';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import { defer, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LayoutHeader from '@folio/stripes-components/lib/LayoutHeader';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import { Field, stopSubmit, setSubmitFailed, getFormSubmitErrors, getFormValues } from 'redux-form';

import { getFullName } from '../../../util';
import css from './ProxyEditItem.css';

class ProxyEditItem extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    index: PropTypes.number,
    record: PropTypes.object,
    namespace: PropTypes.string, // sponsors or proxies
    name: PropTypes.string,
    onDelete: PropTypes.func,
    stripes: PropTypes.object,
    change: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { statusDisabled: false };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { stripes: { store } } = nextProps;
    const formValues = getFormValues('userForm')(store.getState());
    if (!isEqual(prevState.formValues, formValues)) {
      return { formValues };
    }
    return null;
  }

  componentDidMount() {
    defer(() => this.validateStatus());
  }

  componentDidUpdate(prevProps, prevState) {
    const { namespace, index } = this.props;
    const prevProxyRel = (prevState.formValues[namespace] || [])[index] || {};
    const proxyRel = this.state.formValues[namespace][index] || {};

    if (!isEqual(this.state.formValues, prevState.formValues) &&
      prevProxyRel.proxy.status === proxyRel.proxy.status) {
      this.validateStatus();
    }
  }

  dispatchError(message) {
    const { name, namespace, index, stripes: { store } } = this.props;
    const fieldName = `${name}.proxy.status`;
    const errors = getFormSubmitErrors('userForm')(store.getState());
    errors[namespace] = errors[namespace] || new Array(index + 1);
    errors[namespace][index] = { proxy: { status: message } };

    store.dispatch(stopSubmit('userForm', errors));
    store.dispatch(setSubmitFailed('userForm', [fieldName]));
  }

  toggleStatus(isActive) {
    const { name, change } = this.props;
    const status = (isActive) ? 'Active' : 'Inactive';
    change(`${name}.proxy.status`, status);
    this.setState({ statusDisabled: !isActive });
  }

  translate(message) {
    return this.props.intl.formatMessage({ id: `ui-users.${message}` });
  }

  validateStatus() {
    const { namespace, index } = this.props;
    const formValues = this.state.formValues;
    const proxyRel = formValues[namespace][index] || {};
    const today = moment().endOf('day');
    let error = '';

    // proxy user expired
    if (moment(proxyRel.user.expirationDate).endOf('day').isSameOrBefore(today)) {
      error = this.translate(`errors.${namespace}.expired`);
    }

    // user expired
    if (moment(formValues.expirationDate).endOf('day').isSameOrBefore(today)) {
      error = this.translate(`errors.${namespace}.expired`);
    }

    // proxy relationship expired
    if (proxyRel.proxy.expirationDate &&
      moment(proxyRel.proxy.expirationDate).endOf('day').isSameOrBefore(today)) {
      error = this.translate('errors.proxyrelationship.expired');
    }

    if (error) {
      this.toggleStatus(false);
      return this.dispatchError(error);
    }

    return this.toggleStatus(true);
  }

  render() {
    const { name, record, onDelete, stripes, intl } = this.props;

    const relationStatusValues = [this.translate('active'), this.translate('inactive')];
    const proxySponsorValues = [this.translate('sponsor'), this.translate('proxy')];
    const yesNoValues = [this.translate('yes'), this.translate('no')];

    const relationStatusOptions = relationStatusValues.map(val => ({
      label: val,
      value: val,
      selected: record.proxy && record.proxy.status === val
    }));

    const requestForSponsorOptions = yesNoValues.map(val => ({
      label: val,
      value: val,
      selected: record.proxy && record.proxy.requestForSponsor === val
    }));

    const notificationsToOptions = proxySponsorValues.map(val => ({
      label: val,
      value: val,
      selected: record.proxy && record.proxy.notificationsTo === val
    }));

    // const accrueToOptions = proxySponsorValues.map(val => ({
    //   label: val,
    //   value: val,
    //   selected: record.proxy && record.proxy.accrueTo === val
    // }));

    const proxyLink = (
      <div>
        <Link to={`/users/view/${record.user.id}`}>{getFullName(record.user)}</Link>
        {record.proxy && record.proxy.metadata && record.proxy.metadata.createdDate && (
          <span className={css.creationLabel}>
            {`(${intl.formatMessage({ id: 'ui-users.proxy.relationshipCreated' })}: ${stripes.formatDateTime(record.proxy.metadata.createdDate)})`}
          </span>
        )}
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
                    label={this.translate('proxy.relationshipStatus')}
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
                    label={this.translate('expirationDate')}
                    dateFormat="YYYY-MM-DD"
                    name={`${name}.proxy.expirationDate`}
                    backendDateStandard="YYYY-MM-DD"
                    onChange={() => defer(() => this.validateStatus())}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field label={this.translate('proxy.requestForSponsor')} name={`${name}.proxy.requestForSponsor`} component={Select} dataOptions={[...requestForSponsorOptions]} fullWidth />
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field label={this.translate('proxy.notificationsTo')} name={`${name}.proxy.notificationsTo`} component={Select} dataOptions={[...notificationsToOptions]} fullWidth />
                </Col>
              </Row>
            </Col>
            { /*
            Accrue-to functionality not yet available on backend
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field label={this.translate('proxy.accrueTo')} name={`${name}.proxy.accrueTo`} component={Select} dataOptions={[...accrueToOptions]} fullWidth />
                </Col>
              </Row>
            </Col>
            */ }
          </Row>
        </div>
      </div>
    );
  }
}

export default ProxyEditItem;
