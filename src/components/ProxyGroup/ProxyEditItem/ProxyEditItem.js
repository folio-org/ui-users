import React from 'react';
import {
  FormattedMessage,
  FormattedTime,
} from 'react-intl';
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
  getFormValues,
} from 'redux-form';

import { getFullName } from '../../util';
import css from './ProxyEditItem.css';

class ProxyEditItem extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    record: PropTypes.object,
    namespace: PropTypes.string, // sponsors or proxies
    name: PropTypes.string,
    onDelete: PropTypes.func,
    stripes: PropTypes.object,
    change: PropTypes.func.isRequired,
    getWarning: PropTypes.func.isRequired,
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
    defer(() => this.updateStatus());
  }

  componentDidUpdate(prevProps, prevState) {
    const { namespace, index } = this.props;
    const prevProxyRel = (prevState.formValues[namespace] || [])[index] || {};
    const proxyRel = this.state.formValues[namespace][index] || {};

    if (!isEqual(this.state.formValues, prevState.formValues) &&
      prevProxyRel.proxy.status === proxyRel.proxy.status) {
      this.updateStatus();
    }
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

  /**
   * updateStatus
   * `status` does double-duty on this form:
   *
   * 1. it is a user-settable toggle indicating if the relationship
   *    is active or inactive
   * 2. it is indication of whether the relationship is active based
   *    on the values in other fields, i.e. the relationship cannot
   *    be active if it is expired or if one of the parties is expired.
   *
   * Note: an expired relationship is not a validation error.
   *
   * Here, we're dealing with part-2: forcing the status to `inactive`
   * based on the values in other fields. We can coopt `props.getWarning`
   * to do that: if there's a warning, it will NOT be active.
   *
   */
  updateStatus() {
    const {
      index,
      getWarning,
      namespace,
    } = this.props;

    const formValues = this.state.formValues;
    this.toggleStatus(!getWarning(formValues, namespace, index));
  }

  optionsFor = (list) => {
    return list.map(option => (
      <FormattedMessage id={`ui-users.${option}`} key={option}>
        {(optionTranslated) => <option value={option}>{optionTranslated}</option>}
      </FormattedMessage>
    ));
  }

  render() {
    const {
      name,
      record,
      onDelete,
    } = this.props;

    const activeOptions = this.state.statusDisabled ? ['inactive'] : ['active', 'inactive'];
    const relationStatusOptions = this.optionsFor(activeOptions);

    const requestForSponsorOptions = this.optionsFor(['yes', 'no']);
    const notificationsToOptions = this.optionsFor(['proxy', 'sponsor']);
    const proxyLinkMsg = <FormattedMessage id="ui-users.proxy.relationshipCreated" />;
    const proxyCreatedValue = get(record, 'proxy.metadata.createdDate', null);
    const proxyCreatedDate = proxyCreatedValue ? <FormattedTime
      value={proxyCreatedValue}
      day="numeric"
      month="numeric"
      year="numeric"
    /> : '-';
    const proxyLink = (
      <div>
        <Link to={`/users/view/${record.user.id}`}>{getFullName(record.user)}</Link>
        {proxyCreatedValue && (
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
                <Col xs={12} data-test-proxy-relationship-status>
                  <Field
                    disabled={this.state.statusDisabled}
                    label={<FormattedMessage id="ui-users.proxy.relationshipStatus" />}
                    name={`${name}.proxy.status`}
                    component={Select}
                    fullWidth
                  >
                    {relationStatusOptions}
                  </Field>
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row>
                <Col xs={12} data-test-proxy-expiration-date>
                  <Field
                    component={Datepicker}
                    label={<FormattedMessage id="ui-users.expirationDate" />}
                    dateFormat="YYYY-MM-DD"
                    name={`${name}.proxy.expirationDate`}
                    onChange={() => defer(() => this.updateStatus())}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <Row>
                <Col xs={12} data-test-proxy-can-request-for-sponsor>
                  <Field
                    label={<FormattedMessage id="ui-users.proxy.requestForSponsor" />}
                    name={`${name}.proxy.requestForSponsor`}
                    component={Select}
                    fullWidth
                  >
                    {requestForSponsorOptions}
                  </Field>
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row>
                <Col xs={12} data-test-proxy-notifications-sent-to>
                  <Field
                    label={<FormattedMessage id="ui-users.proxy.notificationsTo" />}
                    name={`${name}.proxy.notificationsTo`}
                    component={Select}
                    fullWidth
                  >
                    {notificationsToOptions}
                  </Field>
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

export default ProxyEditItem;
