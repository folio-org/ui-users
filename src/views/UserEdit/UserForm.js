import isEqual from 'lodash/isEqual';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Field, FormSpy } from 'react-final-form';
import setFieldData from 'final-form-set-field-data';

import { AppIcon } from '@folio/stripes/core';
import {
  Paneset,
  Pane,
  PaneMenu,
  PaneHeaderIconButton,
  PaneFooter,
  Button,
  ExpandAllButton,
  Row,
  Col,
  Headline,
  AccordionSet,
  AccordionStatus,
  HasCommand,
} from '@folio/stripes/components';
import { EditCustomFieldsRecord } from '@folio/stripes/smart-components';
import stripesFinalForm from '@folio/stripes/final-form';

import {
  EditUserInfo,
  EditExtendedInfo,
  EditContactInfo,
  EditProxy,
  EditServicePoints,
} from '../../components/EditSections';
import { getFullName } from '../../components/util';
import RequestFeeFineBlockButtons from '../../components/RequestFeeFineBlockButtons';
import PermissionsAccordion from '../../components/PermissionsAccordion';
import {
  statusFilterConfig,
  permissionTypeFilterConfig,
} from '../../components/PermissionsAccordion/helpers/filtersConfig';
import { addressTypesShape } from '../../shapes';
import getProxySponsorWarning from '../../components/util/getProxySponsorWarning';

import css from './UserForm.css';

