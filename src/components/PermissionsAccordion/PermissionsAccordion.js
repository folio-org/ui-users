import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'react-final-form-arrays';
import noop from 'lodash/noop';

import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  Accordion,
  Badge,
  ConfirmationModal,
  Callout,
  Button,
  Headline,
} from '@folio/stripes/components';
import {
  IfPermission,
  stripesConnect,
} from '@folio/stripes/core';

import { affiliationsShape } from '../../shapes';
import PermissionModal from './components/PermissionsModal';
import PermissionsAccordionList from './PermissionsAccordionList';
import EnableUnassignAll from './EnableUnassignAll';
import AffiliationsSelect from '../AffiliationsSelect';
import IfConsortium from '../IfConsortium';
import IfConsortiumPermission from '../IfConsortiumPermission';
import { isAffiliationsEnabled } from '../util';

const PermissionsAccordion = (props) => {
  const {
    accordionId,
    affiliations,
    disabled = false,
    expanded,
    onChangeAffiliation = noop,
    onToggle,
    permToModify,
    permToDelete,
    permissionsField,
    filtersConfig,
    visibleColumns,
    headlineContent,
    excludePermissionSets = false,
    initialValues: { personal } = {},
    isLoading = false,
    form: { change },
    setButtonRef,
    tenantId,
  } = props;
  const getAssignedPermissions = () => {
    const { form: { getFieldState } } = props;

    return getFieldState(permissionsField)?.value ?? [];
  };

  const isAllowedPermissions = !!getAssignedPermissions().length;
  const isActionsDisabled = disabled || isLoading;
  const isAffiliationsVisible = isAffiliationsEnabled(props.initialValues) && affiliations?.length > 1;

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const [isUnassignButtonEnable, setIsUnassignButtonEnable] = useState(isActionsDisabled);
  const [confirmEditModalOpen, setConfirmEditModalOpen] = useState(false);

  const calloutRef = useRef();

  useEffect(() => {
    setIsUnassignButtonEnable(isAllowedPermissions || isActionsDisabled);
  }, [isAllowedPermissions, isActionsDisabled]);

  const changePermissions = (permissions) => {
    change(permissionsField, permissions);
  };

  /**
   * confirmEdit
   * Close the ConfirmationModal, and open the PermissionsModal. This is a
   * callback from the ConfirmationModal to continue with editing permissions
   * even though this means permissions with `visible: false` settings will
   * be removed.
   *
   *
   * See openPermissionModal for a detailed explanation.
   */
  const confirmEdit = () => {
    setConfirmEditModalOpen(false);
    setPermissionModalOpen(true);
  };

  /**
   * cancelEdit
   * Close the ConfirmationModal. This is a callback from the ConfirmationModal
   * to cancel editing of permissions since it would result in the removal of
   * permissions with `visible: false`.
   *
   * See openPermissionModal for a detailed explanation.
   */
  const cancelEdit = () => {
    setConfirmEditModalOpen(false);
  };

  /**
   * openPermissionModal
   * Check whether any currently-assigned permissions contain `visible: false`.
   * If there are any, confirm whether to continue since only `visible: true`
   * permissions will be retained after editing (confirmation is handled by
   * confirmEdit and cancelEdit). If there are not any, i.e. all currently-assigned
   * permissions are `visible: true`, open PermissionModal.
   *
   * UPDATE: With the work done for UIU-2075, invisible permissions are no
   * longer removed, so showing the ConfirmationModal isn't necessary. Since we might
   * have need of a confirmation step in the future, leave the code in place for now;
   * but the `visible: true` check below has been disabled.
   *
   * @param {event} e click event
   */
  const openPermissionModal = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setPermissionModalOpen(true);

    // const isHiddenAssigned = !!getAssignedPermissions().find((p) => p.visible === false);
    // if (isHiddenAssigned) {
    //   setConfirmEditModalOpen(true);
    // } else {
    //   setPermissionModalOpen(true);
    // }
  };

  const closePermissionModal = () => {
    setPermissionModalOpen(false);
  };

  const openUnassignModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUnassignModalOpen(true);
  };

  const closeUnassignModal = () => {
    setUnassignModalOpen(false);
  };

  const unassignAllPermissions = () => {
    change(permissionsField, []);
    setUnassignModalOpen(false);
    calloutRef.current.sendCallout({
      type: 'success',
      message: <FormattedMessage id="ui-users.permissions.calloutMessage" />,
    });
  };

  const assignedPermissions = getAssignedPermissions();

  if (!props.stripes.hasPerm(props.permToRead)) return null;

  const permissionsAmount = assignedPermissions.length;

  const message = (
    <FormattedMessage
      id="ui-users.permissions.modal.unassignAll.label"
      values={{
        firstName: personal?.firstName,
        lastName: personal?.lastName,
      }}
    />
  );

  return (
    <div data-testid={accordionId}>
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={
          <Headline
            size="large"
            tag="h3"
          >
            {headlineContent}
          </Headline>
        }
        displayWhenClosed={<Badge>{permissionsAmount}</Badge>}
      >
        <IfConsortium>
          <IfConsortiumPermission perm="consortia.user-tenants.collection.get">
            {isAffiliationsVisible && (
              <AffiliationsSelect
                affiliations={affiliations}
                onChange={onChangeAffiliation}
                isLoading={isLoading}
                value={tenantId}
              />
            )}
          </IfConsortiumPermission>
        </IfConsortium>
        <FieldArray
          name={permissionsField}
          component={PermissionsAccordionList}
          getAssignedPermissions={getAssignedPermissions}
          showPerms={!!props.stripes?.config?.showPerms}
          permToDelete={permToDelete}
          changePermissions={changePermissions}
        />
        <IfPermission perm={permToModify}>
          <Button
            type="button"
            align="end"
            bottomMargin0
            id="clickable-add-permission"
            onClick={openPermissionModal}
            buttonRef={setButtonRef}
            disabled={isActionsDisabled}
          >
            <FormattedMessage id="ui-users.permissions.addPermission" />
          </Button>
          <Button
            type="button"
            align="end"
            bottomMargin0
            disabled={!isUnassignButtonEnable}
            id="clickable-remove-all-permissions"
            onClick={openUnassignModal}
            buttonRef={setButtonRef}
          >
            <FormattedMessage id="ui-users.permissions.unassignAllPermissions" />
          </Button>
          <PermissionModal
            tenantId={tenantId}
            assignedPermissions={assignedPermissions}
            addPermissions={changePermissions}
            open={permissionModalOpen}
            excludePermissionSets={excludePermissionSets}
            visibleColumns={visibleColumns}
            filtersConfig={filtersConfig}
            onClose={closePermissionModal}
          />
          <ConfirmationModal
            open={confirmEditModalOpen}
            heading="ui-users.permissions-accordion.confirm-heading"
            message="ui-users.permissions-accordion.confirm-message"
            onConfirm={confirmEdit}
            confirmLabel="ui-users.permissions-accordion.confirm-continue"
            onCancel={cancelEdit}
          />
          <ConfirmationModal
            open={unassignModalOpen}
            heading={<FormattedMessage id="ui-users.permissions.modal.unassignAll.header" />}
            message={message}
            onConfirm={unassignAllPermissions}
            onCancel={closeUnassignModal}
            cancelLabel={<FormattedMessage id="ui-users.no" />}
            confirmLabel={<FormattedMessage id="ui-users.yes" />}
          />
          <EnableUnassignAll
            permissionsField={permissionsField}
            callback={setIsUnassignButtonEnable}
            isEnabled={!!getAssignedPermissions().length}
          />
        </IfPermission>
        <Callout ref={calloutRef} />
      </Accordion>
    </div>
  );
};

PermissionsAccordion.propTypes = {
  affiliations: affiliationsShape,
  disabled: PropTypes.bool,
  expanded: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }),
  initialValues: PropTypes.object,
  isLoading: PropTypes.bool,
  onChangeAffiliation: PropTypes.func,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  permToDelete: PropTypes.string.isRequired,
  permToModify: PropTypes.string.isRequired,
  permToRead: PropTypes.string.isRequired,
  stripes: PropTypes.object.isRequired,
  tenantId: PropTypes.string,
  // eslint-disable-next-line react/no-unused-prop-types
  formName: PropTypes.string.isRequired,
  permissionsField: PropTypes.string.isRequired,
  filtersConfig: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      name: PropTypes.string.isRequired,
      cql: PropTypes.string.isRequired,
      filter: PropTypes.func.isRequired,
      values: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          displayName: PropTypes.element.isRequired,
          value: PropTypes.bool.isRequired,
        }),
      ).isRequired,
    })
  ).isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  headlineContent: PropTypes.element.isRequired,
  excludePermissionSets: PropTypes.bool,
  form: PropTypes.object,
  setButtonRef: PropTypes.func
};

export default stripesConnect(injectIntl(PermissionsAccordion));
