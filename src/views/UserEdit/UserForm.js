import isEqual from 'lodash/isEqual';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { FormSpy } from 'react-final-form';
import setFieldData from 'final-form-set-field-data';

import { AppIcon, IfInterface, IfPermission } from '@folio/stripes/core';
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
  expandAllSections,
  collapseAllSections, ConfirmationModal
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';

import {
  USER_TYPES,
  CUSTOM_FIELDS_SECTION,
} from '../../constants';
import {
  EditUserInfo,
  EditExtendedInfo,
  EditContactInfo,
  EditProxy,
  EditServicePoints,
  EditReadingRoomAccess,
  EditUserRoles,
  EditFeesFines,
  EditCustomFieldsSection,
  EditLoans,
  EditRequests,
} from '../../components/EditSections';
import { getFormattedPronouns, getFullName } from '../../components/util';
import RequestFeeFineBlockButtons from '../../components/RequestFeeFineBlockButtons';
import { addressTypesShape } from '../../shapes';
import getProxySponsorWarning from '../../components/util/getProxySponsorWarning';
import TenantsPermissionsAccordion from './TenantsPermissionsAccordion';

import css from './UserForm.css';

export function validate(values) {
  const isShadowUser = values?.type === USER_TYPES.SHADOW;
  const errors = {};

  errors.personal = {};

  if (!values.personal || !values.personal.lastName) {
    errors.personal.lastName = <FormattedMessage id="ui-users.errors.missingRequiredField" />;
  }

  if (!values.username && values.creds && values.creds.password) {
    errors.username = <FormattedMessage id="ui-users.errors.missingRequiredUsername" />;
  }

  if (!isShadowUser && !values.patronGroup) {
    errors.patronGroup = <FormattedMessage id="ui-users.errors.missingRequiredPatronGroup" />;
  }

  if (!isShadowUser && (!values.personal || !values.personal.preferredContactTypeId)) {
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

const ACCORDION_ID = {
  CUSTOM_FIELDS: 'customFields',
  READING_ROOM_ACCESS: 'readingRoomAccess',
  PROXY: 'proxy',
  FEES_FINES: 'feesFines',
  LOANS: 'loans',
  REQUESTS: 'requests',
  USER_ROLES: 'userRoles',
  SERVICE_POINTS: 'servicePoints',
};

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
    numberGeneratorData: PropTypes.object,
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
    profilePictureConfig: PropTypes.object.isRequired,
    isCreateKeycloakUserConfirmationOpen: PropTypes.bool,
    onCancelKeycloakConfirmation: PropTypes.func,
    confirmCreateKeycloakUser: PropTypes.func,
    setAssignedRoleIds: PropTypes.func,
    assignedRoleIds: PropTypes.object,
    setTenantId: PropTypes.func,
    tenantId: PropTypes.string
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
        handler: this.handleExpandAll,
      },
      {
        name: 'collapseAllSections',
        handler: this.handleCollapseAll,
      }
    ];

    this.buttonRefs = [];
    this.setButtonRef = el => this.buttonRefs.push(el);
  }

  handleCollapseAll = (e) => collapseAllSections(e, this.accordionStatusRef);
  handleExpandAll = (e) => expandAllSections(e, this.accordionStatusRef);

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
        <FormattedMessage id="stripes-components.saveAndClose" />
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
    const showActionMenu = stripes.hasPerm('ui-users.patron-blocks.all')
      || stripes.hasPerm('ui-users.feesfines.actions.all')
      || stripes.hasPerm('ui-requests.all');

    const isShadowUser = initialValues?.type === USER_TYPES.SHADOW;
    const isEditing = initialValues && initialValues.id;

    const isActionMenuVisible = (
      showActionMenu
      && isEditing
      /*
        Essentially, a shadow user should not have visibility to request, fee/fines, or block actions.
        Since there are no other sections in the menu there is no point in showing the menu button for the shadow user.
       */
      && !isShadowUser
    );

    if (isActionMenuVisible) {
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

  /**
   * showPermissionsAccordion
   * Return true unless the `roles` interface is present; then return false.
   * When `roles` is present, this indicates access management is handled
   * by keycloak; thus, roles, policies, and capabilites are used to manage
   * access, not the legacy permissions system.
   *
   * @returns boolean true unless the `roles` interface is present
   */
  showPermissionsAccordion = () => {
    return !this.props.stripes.hasInterface('roles');
  };

  handleConfirmCreateKeycloakUser = async () => {
    await this.props.confirmCreateKeycloakUser(this.props.form);
  }

  render() {
    const {
      initialValues,
      handleSubmit,
      formData,
      numberGeneratorData,
      servicePoints,
      onCancel,
      stripes,
      form,
      uniquenessValidator,
      profilePictureConfig,
      isCreateKeycloakUserConfirmationOpen,
      onCancelKeycloakConfirmation
    } = this.props;
    const isEditing = !!initialValues.id;
    const selectedPatronGroup = form.getFieldState('patronGroup')?.value;
    const firstMenu = this.getAddFirstMenu();
    const footer = this.getPaneFooter();
    const fullName = getFullName(initialValues);
    const pronouns = getFormattedPronouns(initialValues);
    const paneTitle = initialValues.id
      ? <FormattedMessage id="ui-users.edit" />
      : <FormattedMessage id="ui-users.crud.createUser" />;
    const isShadowUser = initialValues?.type === USER_TYPES.SHADOW;
    const displayReadingRoomAccess = [USER_TYPES.PATRON, USER_TYPES.STAFF].includes(initialValues?.type);

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
                  className={css.nameContainer}
                  data-test-header-title
                >
                  {fullName}
                  {pronouns && <span className={css.pronouns}>{pronouns}</span>}
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
                    [ACCORDION_ID.PROXY]: false,
                    permissions: false,
                    [ACCORDION_ID.SERVICE_POINTS]: false,
                    [ACCORDION_ID.CUSTOM_FIELDS]: true,
                    [ACCORDION_ID.READING_ROOM_ACCESS]: false,
                    [ACCORDION_ID.FEES_FINES]: true,
                    [ACCORDION_ID.LOANS]: true,
                    [ACCORDION_ID.REQUESTS]: true,
                    [ACCORDION_ID.USER_ROLES]: false
                  }}
                >
                  <EditUserInfo
                    accordionId="editUserInfo"
                    initialValues={initialValues}
                    numberGeneratorData={numberGeneratorData}
                    patronGroups={formData.patronGroups}
                    stripes={stripes}
                    form={form}
                    selectedPatronGroup={selectedPatronGroup}
                    uniquenessValidator={uniquenessValidator}
                    disabled={isShadowUser}
                    profilePictureConfig={profilePictureConfig}
                  />
                  <EditExtendedInfo
                    accordionId="extendedInfo"
                    userId={initialValues.id}
                    userFirstName={initialValues.personal.firstName}
                    userEmail={initialValues.personal.email}
                    username={initialValues.username}
                    servicePoints={servicePoints}
                    addressTypes={formData.addressTypes}
                    departments={formData.departments}
                    uniquenessValidator={uniquenessValidator}
                    disabled={isShadowUser}
                    stripes={stripes}
                  />
                  <EditContactInfo
                    accordionId="contactInfo"
                    addressTypes={formData.addressTypes}
                    preferredContactTypeId={initialValues.preferredContactTypeId}
                    disabled={isShadowUser}
                    stripes={stripes}
                    isCreateMode={!isEditing}
                  />
                  <EditCustomFieldsSection
                    accordionId={ACCORDION_ID.CUSTOM_FIELDS}
                    sectionId={CUSTOM_FIELDS_SECTION.CUSTOM_FIELDS}
                    isCreateMode={!isEditing}
                  />
                  {isEditing && displayReadingRoomAccess && (
                    <IfInterface name="reading-room-patron-permission">
                      <IfPermission perm="reading-room.patron-permission.item.put">
                        <EditReadingRoomAccess
                          accordionId={ACCORDION_ID.READING_ROOM_ACCESS}
                          userRRAPermissions={initialValues.readingRoomAccess?.records}
                          form={form}
                          formData={formData.userReadingRoomPermissions}
                        />
                      </IfPermission>
                    </IfInterface>
                  )}
                  {isEditing && !isShadowUser && (
                    <EditProxy
                      accordionId={ACCORDION_ID.PROXY}
                      sponsors={initialValues.sponsors}
                      proxies={initialValues.proxies}
                      fullName={fullName}
                    />
                  )}
                  <EditFeesFines
                    accordionId={ACCORDION_ID.FEES_FINES}
                  />
                  <EditLoans
                    accordionId={ACCORDION_ID.LOANS}
                    isCreateMode={!isEditing}
                  />
                  <EditRequests
                    accordionId={ACCORDION_ID.REQUESTS}
                    isCreateMode={!isEditing}
                  />
                  {isEditing && this.showPermissionsAccordion() ?
                    <TenantsPermissionsAccordion
                      form={form}
                      initialValues={initialValues}
                      setButtonRef={this.setButtonRef}
                    /> :
                    <IfPermission perm="ui-users.roles.view">
                      <EditUserRoles
                        form={form}
                        user={initialValues}
                        setTenantId={this.props.setTenantId}
                        tenantId={this.props.tenantId}
                        setAssignedRoleIds={this.props.setAssignedRoleIds}
                        assignedRoleIds={this.props.assignedRoleIds}
                        accordionId={ACCORDION_ID.USER_ROLES}
                      />
                    </IfPermission>
                  }
                  {isEditing && (
                    <EditServicePoints
                      accordionId={ACCORDION_ID.SERVICE_POINTS}
                      setButtonRef={this.setButtonRef}
                      {...this.props}
                    />
                  )}
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
          <IfInterface name="roles">
            <ConfirmationModal
              id="JIT-user"
              heading={<FormattedMessage id="ui-users.keycloak.modal.confirmationHeading" />}
              message={<FormattedMessage id="ui-users.keycloak.modal.creation" values={{ user:getFullName(form.getState().values) }} />}
              onConfirm={this.handleConfirmCreateKeycloakUser}
              onCancel={onCancelKeycloakConfirmation}
              open={isCreateKeycloakUserConfirmationOpen}
              confirmLabel={<FormattedMessage id="stripes-core.button.confirm" />}
            />
          </IfInterface>
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
