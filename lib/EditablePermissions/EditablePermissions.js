import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';

import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import List from '@folio/stripes-components/lib/List';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Badge from '@folio/stripes-components/lib/Badge';

import PermissionList from '../PermissionList';
import css from './EditablePermissions.css';

class EditablePermissions extends React.Component {
  static propTypes = {
    heading: PropTypes.string.isRequired,
    permToRead: PropTypes.string.isRequired,
    permToDelete: PropTypes.string.isRequired,
    permToModify: PropTypes.string.isRequired,
    availablePermissions: PropTypes.arrayOf(PropTypes.object),
    initialValues: PropTypes.object,
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
    });
  }

  addPermissionHandler(perm) {
    this.fields.unshift(perm);
    this.onToggleAddPermDD();
  }

  removePermission(index) {
    this.fields.remove(index);
  }

  isPermAvailable(perm) {
    const listedPermissions = (this.fields) ? this.fields.getAll() : this.props.initialValues.permissions;

    if ((listedPermissions || []).some(x => x.permissionName === perm.permissionName)) {
      return false;
    }

    if (!perm.visible && !this.props.stripes.config.listInvisiblePerms)
      return false;

    return _.includes(perm.displayName || perm.permissionName,
                      this.state.searchTerm.toLowerCase());
  }

  renderList({ fields }) {
    this.fields = fields;
    const showPerms = _.get(this.props.stripes, ['config', 'showPerms']);
    const listFormatter = (fieldName, index) =>
      (this.renderItem(fields.get(index), index, showPerms));

    return (
      <List
        items={fields}
        itemFormatter={listFormatter}
        isEmptyMessage="No permissions found"
      />
    );
  }

  renderItem(item, index, showPerms) {
    return (
      <li key={item.permissionName}>
        {
          (showPerms ?
            `${item.permissionName} (${item.displayName})` :
            (item.displayName || item.permissionName))
        }
        <IfPermission perm={this.props.permToDelete}>
          <Button
            buttonStyle="fieldControl"
            align="end"
            type="button"
            id="clickable-remove-permission"
            onClick={() => this.removePermission(index)}
            aria-label={`Remove Permission: ${item.permissionName}`}
            title="Remove Permission"
          >
            <Icon icon="hollowX" iconClassName={css.removePermissionIcon} iconRootClass={css.removePermissionButton} />
          </Button>
        </IfPermission>
      </li>
    );
  }

  render() {
    const { accordionId, expanded, onToggle, initialValues } = this.props;
    const permissions = (initialValues || {}).permissions || [];

    if (!this.props.stripes.hasPerm(this.props.permToRead))
      return null;

    const permissionsDD = (
      <PermissionList
        items={_.filter(this.props.availablePermissions, this.isPermAvailable)}
        onClickItem={this.addPermissionHandler}
        onChangeSearch={this.onChangeSearch}
        stripes={this.props.stripes}
      />
    );

    const permsDropdownButton = (
      <IfPermission perm={this.props.permToModify}>
        <Dropdown
          id="section-add-permission"
          style={{ float: 'right' }}
          pullRight
          open={this.state ? this.state.addPermissionOpen : false}
          onToggle={this.onToggleAddPermDD}
        >
          <Button align="end" bottomMargin0 data-role="toggle" aria-haspopup="true" id="clickable-add-permission">&#43; Add Permission</Button>
          <DropdownMenu
            data-role="menu"
            width="40em"
            aria-label="available permissions"
            onToggle={this.onToggleAddPermDD}
          >{permissionsDD}</DropdownMenu>
        </Dropdown>
      </IfPermission>
    );

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={this.props.heading}
        displayWhenClosed={
          <Badge>{permissions.length}</Badge>
        }
      >
        <Row>
          <Col xs={8}>
            <Row>
              <Col xs={12}>
                {permsDropdownButton}
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12}>
                <FieldArray name={this.props.name} component={this.renderList} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Accordion>
    );
  }
}

export default EditablePermissions;
