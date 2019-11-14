import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import { AppIcon } from '@folio/stripes/core';
import {
  Paneset,
  Pane,
  PaneMenu,
  PaneHeaderIconButton,
  PaneFooter,
  Button,
  ExpandAllButton,
  expandAllFunction,
  Row,
  Col,
  Headline,
  HasCommand,
  AccordionSet,
} from '@folio/stripes/components';
import stripesForm from '@folio/stripes/form';

import {
  EditUserInfo,
  EditExtendedInfo,
  EditContactInfo,
  EditProxy,
  EditServicePoints,
} from '../../components/EditSections';
import { getFullName } from '../../components/util';
import PermissionsAccordion from '../../components/PermissionsAccordion';
import {
  statusFilterConfig,
  permissionTypeFilterConfig,
} from '../../components/PermissionsAccordion/helpers/filtersConfig';
import { addressTypesShape } from '../../shapes';

import css from './UserForm.css';

function validate(values, props) {
  const errors = {};
  errors.personal = {};

  if (!values.personal || !values.personal.lastName) {
    errors.personal.lastName = <FormattedMessage id="ui-users.errors.missingRequiredField" />;
  }

  if (!values.username && values.creds && values.creds.password) {
    errors.username = <FormattedMessage id="ui-users.errors.missingRequiredUsername" />;
  }

  if (!props.initialValues.id && (!values.creds || !values.creds.password) && values.username) {
    errors.creds = { password: <FormattedMessage id="ui-users.errors.missingRequiredPassword" /> };
  }

  if (!values.patronGroup) {
    errors.patronGroup = <FormattedMessage id="ui-users.errors.missingRequiredPatronGroup" />;
  }

  if (!values.personal || !values.personal.preferredContactTypeId) {
    if (errors.personal) errors.personal.preferredContactTypeId = <FormattedMessage id="ui-users.errors.missingRequiredContactType" />;
    else errors.personal = { preferredContactTypeId: <FormattedMessage id="ui-users.errors.missingRequiredContactType" /> };
  }

  if (values.personal && values.personal.addresses) {
    errors.personal.addresses = [];
    values.personal.addresses.forEach((addr) => {
      const err = (!addr.addressType) ? { addressType: <FormattedMessage id="ui-users.errors.missingRequiredAddressType" /> } : {};
      errors.personal.addresses.push(err);
    });
  }

  if (values.servicePoints && values.servicePoints.length > 0 && values.preferredServicePoint === undefined) {
    errors.preferredServicePoint = <FormattedMessage id="ui-users.errors.missingRequiredPreferredServicePoint" />;
  }

  return errors;
}

/**
 * getProxySponsorWarning
 * Return a warning for the given namespace-index pair if any one of these
 * conditions is true:
 *
 * 1. the current user is expired
 * 2. the proxy or sponsor is expired
 * 3. the proxy relationship itself is expired
 *
 * Return an empty string otherwise.
 *
 * Sometimes, a date is just a date and you don't care about the time. If
 * Harry Potter were born at 12:30 a.m. on July 31 in London, there wouldn't
 * be anybody in Boston claiming his birthday was July 30 because it's only
 * 8:30 p.m. in Boston. July 31 is July 31, end of story. Thus, the `day`
 * modifier to all the date comparisons here; we DO NOT CARE about the time.
 *
 * @param object values all form values
 * @param enum namespace one of `proxies` or `sponsors`
 * @param int index index into the array
 *
 * @return empty string indicates no warnings; a string contains a warning message.
 */
function getProxySponsorWarning(values, namespace, index) {
  const proxyRel = values[namespace][index] || {};
  const today = moment().endOf('day');
  let warning = '';

  // proxy/sponsor user expired
  if (get(proxyRel, 'user.expirationDate') && moment(proxyRel.user.expirationDate).isSameOrBefore(today, 'day')) {
    warning = <FormattedMessage id={`ui-users.errors.${namespace}.expired`} />;
  }

  // current user expired
  if (values.expirationDate && moment(values.expirationDate).isSameOrBefore(today, 'day')) {
    warning = <FormattedMessage id="ui-users.errors.currentUser.expired" />;
  }

  // proxy relationship expired
  if (get(proxyRel, 'proxy.expirationDate') &&
    moment(proxyRel.proxy.expirationDate).isSameOrBefore(today, 'day')) {
    warning = <FormattedMessage id="ui-users.errors.proxyrelationship.expired" />;
  }

  return warning;
}

