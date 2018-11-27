import React from 'react';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
  intlShape
} from 'react-intl';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import {
  defer,
  isEqual,
  get
} from 'lodash';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Datepicker,
  LayoutHeader,
  Select,
} from '@folio/stripes/components';
import {
  Field,
  stopSubmit,
  setSubmitFailed,
  getFormSubmitErrors,
  getFormValues,
} from 'redux-form';

import { getFullName } from '../../../util';
import css from './ProxyEditItem.css';

class ProxyEditItem extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    intl: intlShape,
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
    const {
      name,
      namespace,
      index,
      stripes: {
        store,
      },
    } = this.props;
    const fieldName = `${name}.proxy.status`;
    const errors = getFormSubmitErrors('userForm')(store.getState());
    errors[namespace] = errors[namespace] || new Array(index + 1);
    errors[namespace][index] = { proxy: { status: message } };

    store.dispatch(stopSubmit('userForm', errors));
    store.dispatch(setSubmitFailed('userForm', [fieldName]));
  }

  toggleStatus(isActive) {
    const {
      name,
      change,
    } = this.props;
    const status = (isActive) ? 'Active' : 'Inactive';
    change(`${name}.proxy.status`, status);
    this.setState({ statusDisabled: !isActive });
  }

  validateStatus() {
    const {
      namespace,
      index,
    } = this.props;
    const formValues = this.state.formValues;
    const proxyRel = formValues[namespace][index] || {};
    const today = moment().endOf('day');
    let error = '';

    // proxy user expired
    if (moment(proxyRel.user.expirationDate).endOf('day').isSameOrBefore(today)) {
      error = <FormattedMessage id={`ui-users.errors.${namespace}.expired`} />;
    }

    // user expired
    if (moment(formValues.expirationDate).endOf('day').isSameOrBefore(today)) {
      error = <FormattedMessage id={`ui-users.errors.${namespace}.expired`} />;
    }

    // proxy relationship expired
    if (proxyRel.proxy.expirationDate &&
      moment(proxyRel.proxy.expirationDate).endOf('day').isSameOrBefore(today)) {
      error = <FormattedMessage id="ui-users.errors.proxyrelationship.expired" />;
    }

    if (error) {
      this.toggleStatus(false);
      return this.dispatchError(error);
    }

    return this.toggleStatus(true);
  }

  render() {
    const {
      name,
      record,
      onDelete,
      intl: { formatMessage }
    } = this.props;

    const relationStatusOptions = ['active', 'inactive'].map(option => ({
      label: formatMessage({ id: `ui-users.${option}` }),
      value: option,
      selected: record.proxy && record.proxy.status === option,
    }));

    const requestForSponsorOptions = ['yes', 'no'].map(option => ({
      label: formatMessage({ id: `ui-users.${option}` }),
      value: option,
      selected: record.proxy && record.proxy.requestForSponsor === option,
    }));

    const notificationsToOptions = ['proxy', 'sponsor'].map(option => ({
      label: formatMessage({ id: `ui-users.${option}` }),
      value: option,
      selected: record.proxy && record.proxy.notificationsTo === option,
    }));

    // const accrueToOptions = proxySponsorValues.map(option => ({
    //   label: formatMessage({ id: `ui-users.${option}` }),
    //   value: option,
    //   selected: record.proxy && record.proxy.accrueTo === option
    // }));
    const proxyLinkMsg = <FormattedMessage id="ui-users.proxy.relationshipCreated" />;
    const proxyCreatedDate = <FormattedTime
      value={get(record, 'proxy.metadata.createdDate', null)}
      day="numeric"
      month="numeric"
      year="numeric"
    />;
    const proxyLink = (
      <div>
        <Link to={`/users/view/${record.user.id}`}>{getFullName(record.user)}</Link>
        {proxyCreatedDate && (
          <span className={css.creationLabel}>
            (
              {proxyLinkMsg}
              {' '}
              {proxyCreatedDate}
            )
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
                    label={<FormattedMessage id="ui-users.proxy.relationshipStatus" />}
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
                    label={<FormattedMessage id="ui-users.expirationDate" />}
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
                  <Field
                    label={<FormattedMessage id="ui-users.proxy.requestForSponsor" />}
                    name={`${name}.proxy.requestForSponsor`}
                    component={Select}
                    dataOptions={[...requestForSponsorOptions]}
                    fullWidth
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field
                    label={<FormattedMessage id="ui-users.proxy.notificationsTo" />}
                    name={`${name}.proxy.notificationsTo`}
                    component={Select}
                    dataOptions={[...notificationsToOptions]}
                    fullWidth
                  />
                </Col>
              </Row>
            </Col>
            { /*
            Accrue-to functionality not yet available on backend
            <Col xs={4}>
              <Row>
                <Col xs={12}>
                  <Field
                    label={<FormattedMessage id="ui-users.proxy.accrueTo" />}
                    name={`${name}.proxy.accrueTo`}
                    component={Select}
                    dataOptions={[...accrueToOptions]}
                    fullWidth
                  />
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

export default injectIntl(ProxyEditItem);
