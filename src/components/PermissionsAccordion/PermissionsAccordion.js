import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'react-final-form-arrays';

import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  Accordion,
  Badge,
  Button,
  ConfirmationModal,
  Headline,
} from '@folio/stripes/components';
import {
  IfPermission,
  stripesConnect,
} from '@folio/stripes/core';

import PermissionModal from './components/PermissionsModal';
import PermissionsAccordionList from './PermissionsAccordionList';

class PermissionsAccordion extends React.Component {
  static propTypes = {
    expanded: PropTypes.bool,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }),
    onToggle: PropTypes.func.isRequired,
    accordionId: PropTypes.string.isRequired,
    permToDelete: PropTypes.string.isRequired,
    permToModify: PropTypes.string.isRequired,
    permToRead: PropTypes.string.isRequired,
    stripes: PropTypes.object.isRequired,
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
  };

  constructor(props) {
    super(props);

    this.state = {
      permissionModalOpen: false,  // true when the change-permissions modal is visible
      confirmEditModalOpen: false, // true when the confirm-edit modal is visible
    };
  }

  addPermissions = (permissions) => {
    const {
      permissionsField,
      form: { change },
    } = this.props;

    change(permissionsField, permissions);
  }

  getAssignedPermissions = () => {
    const {
      form: { getFieldState },
      permissionsField,
    } = this.props;

    return getFieldState(permissionsField)?.value ?? [];
  }

  /**
   * confirmEdit
   * Close the ConfirmationModal, and open the PermissionsModal. This is a
   * callback from the ConfirmationModal to continue with editing permissions
   * even though this means permissions with `visible: false` settings will
   * be removed.
   *
   * See openPermissionsModal for a detailed explanation.
   */
  confirmEdit = () => {
    this.setState({
      confirmEditModalOpen: false,
      permissionModalOpen: true,
    });
  }

  /**
   * cancelEdit
   * Close the ConfirmationModal. This is a callback from the ConfirmationModal
   * to cancel editing of permissions since it would result in the removal of
   * permissions with `visible: false`.
   *
   * See openPermissionsModal for a detailed explanation.
   */
  cancelEdit = () => {
    this.setState({
      confirmEditModalOpen: false,
    });
  }

  /**
   * openPermissionModal
   * Check whether any currently-assigned permissions contain `visible: false`.
   * If there are any, confirm whether to continue since only `visible: true`
   * permissions will be retained after editing (confirmation is handled by
   * confirmEdit and cancelEdit). If there are not any, i.e. all currently-assigned
   * permissions are `visible: true`, open PermissionModal.
   *
   * @param {event} e click event
   */
  openPermissionModal = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isHiddenAssigned = !!this.getAssignedPermissions().find((p) => p.visible === false);
    if (isHiddenAssigned) {
      this.setState({ confirmEditModalOpen: true });
    } else {
      this.setState({ permissionModalOpen: true });
    }
  };

  closePermissionModal = () => {
    this.setState({ permissionModalOpen: false });
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
    } = this.props;

    const assignedPermissions = this.getAssignedPermissions();

    if (!this.props.stripes.hasPerm(this.props.permToRead)) return null;

    const size = assignedPermissions.length;

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
          displayWhenClosed={<Badge>{size}</Badge>}
        >
          <FieldArray
            name={permissionsField}
            component={PermissionsAccordionList}
            getAssignedPermissions={this.getAssignedPermissions}
            showPerms={!!this.props.stripes?.config?.showPerms}
            permToDelete={this.props.permToDelete}
          />
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
            <PermissionModal
              assignedPermissions={assignedPermissions}
              addPermissions={this.addPermissions}
              open={this.state.permissionModalOpen}
              excludePermissionSets={excludePermissionSets}
              visibleColumns={visibleColumns}
              filtersConfig={filtersConfig}
              onClose={this.closePermissionModal}
            />
            <ConfirmationModal
              open={this.state.confirmEditModalOpen}
              heading="ui-users.permissions-accordion.confirm-heading"
              message="ui-users.permissions-accordion.confirm-message"
              onConfirm={this.confirmEdit}
              confirmLabel="ui-users.permissions-accordion.confirm-continue"
              onCancel={this.cancelEdit}
            />
          </IfPermission>
        </Accordion>
      </div>
    );
  }
}

export default stripesConnect(injectIntl(PermissionsAccordion));
