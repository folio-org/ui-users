import { get, filter, includes } from 'lodash';
import React from 'react';
import {
  FormattedMessage,
  injectIntl,
  intlShape
} from 'react-intl';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import {
  Icon,
  Button,
  Dropdown,
  DropdownMenu,
  Accordion,
  Badge,
  List,
  Headline
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';

import PermissionList from '../PermissionList';
import css from './EditablePermissions.css';

class EditablePermissions extends React.Component {
  static propTypes = {
    heading: PropTypes.node.isRequired,
    permToRead: PropTypes.string.isRequired,
    permToDelete: PropTypes.string.isRequired,
    permToModify: PropTypes.string.isRequired,
    availablePermissions: PropTypes.arrayOf(PropTypes.object),
    initialValues: PropTypes.object,
    intl: intlShape,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
        listInvisiblePerms: PropTypes.bool,
      }).isRequired,
    }).isRequired,
    accordionId: PropTypes.string,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    name: PropTypes.string,
  };

  static defaultProps = {
    name: 'permissions',
  };

  constructor(props) {
    super(props);

    this.state = {
      addPermissionOpen: false,
      searchTerm: '',
    };

    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onToggleAddPermDD = this.onToggleAddPermDD.bind(this);
    this.isPermAvailable = this.isPermAvailable.bind(this);
    this.addPermissionHandler = this.addPermissionHandler.bind(this);
    this.renderList = this.renderList.bind(this);
  }

  onChangeSearch(e) {
    const searchTerm = e.target.value;
    this.setState({ searchTerm });
  }

  onToggleAddPermDD() {
    const isOpen = this.state.addPermissionOpen;
    this.setState({
      addPermissionOpen: !isOpen,
      searchTerm: ''
    });
  }

  addPermissionHandler(perm) {
    this.fields.unshift(perm);
    setTimeout(() => this.onToggleAddPermDD());
  }

  isPermAvailable(perm) {
    const listedPermissions = (this.fields) ? this.fields.getAll() : this.props.initialValues.permissions;
    if ((listedPermissions || []).some(x => x.permissionName === perm.permissionName)) {
      return false;
    }

    if (!perm.visible && !this.props.stripes.config.listInvisiblePerms) { return false; }

    return includes(perm.displayName.toLowerCase() || perm.permissionName.toLowerCase(),
      this.state.searchTerm.toLowerCase());
  }

  removePermission(index) {
    this.fields.remove(index);
    setTimeout(() => this.forceUpdate());
  }

  renderItem(item, index, showPerms) {
    return (
      <li key={item.permissionName} data-permission-name={`${item.permissionName}`}>
        {
          (showPerms ?
            `${item.permissionName} (${item.displayName})` :
            (item.displayName || item.permissionName))
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

  renderList({ fields }) {
    this.fields = fields;
    const showPerms = get(this.props.stripes, ['config', 'showPerms']);
    const listFormatter = (fieldName, index) => (this.renderItem(fields.get(index), index, showPerms));

    return (
      <List
        items={fields}
        itemFormatter={listFormatter}
        isEmptyMessage={<FormattedMessage id="ui-users.permissions.empty" />}
      />
    );
  }

  addAllPermissions = () => {
    filter(this.props.availablePermissions, this.isPermAvailable)
      .forEach(perm => {
        this.fields.unshift(perm);
      });
  }

  render() {
    const { accordionId, expanded, onToggle, initialValues, intl: { formatMessage } } = this.props;

    const permissions = (initialValues || {}).subPermissions || [];

    if (!this.props.stripes.hasPerm(this.props.permToRead)) return null;

    const size = (this.fields) ? this.fields.length : permissions.length;

    const permissionsDD = (
      <PermissionList
        items={filter(this.props.availablePermissions, this.isPermAvailable)}
        onClickItem={this.addPermissionHandler}
        onChangeSearch={this.onChangeSearch}
        stripes={this.props.stripes}
      />
    );

    const permsDropdownButton = (
      <IfPermission perm={this.props.permToModify}>
        <Dropdown
          id="section-add-permission"
          pullRight
          open={this.state ? this.state.addPermissionOpen : false}
          onToggle={this.onToggleAddPermDD}
        >
          <Button align="end" bottomMargin0 data-role="toggle" aria-haspopup="true" id="clickable-add-permission">
            <FormattedMessage id="ui-users.permissions.addPermission" />
          </Button>
          <DropdownMenu
            data-role="menu"
            width="40em"
            aria-label={formatMessage({ id: 'ui-users.permissions.availablePermissions' })}
            onToggle={this.onToggleAddPermDD}
          >
            {permissionsDD}
          </DropdownMenu>
        </Dropdown>
      </IfPermission>
    );

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={<Headline size="large" tag="h3">{this.props.heading}</Headline>}
        displayWhenClosed={
          <Badge>{size}</Badge>
        }
      >
        <FieldArray name={this.props.name} component={this.renderList} />
        <div>
          {permsDropdownButton}
          <Button onClick={() => this.addAllPermissions()}><FormattedMessage id="ui-users.permissions.addAllPermissions" /></Button>
        </div>
      </Accordion>
    );
  }
}

export default injectIntl(EditablePermissions);
