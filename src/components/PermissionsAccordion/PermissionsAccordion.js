import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  arrayRemove, change,
  FieldArray,
} from 'redux-form';
import { connect as reduxConnect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  Icon,
  Button,
  Accordion,
  Badge,
  List,
  Headline
} from '@folio/stripes/components';
import {
  IfPermission,
  stripesConnect,
  stripesShape,
} from '@folio/stripes-core';

import PermissionModal from './components/PermissionsModal';
import css from './PermissionsAccordion.css';

class PermissionsAccordion extends React.Component {
  static propTypes = {
    expanded: PropTypes.bool.isRequired,
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
    assignedPermissions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        permissionName: PropTypes.string.isRequired,
        subPermissions: PropTypes.arrayOf(PropTypes.string).isRequired,
        dummy: PropTypes.bool.isRequired,
        mutable: PropTypes.bool.isRequired,
        visible: PropTypes.bool.isRequired,
      })
    ).isRequired,
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
    unassignPermission: PropTypes.func.isRequired,
    addPermissions: PropTypes.func.isRequired,
    excludePermissionSets: PropTypes.bool,
  };

  static defaultProps = {
    initialValues: {},
    excludePermissionSets: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      permissionModalOpen: false,
    };
  }

  renderItem(item, index, showPerms) {
    return (
      <li
        key={item.id}
        data-permission-name={`${item.permissionName}`}
      >
        {
          showPerms
            ? `${item.permissionName} (${item.displayName})`
            : (item.displayName || item.permissionName)
        }
        <IfPermission perm={this.props.permToDelete}>
          <FormattedMessage id="ui-users.permissions.removePermission">
            {aria => (
              <Button
                buttonStyle="fieldControl"
                align="end"
                type="button"
                id={`clickable-remove-permission-${item.permissionName}`}
                onClick={() => this.removePermission(index)}
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

  renderList = ({ fields }) => {
    const showPerms = get(this.props.stripes, ['config', 'showPerms']);
    const listFormatter = (fieldName, index) => (this.renderItem(fields.get(index), index, showPerms));

    return (
      <List
        items={fields}
        itemFormatter={listFormatter}
        isEmptyMessage={<FormattedMessage id="ui-users.permissions.empty" />}
      />
    );
  };

  removePermission(index) {
    this.props.unassignPermission(index);
  }

  openPermissionModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ permissionModalOpen: true });
  };

  closePermissionModal = () => {
    this.setState({ permissionModalOpen: false });
  };

  render() {
    const {
      accordionId,
      expanded,
      onToggle,
      initialValues,
      permToModify,
      permissionsField,
      filtersConfig,
      visibleColumns,
      headlineContent,
      assignedPermissions,
      addPermissions,
      excludePermissionSets,
    } = this.props;

    const { permissionModalOpen } = this.state;
    const permissions = (initialValues || {}).subPermissions || [];

    if (!this.props.stripes.hasPerm(this.props.permToRead)) return null;

    const size = assignedPermissions ? assignedPermissions.length : permissions.length;

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
          {
            permissionModalOpen &&
            <PermissionModal
              assignedPermissions={assignedPermissions}
              addPermissions={addPermissions}
              open={permissionModalOpen}
              excludePermissionSets={excludePermissionSets}
              visibleColumns={visibleColumns}
              filtersConfig={filtersConfig}
              onClose={this.closePermissionModal}
            />
          }
        </IfPermission>
      </Accordion>
    );
  }
}

const mapStateToProps = (state, { formName, permissionsField }) => ({
  assignedPermissions: state.form[formName].values[permissionsField] || [],
});

const mapDispatchToProps = (dispatch, { formName, permissionsField }) => ({
  unassignPermission: (index) => dispatch(arrayRemove(formName, permissionsField, index)),
  addPermissions: (permissions) => dispatch(change(formName, permissionsField, permissions)),
});

export default stripesConnect(reduxConnect(mapStateToProps, mapDispatchToProps)(PermissionsAccordion));
