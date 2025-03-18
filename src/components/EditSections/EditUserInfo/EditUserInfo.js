import get from 'lodash/get';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';
import { Field } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { FormattedMessage, injectIntl } from 'react-intl';

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
import { ViewMetaData } from '@folio/stripes/smart-components';

import { USER_TYPES, USER_TYPE_FIELD } from '../../../constants';
import { isConsortiumEnabled } from '../../util';
import asyncValidateField from '../../validators/asyncValidateField';
import validateMinDate from '../../validators/validateMinDate';

import { ChangeUserTypeModal, EditUserProfilePicture } from './components';

import css from './EditUserInfo.css';
import { validateLength } from '../../validators/validateLength';
import {
  BARCODE_SETTING,
  NUMBER_GENERATOR_OPTIONS_ON_EDITABLE,
  NUMBER_GENERATOR_OPTIONS_ON_NOT_EDITABLE,
} from '../../../settings/NumberGeneratorSettings/constants';

class EditUserInfo extends React.Component {
  static propTypes = {
    accordionId: PropTypes.string.isRequired,
    expanded: PropTypes.bool,
    initialValues: PropTypes.object,
    intl: PropTypes.object.isRequired,
    onToggle: PropTypes.func,
    patronGroups: PropTypes.arrayOf(PropTypes.object),
    stripes: PropTypes.shape({
      timezone: PropTypes.string.isRequired,
      locale: PropTypes.string.isRequired,
      store: PropTypes.shape({
        dispatch: PropTypes.func.isRequired,
        getState: PropTypes.func,
      }),
      hasPerm: PropTypes.func,
    }).isRequired,
    form: PropTypes.object,
    disabled: PropTypes.bool,
    numberGeneratorData: PropTypes.object,
    uniquenessValidator: PropTypes.object,
    profilePictureConfig: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { initialValues: { patronGroup } } = props;
    this.state = {
      showRecalculateModal: false,
      showUserTypeModal: false,
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
    const parsedRecalculatedDate = this.parseExpirationDate(recalculatedDate);

    change('expirationDate', parsedRecalculatedDate);
    this.setState({ showRecalculateModal: false });
  }

  setChangedUserType = (userType) => {
    const { form: { change } } = this.props;
    change(USER_TYPE_FIELD, userType);
    this.setState({ showUserTypeModal: false });
  }

  calculateNewExpirationDate = (startCalcToday) => {
    const { initialValues, stripes: { locale } } = this.props;
    const expirationDate = new Date(initialValues.expirationDate);
    const now = Date.now();
    const offsetOfSelectedPatronGroup = this.state.selectedPatronGroup ? this.getPatronGroupOffset() : '';

    const shouldRecalculateFromToday = startCalcToday || initialValues.expirationDate === undefined || expirationDate <= now;
    const baseDate = shouldRecalculateFromToday ? moment() : moment(expirationDate);

    return baseDate.add(offsetOfSelectedPatronGroup, 'd').locale(locale).format('L');
  }

  getPatronGroupOffset = () => {
    const selectedPatronGroup = this.props.patronGroups.find(i => i.id === this.state.selectedPatronGroup);
    return get(selectedPatronGroup, 'expirationOffsetInDays', '');
  };

  parseExpirationDate = (expirationDate) => {
    const {
      stripes: {
        timezone,
      },
    } = this.props;

    return expirationDate
      ? moment.tz(expirationDate, timezone).endOf('day').toDate().toISOString()
      : expirationDate;
  };

  render() {
    const {
      patronGroups,
      initialValues,
      expanded,
      onToggle,
      accordionId,
      intl,
      stripes,
      uniquenessValidator,
      disabled,
      profilePictureConfig,
      form,
      numberGeneratorData,
    } = this.props;

    const isConsortium = isConsortiumEnabled(stripes);
    const { barcode } = initialValues;

    const isUserExpired = () => {
      const expirationDate = new Date(initialValues.expirationDate);
      const now = Date.now();
      return expirationDate <= now;
    };

    const willUserExtend = () => {
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
    const group = get(this.props.patronGroups.find(i => i.id === this.state.selectedPatronGroup), 'group', '');
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

    const hasViewProfilePicturePerm = stripes.hasPerm('ui-users.profile-pictures.view');
    const areProfilePicturesEnabled = profilePictureConfig?.enabled;
    const displayProfilePicture = areProfilePicturesEnabled && hasViewProfilePicturePerm && !isShadowUser;

    const isBarcodeDisabled = numberGeneratorData?.[BARCODE_SETTING] === NUMBER_GENERATOR_OPTIONS_ON_NOT_EDITABLE;
    const showNumberGeneratorForBarcode = isBarcodeDisabled || numberGeneratorData?.[BARCODE_SETTING] === NUMBER_GENERATOR_OPTIONS_ON_EDITABLE;

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
            <Col xs={displayProfilePicture ? 9 : 12}>
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
                    required={!disabled}
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
                  <Field
                    label={<FormattedMessage id="ui-users.information.barcode" />}
                    name="barcode"
                    id="adduser_barcode"
                    component={TextField}
                    validate={asyncValidateField('barcode', barcode, uniquenessValidator)}
                    fullWidth
                    disabled={disabled || isBarcodeDisabled}
                  />
                  {showNumberGeneratorForBarcode &&
                    <NumberGeneratorModalButton
                      buttonLabel={<FormattedMessage id="ui-users.numberGenerator.generateBarcode" />}
                      callback={(generated) => form.change('barcode', generated)}
                      id="userbarcode"
                      generateButtonLabel={<FormattedMessage id="ui-users.numberGenerator.generateBarcode" />}
                      generator="users_patronBarcode"
                      modalProps={{
                        label: <FormattedMessage id="ui-users.numberGenerator.barcodeGenerator" />
                      }}
                    />
                  }
                </Col>
              </Row>
            </Col>

            {
              displayProfilePicture &&
              <Col xs={3}>
                <Row>
                  <Col xs={12}>
                    <EditUserProfilePicture
                      profilePictureId={initialValues?.personal?.profilePictureLink}
                      personal={initialValues?.personal}
                      profilePictureMaxFileSize={profilePictureConfig?.maxFileSize}
                      form={form}
                    />
                    <Field
                      name="personal.profilePictureLink"
                    >
                      {
                        (props) => (
                          <input type="hidden" {...props.input} />
                        )
                      }
                    </Field>
                  </Col>
                </Row>
              </Col>
            }
          </Row>
          <Row>
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
              >
                <OnChange name={USER_TYPE_FIELD}>
                  {(selectedUserType) => {
                    if (isConsortium
                      && initialValues.type === USER_TYPES.STAFF
                      && selectedUserType === USER_TYPES.PATRON
                    ) {
                      this.setState({ showUserTypeModal: true });
                    }
                  }}
                </OnChange>
              </Field>
            </Col>
            <Col xs={12} md={3}>
              <Field
                label={<FormattedMessage id="ui-users.information.pronouns" />}
                name="personal.pronouns"
                id="adduser_pronouns"
                component={TextField}
                validate={validateLength('ui-users.errors.personal.pronounsCharLimit')}
                fullWidth
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
        <ChangeUserTypeModal
          onChange={this.setChangedUserType}
          initialUserType={initialValues.type}
          open={this.state.showUserTypeModal}
        />
      </>
    );
  }
}

export default injectIntl(EditUserInfo);
