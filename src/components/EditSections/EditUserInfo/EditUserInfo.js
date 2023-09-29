import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import moment from 'moment-timezone';
import { OnChange } from 'react-final-form-listeners';

import { ViewMetaData } from '@folio/stripes/smart-components';
import { NumberGeneratorModalButton } from '@folio/service-interaction';

import {
  Button,
  Select,
  TextField,
  Row,
  Col,
  Accordion,
  Datepicker,
  Headline,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';

import { USER_TYPES, USER_TYPE_FIELD } from '../../../constants';
import { isConsortiumEnabled } from '../../util';
import asyncValidateField from '../../validators/asyncValidateField';
import validateMinDate from '../../validators/validateMinDate';

import css from './EditUserInfo.css';

class EditUserInfo extends React.Component {
  static propTypes = {
    accordionId: PropTypes.string.isRequired,
    expanded: PropTypes.bool,
    initialValues: PropTypes.object,
    intl: PropTypes.object.isRequired,
    onToggle: PropTypes.func,
    patronGroups: PropTypes.arrayOf(PropTypes.object),
    settings: PropTypes.arrayOf(PropTypes.object),
    stripes: PropTypes.shape({
      hasInterface: PropTypes.func.isRequired,
      timezone: PropTypes.string.isRequired,
      store: PropTypes.shape({
        dispatch: PropTypes.func.isRequired,
        getState: PropTypes.func,
      }),
    }).isRequired,
    form: PropTypes.object,
    disabled: PropTypes.bool,
    uniquenessValidator: PropTypes.object,
  };

  constructor(props) {
    super(props);

    const { initialValues: { patronGroup } } = props;
    this.state = {
      showRecalculateModal: false,
      selectedPatronGroup: patronGroup,
    };
  }

  showModal = (val) => {
    this.setState({
      showRecalculateModal: val,
    });
  }

  handleClose = () => {
    this.setState({ showRecalculateModal: false });
  }

  setRecalculatedExpirationDate = (startCalcToday) => {
    const { form: { change } } = this.props;
    const recalculatedDate = this.calculateNewExpirationDate(startCalcToday);

    change('expirationDate', recalculatedDate);
    this.setState({ showRecalculateModal: false });
  }

  calculateNewExpirationDate = (startCalcToday) => {
    const { initialValues } = this.props;
    const expirationDate = new Date(initialValues.expirationDate);
    const now = Date.now();
    const offsetOfSelectedPatronGroup = this.state.selectedPatronGroup ? this.getPatronGroupOffset() : '';
    let recalculatedDate;
    if (startCalcToday || initialValues.expirationDate === undefined || expirationDate <= now) {
      recalculatedDate = (moment().add(offsetOfSelectedPatronGroup, 'd').format('YYYY-MM-DD'));
    } else {
      recalculatedDate = (moment(expirationDate).add(offsetOfSelectedPatronGroup, 'd').format('YYYY-MM-DD'));
    }
    return recalculatedDate;
  }

  getPatronGroupOffset = () => {
    const selectedPatronGroup = this.props.patronGroups.find(i => i.id === this.state.selectedPatronGroup);
    return _.get(selectedPatronGroup, 'expirationOffsetInDays', '');
  };

  parseExpirationDate = (expirationDate) => {
    const {
      stripes: {
        timezone,
      },
    } = this.props;

    return expirationDate
      ? moment.tz(expirationDate, timezone).endOf('day').format()
      : expirationDate;
  };

  render() {
    const {
      disabled,
      patronGroups,
      initialValues,
      expanded,
      onToggle,
      accordionId,
      intl,
      uniquenessValidator,
      form: { change },
      settings,
      stripes
    } = this.props;

    let barcodeGeneratorSetting = 'useTextField';
    if (stripes.hasInterface('servint')) {
      const numberGeneratorSettings = JSON.parse((settings?.find(sett => sett.configName === 'number_generator') ?? { value: '{}' }).value);
      barcodeGeneratorSetting = numberGeneratorSettings?.barcodeGeneratorSetting ?? 'useTextField';
    }

    const isConsortium = isConsortiumEnabled(stripes);
    const { barcode } = initialValues;

    const isUserExpired = () => {
      const expirationDate = new Date(initialValues.expirationDate);
      const now = Date.now();
      return expirationDate <= now;
    };

    const willUserExtend = () => {
      const { form } = this.props;
      const expirationDate = form.getFieldState('expirationDate')?.value ?? '';
      const currentExpirationDate = new Date(expirationDate);
      const now = Date.now();
      return currentExpirationDate >= now;
    };

    const isStatusFieldDisabled = () => {
      let statusFieldDisabled = false;
      statusFieldDisabled = isUserExpired();
      return statusFieldDisabled;
    };

    const checkShowRecalculateButton = () => {
      const offsetOfSelectedPatronGroup = this.state.selectedPatronGroup ? this.getPatronGroupOffset() : '';
      return offsetOfSelectedPatronGroup !== '';
    };

    const patronGroupOptions = [
      {
        value: '',
        label: intl.formatMessage({ id: 'ui-users.information.selectPatronGroup' }),
      },
      ...patronGroups.map(g => ({
        key: g.id,
        value: g.id,
        label: g.group.concat(g.desc ? ` (${g.desc})` : ''),
      }))
    ];

    const statusOptions = [
      {
        value: true,
        label: intl.formatMessage({ id: 'ui-users.active' })
      },
      {
        value: false,
        label: intl.formatMessage({ id: 'ui-users.inactive' })
      }
    ];

    const isShadowUser = initialValues.type === USER_TYPES.SHADOW;
    const isSystemUser = initialValues.type === USER_TYPES.SYSTEM;
    const isUserTypeDisabled = isShadowUser || isSystemUser || disabled;

    const typeOptions = [
      {
        value: '',
        label: intl.formatMessage({ id: 'ui-users.information.selectUserType' }),
        visible: true,
      },
      {
        value: USER_TYPES.PATRON,
        label: intl.formatMessage({ id: 'ui-users.information.userType.patron' }),
        visible: !isShadowUser,
      },
      {
        value: USER_TYPES.STAFF,
        label: intl.formatMessage({ id: 'ui-users.information.userType.staff' }),
        visible: !isShadowUser,
      },
      {
        value: USER_TYPES.SHADOW,
        label: intl.formatMessage({ id: 'ui-users.information.userType.shadow' }),
        visible: isShadowUser,
      },
      {
        value: USER_TYPES.SYSTEM,
        label: intl.formatMessage({ id: 'ui-users.information.userType.system' }),
        visible: isSystemUser,
      }
    ].filter(o => o.visible);

    const offset = this.getPatronGroupOffset();
    const group = _.get(this.props.patronGroups.find(i => i.id === this.state.selectedPatronGroup), 'group', '');
    const date = moment(this.calculateNewExpirationDate(true)).format('LL');

    const modalFooter = (
      <ModalFooter>
        <Button
          id="expirationDate-modal-recalculate-btn"
          onClick={() => this.setRecalculatedExpirationDate(true)}
        >
          <FormattedMessage id="ui-users.information.recalculate.modal.button" />
        </Button>
        <Button
          id="expirationDate-modal-cancel-btn"
          onClick={this.handleClose}
        >
          <FormattedMessage id="ui-users.cancel" />
        </Button>
      </ModalFooter>
    );

    return (
      <>
        <Accordion
          label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.information.userInformation" /></Headline>}
          open={expanded}
          id={accordionId}
          onToggle={onToggle}
        >

          { initialValues.metadata && <ViewMetaData metadata={initialValues.metadata} /> }

          <Row>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.lastName" />}
                name="personal.lastName"
                id="adduser_lastname"
                component={TextField}
                required
                fullWidth
                autoFocus
                disabled={disabled}
              />
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.firstName" />}
                name="personal.firstName"
                id="adduser_firstname"
                component={TextField}
                fullWidth
                disabled={disabled}
              />
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.middleName" />}
                name="personal.middleName"
                id="adduser_middlename"
                component={TextField}
                fullWidth
                disabled={disabled}
              />
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.preferredName" />}
                name="personal.preferredFirstName"
                id="adduser_preferredname"
                component={TextField}
                fullWidth
                disabled={disabled}
              />
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.patronGroup" />}
                name="patronGroup"
                id="adduser_group"
                component={Select}
                selectClass={css.patronGroup}
                fullWidth
                dataOptions={patronGroupOptions}
                defaultValue={initialValues.patronGroup}
                aria-required="true"
                required
                disabled={disabled}
              />
              <OnChange name="patronGroup">
                {(selectedPatronGroup) => {
                  this.setState({ selectedPatronGroup }, () => {
                    if (this.getPatronGroupOffset()) {
                      this.showModal(true);
                    }
                  });
                }}
              </OnChange>
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.status" />}
                name="active"
                id="useractive"
                component={Select}
                fullWidth
                disabled={disabled || isStatusFieldDisabled()}
                dataOptions={statusOptions}
                defaultValue={initialValues.active}
                format={(v) => (v ? v.toString() : 'false')}
                aria-required="true"
                required
              />
              {isUserExpired() && (
                <span className={css.expiredMessage}>
                  <FormattedMessage id="ui-users.errors.userExpired" />
                </span>
              )}
              {isUserExpired() && willUserExtend() && (
                <p className={css.expiredMessage} id="saving-will-reactivate-user">
                  <FormattedMessage id="ui-users.information.recalculate.will.reactivate.user" />
                </p>
              )}
            </Col>
            <Col xs={12} md={3}>
              <Field
                component={Datepicker}
                label={<FormattedMessage id="ui-users.expirationDate" />}
                dateFormat="YYYY-MM-DD"
                defaultValue={initialValues.expirationDate}
                name="expirationDate"
                id="adduser_expirationdate"
                parse={this.parseExpirationDate}
                disabled={disabled}
                validate={validateMinDate('ui-users.errors.personal.dateOfBirth')}
              />
              {checkShowRecalculateButton() && (
                <Button
                  id="recalculate-expirationDate-btn"
                  onClick={() => this.setRecalculatedExpirationDate(false)}
                >
                  <FormattedMessage id="ui-users.information.recalculate.expirationDate" />
                </Button>
              )}
            </Col>
            <Col xs={12} md={3}>
              <Row>
                <Col xs={12}>
                  <Field
                    component={TextField}
                    disabled={disabled || barcodeGeneratorSetting === 'useGenerator'}
                    fullWidth
                    label={<FormattedMessage id="ui-users.information.barcode" />}
                    name="barcode"
                    id="adduser_barcode"
                    validate={asyncValidateField('barcode', barcode, uniquenessValidator)}
                  />
                </Col>
                {(
                  barcodeGeneratorSetting === 'useGenerator' ||
                  barcodeGeneratorSetting === 'useBoth'
                ) &&
                  <Col xs={12}>
                    <NumberGeneratorModalButton
                      buttonLabel={<FormattedMessage id="ui-users.numberGenerator.generateUserBarcode" />}
                      callback={(generated) => change('barcode', generated)}
                      id="userbarcode"
                      generateButtonLabel={<FormattedMessage id="ui-users.numberGenerator.generateUserBarcode" />}
                      generator="users_patronBarcode"
                      modalProps={{
                        label: <FormattedMessage id="ui-users.numberGenerator.userBarcodeGenerator" />
                      }}
                    />
                  </Col>
                }
              </Row>
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.userType" />}
                name={USER_TYPE_FIELD}
                id={USER_TYPE_FIELD}
                component={Select}
                fullWidth
                disabled={isUserTypeDisabled}
                dataOptions={typeOptions}
                aria-required={isConsortium}
                required={isConsortium}
              />
            </Col>
          </Row>
        </Accordion>
        <Modal
          footer={modalFooter}
          id="recalculate_expirationdate_modal"
          label={<FormattedMessage id="ui-users.information.recalculate.modal.label" />}
          open={this.state.showRecalculateModal}
        >
          <div>
            <FormattedMessage
              id="ui-users.information.recalculate.modal.text"
              values={{ group, offset, date }}
            />
          </div>
        </Modal>
      </>
    );
  }
}

export default injectIntl(EditUserInfo);