export function validate(values) {
  const errors = {};
  errors.personal = {};

  if (!values.personal || !values.personal.lastName) {
    errors.personal.lastName = <FormattedMessage id="ui-users.errors.missingRequiredField" />;
  }

  if (!values.username && values.creds && values.creds.password) {
    errors.username = <FormattedMessage id="ui-users.errors.missingRequiredUsername" />;
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
    match: PropTypes.object,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object.isRequired,
    servicePoints: PropTypes.object,
    stripes: PropTypes.object,
    form: PropTypes.object, // provided by final-form
    intl: PropTypes.object,
  };

  static defaultProps = {
    pristine: false,
    submitting: false,
  };

  constructor(props) {
    super(props);

    this.accordionStatusRef = React.createRef();

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

    this.buttonRefs = [];
    this.setButtonRef = el => this.buttonRefs.push(el);
  }

  handleCancel = () => {
    const {
      match: {
        params
      },
      location: {
        search,
      },
      history
    } = this.props;

    const idParam = params.id || '';
    if (idParam) {
      // if an id param is present, it's an edit view, go back to the user detail page...
      history.push(`/users/preview/${idParam}${search}`);
    } else {
      // if no id param, it's a create form, go back to the top level search view.
      history.push(`/users/${search}`);
    }
  }

  getAddFirstMenu() {
    const { intl } = this.props;

    return (
      <PaneMenu>
        <PaneHeaderIconButton
          id="clickable-closenewuserdialog"
          onClick={this.handleCancel}
          ref={this.closeButton}
          aria-label={intl.formatMessage({ id: 'ui-users.crud.closeNewUserDialog' })}
          icon="times"
        />
      </PaneMenu>
    );
  }

  ignoreEnterKey = (e) => {
    const allowedControls = [
      this.closeButton.current,
      this.saveButton.current,
      this.cancelButton.current,
      ...this.buttonRefs,
    ];

    if (!allowedControls.includes(e.target)) {
      e.preventDefault();
    }
  };

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
      onCancel,
    } = this.props;

    const disabled = pristine || submitting;

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

  getActionMenu = ({ onToggle }) => {
    const { initialValues, stripes } = this.props;
    const showActionMenu = stripes.hasPerm('ui-users.patron_blocks')
      || stripes.hasPerm('ui-users.feesfines.actions.all')
      || stripes.hasPerm('ui-requests.all');

    const isEditing = initialValues && initialValues.id;
    if (showActionMenu && isEditing) {
      return (
        <>
          <RequestFeeFineBlockButtons
            barcode={this.props.initialValues.barcode}
            onToggle={onToggle}
            userId={this.props.match.params.id}
          />
        </>
      );
    } else {
      return null;
    }
  }

  render() {
    const {
      initialValues,
      handleSubmit,
      formData,
      servicePoints,
      onCancel,
      stripes,
      form,
      uniquenessValidator,
    } = this.props;

    const selectedPatronGroup = form.getFieldState('patronGroup')?.value;
    const firstMenu = this.getAddFirstMenu();
    const footer = this.getPaneFooter();
    const fullName = getFullName(initialValues);
    const paneTitle = initialValues.id
      ? <FormattedMessage id="ui-users.edit" />
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
              actionMenu={this.getActionMenu}
              firstMenu={firstMenu}
              footer={footer}
              centerContent
              appIcon={<AppIcon app="users" appIconKey="users" />}
              paneTitle={
                <span data-test-header-title>
                  {paneTitle}
                </span>
              }
              onClose={onCancel}
              defaultWidth="fill"
            >
              {fullName && (
                <Headline
                  size="xx-large"
                  tag="h2"
                  data-test-header-title
                >
                  {fullName}
                </Headline>
              )}
              <AccordionStatus ref={this.accordionStatusRef}>
                <Row end="xs">
                  <Col xs>
                    <ExpandAllButton />
                  </Col>
                </Row>
                <AccordionSet
                  initialStatus={{
                    editUserInfo: true,
                    extendedInfo: true,
                    contactInfo: true,
                    proxy: false,
                    permissions: false,
                    servicePoints: false,
                    customFields: true,
                  }}
                >
                  <EditUserInfo
                    accordionId="editUserInfo"
                    initialValues={initialValues}
                    patronGroups={formData.patronGroups}
                    stripes={stripes}
                    form={form}
                    selectedPatronGroup={selectedPatronGroup}
                    uniquenessValidator={uniquenessValidator}
                  />
                  <EditExtendedInfo
                    accordionId="extendedInfo"
                    expanded
                    userId={initialValues.id}
                    userFirstName={initialValues.personal.firstName}
                    userEmail={initialValues.personal.email}
                    username={initialValues.username}
                    servicePoints={servicePoints}
                    addressTypes={formData.addressTypes}
                    departments={formData.departments}
                    uniquenessValidator={uniquenessValidator}
                  />
                  <EditContactInfo
                    accordionId="contactInfo"
                    addressTypes={formData.addressTypes}
                    preferredContactTypeId={initialValues.preferredContactTypeId}
                  />
                  <EditCustomFieldsRecord
                    expanded
                    formName="userForm"
                    accordionId="customFields"
                    backendModuleName="users"
                    entityType="user"
                    finalFormCustomFieldsValues={form.getState().values.customFields}
                    fieldComponent={Field}
                    changeFinalFormField={form.change}
                  />
                  {initialValues.id &&
                    <div>
                      <EditProxy
                        accordionId="proxy"
                        sponsors={initialValues.sponsors}
                        proxies={initialValues.proxies}
                        fullName={fullName}
                      />
                      <PermissionsAccordion
                        initialValues={initialValues}
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
                        headlineContent={<FormattedMessage id="ui-users.permissions.userPermissions" />}
                        permToRead="perms.users.get"
                        permToDelete="perms.users.item.delete"
                        permToModify="perms.users.item.put"
                        formName="userForm"
                        permissionsField="permissions"
                        form={form}
                        setButtonRef={this.setButtonRef}
                      />
                      <EditServicePoints
                        accordionId="servicePoints"
                        setButtonRef={this.setButtonRef}
                        {...this.props}
                      />
                    </div>
                  }
                </AccordionSet>
              </AccordionStatus>
            </Pane>
          </Paneset>
          <FormSpy
            subscription={{ values: true }}
            onChange={({ values }) => {
              const { mutators } = form;

              ['sponsors', 'proxies'].forEach(namespace => {
                if (values[namespace]) {
                  values[namespace].forEach((_, index) => {
                    const warning = getProxySponsorWarning(values, namespace, index);

                    if (warning) {
                      mutators.setFieldData(`${namespace}[${index}].proxy.status`, { warning });
                    }
                  });
                }
              });
            }}
          />
        </form>
      </HasCommand>
    );
  }
}

export default stripesFinalForm({
  validate,
  mutators: {
    setFieldData,
  },
  initialValuesEqual: (a, b) => isEqual(a, b),
  navigationCheck: true,
  enableReinitialize: true,
})(injectIntl(UserForm));
