import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'react-final-form-arrays';

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

class PermissionsAccordion extends React.Component {
  static propTypes = {
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

  static defaultProps = {
    excludePermissionSets: false,
    initialValues: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      permissionModalOpen: false,
      unassignModalOpen: false,
      fields2: null,
    };
    this.callout = React.createRef();
  }

  addPermissions = (permissions) => {
    const {
      permissionsField,
      form: { change },
    } = this.props;

    change(permissionsField, permissions);
  }

  renderItem(item, index, fields, showPerms) {
    return (
      <li
        key={item.id}
        data-permission-name={`${item.permissionName}`}
      >
        <PermissionLabel permission={item} showRaw={showPerms} />
        <IfPermission perm={this.props.permToDelete}>
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
  }

  getAssignedPermissions = () => {
    const {
      form: { getFieldState },
      permissionsField,
    } = this.props;

    return getFieldState(permissionsField)?.value ?? [];
  }

  renderList = ({ fields }) => {
    const {
      intl: { formatMessage },
    } = this.props;
    const showPerms = this.props.stripes?.config?.showPerms;
    const assignedPermissions = this.getAssignedPermissions();

    const listFormatter = (_fieldName, index) => {
      if (fields.value[index]) {
        return this.renderItem(fields.value[index], index, fields, showPerms);
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

  openPermissionModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ permissionModalOpen: true });
  };

  closePermissionModal = () => {
    this.setState({ permissionModalOpen: false });
  };

  openUnassignModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ unassignModalOpen: true });
  };

  closeUnassignModal = () => {
    this.setState({ unassignModalOpen: false });
  };

  unassignAllPermissions = () => {
    this.props.form.change(this.props.permissionsField, []);
    this.setState({ unassignModalOpen: false });
    this.callout.current.sendCallout({
      type: 'success',
      message: <FormattedMessage id="ui-users.permissions.calloutMessage"/>,
    });
  };

  render() {
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
    } = this.props;
    const {
      permissionModalOpen,
      unassignModalOpen,
    } = this.state;
console.log(personal);
    const assignedPermissions = this.getAssignedPermissions();

    if (!this.props.stripes.hasPerm(this.props.permToRead)) return null;

    const size = assignedPermissions.length;
    const isUnassingButtonEnable = !!size;

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
        <FieldArray name={permissionsField} component={this.renderList} />
        <IfPermission perm={permToModify}>
          <Button
            type="button"
            align="end"
            bottomMargin0
            id="clickable-add-permission"
            onClick={this.openPermissionModal}
          >
            <FormattedMessage id="ui-users.permissions.addPermission" />
          </Button>
          <Button
            type="button"
            align="end"
            bottomMargin0
            disabled={!isUnassingButtonEnable}
            id="clickable-remove-all-permissions"
            onClick={this.openUnassignModal}
          >
            <FormattedMessage id="ui-users.permissions.unassignAllPermissions" />
          </Button>
          {
            permissionModalOpen &&
            <PermissionModal
              assignedPermissions={assignedPermissions}
              addPermissions={this.addPermissions}
              open={permissionModalOpen}
              excludePermissionSets={excludePermissionSets}
              visibleColumns={visibleColumns}
              filtersConfig={filtersConfig}
              onClose={this.closePermissionModal}
            />
          }
          {
            unassignModalOpen &&
            <ConfirmationModal
              open={unassignModalOpen}
              heading={<FormattedMessage id="ui-users.permissions.modal.unassignAll.header" />}
              message={message}
              onConfirm={this.unassignAllPermissions}
              onCancel={this.closeUnassignModal}
              cancelLabel={<FormattedMessage id="ui-users.no"/>}
              confirmLabel={<FormattedMessage id="ui-users.yes"/>}
            />
          }
        </IfPermission>
        <Callout ref={this.callout}/>
      </Accordion>
    );
  }
}

export default stripesConnect(injectIntl(PermissionsAccordion));
