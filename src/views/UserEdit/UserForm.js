import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';


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

  if (values.servicePoints && values.preferredServicePoint === undefined) {
    errors.preferredServicePoint = <FormattedMessage id="ui-users.errors.missingRequiredPreferredServicePoint" />;
  }

  return errors;
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
    stripes: PropTypes.shape({
      store: PropTypes.object,
    }).isRequired,
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

  constructor() {
    super();

    this.state = {
      sections: {
        editUserInfo: true,
        extendedInfo: true,
        contactInfo: true,
        proxy: false,
        permissions: false,
        servicePoints: false,
      },
    };

    this.handleExpandAll = this.handleExpandAll.bind(this);
    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.toggleAllSections = this.toggleAllSections.bind(this);
    this.collapseAllSections = this.collapseAllSections.bind(this);
    this.expandAllSections = this.expandAllSections.bind(this);

    this.ignoreEnterKey = this.ignoreEnterKey.bind(this);
    this.closeButton = React.createRef();
    this.saveButton = React.createRef();

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

  handleExpandAll(sections) {
    this.setState({ sections });
  }

  // eslint-disable-next-line class-methods-use-this
  ignoreEnterKey = (e) => {
    if (e.target !== this.saveButton.current) {
      e.preventDefault();
    }
  };

  handleSectionToggle({ id }) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];

      return newState;
    });
  }

  toggleAllSections(expand) {
    this.setState((curState) => {
      const newSections = expandAllFunction(curState.sections, expand);

      return {
        sections: newSections
      };
    });
  }

  expandAllSections(e) {
    e.preventDefault();
    this.toggleAllSections(true);
  }

  collapseAllSections(e) {
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
      stripes,
      change, // from redux-form...
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
                        accordionId="proxy"
                        expanded={sections.proxy}
                        onToggle={this.handleSectionToggle}
                        sponsors={initialValues.sponsors}
                        proxies={initialValues.proxies}
                        fullName={fullName}
                        stripes={stripes}
                        change={change}
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
  asyncValidate,
  asyncBlurFields: ['username', 'barcode'],
  navigationCheck: true,
  enableReinitialize: true,
})(UserForm);
