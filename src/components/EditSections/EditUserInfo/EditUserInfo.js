import get from 'lodash/get';
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
  dayjs,
} from '@folio/stripes/components';
import { ViewMetaData } from '@folio/stripes/smart-components';

import {
  USER_TYPES,
  USER_TYPE_FIELD,
  CUSTOM_FIELDS_SECTION,
} from '../../../constants';
import { isConsortiumEnabled } from '../../util';
import asyncValidateField from '../../validators/asyncValidateField';
import validateMinDate from '../../validators/validateMinDate';

import { ChangeUserTypeModal, EditUserProfilePicture } from './components';
import EditCustomFieldsSection from '../EditCustomFieldsSection';

import css from './EditUserInfo.css';
import { validateLength } from '../../validators/validateLength';
import {
  BARCODE_GENERATOR_CODE,
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
    const recalculatedDate = this.calculateNewExpirationDate(startCalcToday).format('YYYY-MM-DD');
    const parsedRecalculatedDate = this.parseExpirationDate(recalculatedDate);

    change('expirationDate', parsedRecalculatedDate);
    this.setState({ showRecalculateModal: false });
  }

  setChangedUserType = (userType) => {
    const { form: { change } } = this.props;
    change(USER_TYPE_FIELD, userType);
    this.setState({ showUserTypeModal: false });
  }

  /**
   * Calculates a new expiration date by adding the patron group's offset days
   * to either today's date or the existing expiration date.
   *
   * All calculations are performed in the tenant's timezone to ensure
   * consistent date arithmetic regardless of the user's browser timezone.
   *
   * @param {boolean} startCalcToday - If true, calculate from today; if false, from existing expiration date
   * @returns {object} dayjs object representing the new expiration date in tenant timezone
   */
  calculateNewExpirationDate = (startCalcToday) => {
    const {
      initialValues,
      stripes,
    } = this.props;
    const {
      timezone = 'UTC',
    } = stripes;

    // Use tenant timezone for date calculations to ensure consistency
    const now = dayjs().tz(timezone);
    const expirationDate = initialValues.expirationDate ? dayjs.tz(initialValues.expirationDate, timezone) : now;
    const offsetOfSelectedPatronGroup = this.state.selectedPatronGroup ? this.getPatronGroupOffset() : '';

    const shouldRecalculateFromToday = startCalcToday || initialValues.expirationDate === undefined || expirationDate.isSameOrBefore(now);
    const baseDate = shouldRecalculateFromToday ? now : expirationDate;

    const result = baseDate.add(offsetOfSelectedPatronGroup, 'd');

    return result;
  }

  getPatronGroupOffset = () => {
    const selectedPatronGroup = this.props.patronGroups.find(i => i.id === this.state.selectedPatronGroup);
    return get(selectedPatronGroup, 'expirationOffsetInDays', '');
  };

  /**
   * Parses expiration date input and converts to UTC ISO string for consistent storage.
   *
   * This function handles both:
   * 1. ISO date strings (YYYY-MM-DD) from recalculation - converted to UTC end-of-day
   * 2. Date strings from manual datepicker input - parsed and converted to UTC end-of-day
   *
   * We store dates as UTC end-of-day to ensure the user gets the full day of access.
   * The timezone-aware comparison logic in getNowAndExpirationEndOfDayInTenantTz
   * handles proper expiration timing based on the tenant's timezone.
   * This ensures consistent display in the datepicker regardless of timezone.
   *
   * @param {string} expirationDate - Date input (ISO string from calculation or datepicker input)
   * @returns {string} UTC ISO string for storage (end of day)
   */
  parseExpirationDate = (expirationDate) => {
    if (!expirationDate) return expirationDate;

    const dateToStore = dayjs.utc(expirationDate).endOf('day').toISOString();

    return dateToStore;
  };

  /**
   * Creates timezone-aware date objects for expiration comparison.
   *
   * This function extracts just the date part (YYYY-MM-DD) from the UTC stored expiration date because:
   * 1. Dates are stored as UTC end-of-day (e.g., "2025-07-31T23:59:59.999Z") and not end-of-day for some old data
   * 2. We need to compare the expiration date against the current time in the tenant's timezone
   * 3. A user should expire at midnight in their local timezone, not at a UTC-based time
   *
   * @param {string} expDate - UTC ISO string of the expiration date
   * @returns {Object} Object with nowInTenantTz and expirationEndOfDayInTenantTz dayjs instances
   */
  getNowAndExpirationEndOfDayInTenantTz = (expDate) => {
    const { stripes } = this.props;
    const timezone = stripes.timezone || 'UTC';

    // Use `dayjs.utc` rather than `dayjs` to avoid month and day shifting due to local timezone.
    // For example, if timezone is UTC+3 and the `expirationDate` is 2025-07-31T23:59:59.999Z,
    // `dayjs('2025-07-31T23:59:59.999Z')` will be parsed as 2025-08-01T02:59:59+03:00
    // with the 3 hours offset applied (month and day are changed).
    // The `dayjs.utc` ensures that we get the exact date and time as stored in the database without any timezone adjustments.
    // `dayjs.utc('2025-07-31T23:59:59.999Z')` returns 2025-07-31T23:59:59Z.
    const expirationDate = dayjs.utc(expDate);
    // Format using `.format('YYYY-MM-DD')` to get just the date part, since the time can be incorrect for some old data.
    const expirationDateString = expirationDate.format('YYYY-MM-DD');

    // Create end of day in tenant timezone for that date. Use `timezone`, otherwise when switching the timezone in the settings,
    // it will not be taken into account in the calculations.
    const expirationEndOfDayInTenantTz = dayjs.tz(expirationDateString, timezone).endOf('day');
    // Same here, if you switch the timezone in the settings, `dayjs()` without timezone specified will use your local timezone,
    // not the one selected in the settings.
    const nowInTenantTz = dayjs().tz(timezone);

    return {
      nowInTenantTz,
      expirationEndOfDayInTenantTz,
    };
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
      if (!initialValues.expirationDate) return false;

      const { nowInTenantTz, expirationEndOfDayInTenantTz } = this.getNowAndExpirationEndOfDayInTenantTz(initialValues.expirationDate);

      return expirationEndOfDayInTenantTz.isBefore(nowInTenantTz);
    };

    const willUserExtend = () => {
      const expirationDate = form.getFieldState('expirationDate')?.value ?? '';

      if (!expirationDate) return false;

      const { nowInTenantTz, expirationEndOfDayInTenantTz } = this.getNowAndExpirationEndOfDayInTenantTz(expirationDate);

      return expirationEndOfDayInTenantTz.isAfter(nowInTenantTz);
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
    const date = this.calculateNewExpirationDate(true);

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
                    timeZone="UTC"
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
                      generator={BARCODE_GENERATOR_CODE}
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
            <EditCustomFieldsSection
              sectionId={CUSTOM_FIELDS_SECTION.USER_INFO}
            />
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
              values={{
                group,
                offset,
                date: intl.formatDate(date, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }}
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