function warn(values, props) {
  const warnings = {};

  // note: warnings derived from any field in a proxy-sponsor relationship
  // are always displayed on the `status` field. `props.touch` is necessary
  // in order to trigger validation of the status field and thus show the
  // new warning that has been attached to it.
  ['sponsors', 'proxies'].forEach(namespace => {
    if (values[namespace]) {
      values[namespace].forEach((item, index) => {
        const warning = getProxySponsorWarning(values, namespace, index);
        if (warning) {
          if (!warnings[namespace]) {
            warnings[namespace] = [];
          }
          warnings[namespace][index] = { proxy: { status: warning } };
          props.touch(`${namespace}[${index}].proxy.status`);
        }
      });
    }
  });

  return warnings;
}

function asyncValidateField(field, value, validator) {
  return new Promise((resolve, reject) => {
    const query = `(${field}=="${value}")`;
    validator.reset();

    return validator.GET({ params: { query } }).then((users) => {
      if (users.length > 0) {
        const error = { [field]: <FormattedMessage id={`ui-users.errors.${field}Unavailable`} /> };
        return reject(error);
      } else {
        return resolve();
      }
    });
  });
}

function asyncValidate(values, dispatch, props, blurredField) {
  const { uniquenessValidator, initialValues } = props;
  const { username, barcode } = values;
  if (username) {
    values.username = username.trim();
  }
  const curValue = values[blurredField];
  const prevValue = initialValues[blurredField];

  // validate on blur
  if (blurredField && curValue && curValue !== prevValue) {
    return asyncValidateField(blurredField, curValue, uniquenessValidator);
  }

  const promises = [];

  // validate on submit

  if (username !== initialValues.username) {
    promises.push(asyncValidateField('username', username, uniquenessValidator));
  }

  if (barcode && barcode !== initialValues.barcode) {
    promises.push(asyncValidateField('barcode', barcode, uniquenessValidator));
  }

  return Promise.all(promises);
}

class UserForm extends React.Component {
  static propTypes = {
    change: PropTypes.func,
    addressTypes: addressTypesShape,
    formData: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    location: PropTypes.object,
    history: PropTypes.object,
    uniquenessValidator: PropTypes.shape({
      reset: PropTypes.func.isRequired,
      GET: PropTypes.func.isRequired,
    }).isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object.isRequired,
  };

  static defaultProps = {
    pristine: false,
    submitting: false,
    invalid: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      sections: {
        editUserInfo: true,
        extendedInfo: true,
        contactInfo: true,
        proxyAccordion: false,
        permissions: false,
        servicePoints: false,
      },
    };

    this.closeButton = React.createRef();
    this.saveButton = React.createRef();
    this.cancelButton = React.createRef();

