import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'react-final-form-arrays';
import { OnChange } from 'react-final-form-listeners';

import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  Icon,
  Button,
  Accordion,
  Badge,
  List,
  Headline,
  ConfirmationModal,
  Callout,
} from '@folio/stripes/components';
import {
  stripesShape,
  IfPermission,
  stripesConnect,
} from '@folio/stripes/core';

import { getPermissionLabelString } from '../data/converters/permission';
import PermissionModal from './components/PermissionsModal';
import PermissionLabel from '../PermissionLabel';
import css from './PermissionsAccordion.css';

const PermissionsAccordion = (props) => {
  const {
    accordionId,
    expanded,
    onToggle,
    permToModify,
    permissionsField,
    filtersConfig,
    visibleColumns,
    headlineContent,
    excludePermissionSets,
    initialValues: { personal },
    form: { change },
  } = props;

  const getAssignedPermissions = () => {
    const { form: { getFieldState } } = props;

    return getFieldState(permissionsField)?.value ?? [];
  };

  const isAllowedPermissions = !!getAssignedPermissions().length;

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const [isUnassingButtonEnable, setIsUnassingButtonEnable] = useState(false);

  const callout = React.createRef();

  useEffect(() => {
    setIsUnassingButtonEnable(isAllowedPermissions);
  }, [isAllowedPermissions]);

  const addPermissions = (permissions) => {
    change(permissionsField, permissions);
  };

  const renderItem = (item, index, fields, showPerms) => {
    return (
      <li
        key={item.id}
        data-permission-name={`${item.permissionName}`}
      >
        <PermissionLabel permission={item} showRaw={showPerms} />
        <IfPermission perm={props.permToDelete}>
          <FormattedMessage id="ui-users.permissions.removePermission">
            {aria => (
              <Button
                buttonStyle="fieldControl"
                align="end"
                type="button"
                id={`clickable-remove-permission-${item.permissionName}`}
                onClick={() => fields.remove(index)}
                aria-label={`${aria}: ${item.permissionName}`}
              >
                <Icon
                  icon="times-circle"
                  iconClassName={css.removePermissionIcon}
                  iconRootClass={css.removePermissionButton}
                />
              </Button>
            )}
          </FormattedMessage>
        </IfPermission>
      </li>
    );
  };

  const renderList = ({ fields }) => {
    const { intl: { formatMessage } } = props;
    const showPerms = props.stripes?.config?.showPerms;
    const assignedPermissions = getAssignedPermissions();

    const listFormatter = (_fieldName, index) => {
      if (fields.value[index]) {
        return renderItem(fields.value[index], index, fields, showPerms);
      }
      return null;
    };

    const sortedItems = (assignedPermissions).sort((a, b) => {
      const permA = getPermissionLabelString(a, formatMessage, showPerms);
      const permB = getPermissionLabelString(b, formatMessage, showPerms);

      return permA.localeCompare(permB);
    });

    return (
      <List
        items={sortedItems}
        itemFormatter={listFormatter}
        isEmptyMessage={<FormattedMessage id="ui-users.permissions.empty" />}
      />
    );
  };

  const openPermissionModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPermissionModalOpen(true);
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
    callout.current.sendCallout({
      type: 'success',
      message: <FormattedMessage id="ui-users.permissions.calloutMessage" />,
    });
  };

  const assignedPermissions = getAssignedPermissions();

  if (!props.stripes.hasPerm(props.permToRead)) return null;

  const size = assignedPermissions.length;

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
      displayWhenClosed={<Badge>{size}</Badge>}
    >
      <FieldArray name={permissionsField} component={renderList} />
      <IfPermission perm={permToModify}>
        <Button
          type="button"
          align="end"
          bottomMargin0
          id="clickable-add-permission"
          onClick={openPermissionModal}
        >
          <FormattedMessage id="ui-users.permissions.addPermission" />
        </Button>
        <Button
          type="button"
          align="end"
          bottomMargin0
          disabled={!isUnassingButtonEnable}
          id="clickable-remove-all-permissions"
          onClick={openUnassignModal}
        >
          <FormattedMessage id="ui-users.permissions.unassignAllPermissions" />
        </Button>
        {
          permissionModalOpen &&
          <PermissionModal
            assignedPermissions={assignedPermissions}
            addPermissions={addPermissions}
            open={permissionModalOpen}
            excludePermissionSets={excludePermissionSets}
            visibleColumns={visibleColumns}
            filtersConfig={filtersConfig}
            onClose={closePermissionModal}
          />
        }
        {
          unassignModalOpen &&
          <ConfirmationModal
            open={unassignModalOpen}
            heading={<FormattedMessage id="ui-users.permissions.modal.unassignAll.header" />}
            message={message}
            onConfirm={unassignAllPermissions}
            onCancel={closeUnassignModal}
            cancelLabel={<FormattedMessage id="ui-users.no" />}
            confirmLabel={<FormattedMessage id="ui-users.yes" />}
          />
        }
        <OnChange name={permissionsField}>
          {() => { setIsUnassingButtonEnable(() => !!getAssignedPermissions().length); }}
        </OnChange>
      </IfPermission>
      <Callout ref={callout} />
    </Accordion>
  );
};

PermissionsAccordion.propTypes = {
  expanded: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }),
  initialValues: PropTypes.object,
  onToggle: PropTypes.func.isRequired,
  accordionId: PropTypes.string.isRequired,
  permToDelete: PropTypes.string.isRequired,
  permToModify: PropTypes.string.isRequired,
  permToRead: PropTypes.string.isRequired,
  stripes: stripesShape.isRequired,
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
};

PermissionsAccordion.defaultProps = {
  excludePermissionSets: false,
  initialValues: {},
};

export default stripesConnect(injectIntl(PermissionsAccordion));