    this.keyboardCommands = [
      {
        name: 'save',
        handler: this.handleSaveKeyCommand
      },
      {
        name: 'ignoreEnter',
        handler: this.ignoreEnterKey,
        shortcut: 'enter'
      },
      {
        name: 'cancel',
        handler: this.handleCancel,
        shortcut: 'esc'
      },
      {
        name: 'expandAllSections',
        handler: this.expandAllSections,
      },
      {
        name: 'collapseAllSections',
        handler: this.collapseAllSections,
      }
    ];
  }

  handleCancel = () => {
    this.props.history.goBack();
  }

  getAddFirstMenu() {
    return (
      <PaneMenu>
        <FormattedMessage id="ui-users.crud.closeNewUserDialog">
          {ariaLabel => (
            <PaneHeaderIconButton
              id="clickable-closenewuserdialog"
              onClick={this.handleCancel}
              ref={this.closeButton}
              ariaLabel={ariaLabel}
              icon="times"
            />
          )}
        </FormattedMessage>
      </PaneMenu>
    );
  }

  handleExpandAll = (sections) => {
    this.setState({ sections });
  }

  ignoreEnterKey = (e) => {
    const allowedControls = [
      this.closeButton.current,
      this.saveButton.current,
      this.cancelButton.current,
    ];

    if (!allowedControls.includes(e.target)) {
      e.preventDefault();
    }
  };

  handleSectionToggle = ({ id }) => {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];

      return newState;
    });
  }

  toggleAllSections = (expand) => {
    this.setState((curState) => {
      const newSections = expandAllFunction(curState.sections, expand);

      return {
        sections: newSections
      };
    });
  }

  expandAllSections = (e) => {
    e.preventDefault();
    this.toggleAllSections(true);
  }

  collapseAllSections = (e) => {
    e.preventDefault();
    this.toggleAllSections(false);
  }

  handleSaveKeyCommand = (e) => {
    e.preventDefault();
    this.executeSave();
  };

  executeSave() {
    const {
      handleSubmit,
      onSubmit,
    } = this.props;

    const submitter = handleSubmit(onSubmit);

    submitter();
  }

  getPaneFooter() {
    const {
      pristine,
      submitting,
      invalid,
      onCancel,
    } = this.props;

    const disabled = pristine || submitting || invalid;

    const startButton = (
      <Button
        data-test-user-form-cancel-button
        marginBottom0
        id="clickable-cancel"
        buttonStyle="default mega"
        buttonRef={this.cancelButton}
        onClick={onCancel}
      >
        <FormattedMessage id="ui-users.cancel" />
      </Button>
    );

    const endButton = (
      <Button
        data-test-user-form-submit-button
        marginBottom0
        id="clickable-save"
        buttonStyle="primary mega"
        type="submit"
        disabled={disabled}
        buttonRef={this.saveButton}
      >
        <FormattedMessage id="ui-users.saveAndClose" />
      </Button>
    );

    return (
      <PaneFooter
        renderStart={startButton}
        renderEnd={endButton}
        className={css.paneFooterClass}
        innerClassName={css.paneFooterContentClass}
      />
    );
  }

  render() {
    const {
      initialValues,
      handleSubmit,
      formData,
      change, // from redux-form...
      servicePoints,
    } = this.props;

    const { sections } = this.state;
    const firstMenu = this.getAddFirstMenu();
    const footer = this.getPaneFooter();
    const fullName = getFullName(initialValues);
    const paneTitle = initialValues.id
      ? fullName
      : <FormattedMessage id="ui-users.crud.createUser" />;

    return (
      <HasCommand commands={this.keyboardCommands}>
        <form
          data-test-form-page
          className={css.UserFormRoot}
          id="form-user"
          onSubmit={handleSubmit}
        >
          <Paneset>
            <Pane
              defaultWidth="100%"
              firstMenu={firstMenu}
              footer={footer}
              appIcon={<AppIcon app="users" appIconKey="users" />}
              paneTitle={
                <span data-test-header-title>
                  {paneTitle}
                </span>
              }
            >
              <div className={css.UserFormContent}>
                <Headline
                  size="xx-large"
                  tag="h2"
                  data-test-header-title
                >
                  {fullName}
                </Headline>
                <Row end="xs">
                  <Col xs>
                    <ExpandAllButton
                      accordionStatus={sections}
                      onToggle={this.handleExpandAll}
                    />
                  </Col>
                </Row>
                <AccordionSet>
                  <EditUserInfo
                    accordionId="editUserInfo"
                    expanded={sections.editUserInfo}
                    onToggle={this.handleSectionToggle}
                    initialValues={initialValues}
                    patronGroups={formData.patronGroups}
                  />
                  <EditExtendedInfo
                    accordionId="extendedInfo"
                    expanded={sections.extendedInfo}
                    onToggle={this.handleSectionToggle}
                    userId={initialValues.id}
                    userFirstName={initialValues.personal.firstName}
                    userEmail={initialValues.personal.email}
                    servicePoints={servicePoints}
                    addressTypes={formData.addressTypes}
                  />
                  <EditContactInfo
                    accordionId="contactInfo"
                    expanded={sections.contactInfo}
                    onToggle={this.handleSectionToggle}
                    addressTypes={formData.addressTypes}
                    preferredContactTypeId={initialValues.preferredContactTypeId}
                  />
                  {initialValues.id &&
                    <div>
                      <EditProxy
                        accordionId="proxyAccordion"
                        expanded={sections.proxy}
                        onToggle={this.handleSectionToggle}
                        sponsors={initialValues.sponsors}
                        proxies={initialValues.proxies}
                        fullName={fullName}
                        change={change}
                        initialValues={initialValues}
                        getWarning={getProxySponsorWarning}
                      />
                      <PermissionsAccordion
                        filtersConfig={[
                          permissionTypeFilterConfig,
                          statusFilterConfig,
                        ]}
                        visibleColumns={[
                          'selected',
                          'permissionName',
                          'type',
                          'status',
                        ]}
                        accordionId="permissions"
                        expanded={sections.permissions}
                        onToggle={this.handleSectionToggle}
                        headlineContent={<FormattedMessage id="ui-users.permissions.userPermissions" />}
                        permToRead="perms.permissions.get"
                        permToDelete="perms.permissions.item.delete"
                        permToModify="perms.permissions.item.put"
                        formName="userForm"
                        permissionsField="permissions"
                      />
                      <EditServicePoints
                        accordionId="servicePoints"
                        expanded={sections.servicePoints}
                        onToggle={this.handleSectionToggle}
                        {...this.props}
                      />
                    </div>
                  }
                </AccordionSet>
              </div>
            </Pane>
          </Paneset>
        </form>
      </HasCommand>
    );
  }
}

export default stripesForm({
  form: 'userForm',
  validate,
  warn,
  asyncValidate,
  asyncBlurFields: ['username', 'barcode'],
  navigationCheck: true,
  enableReinitialize: true,
})(UserForm);
