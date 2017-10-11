import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import List from '@folio/stripes-components/lib/List';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import { Accordion } from '@folio/stripes-components/lib/Accordion';

import PermissionList from '../PermissionList';
import css from './RenderPermissions.css';

class RenderPermissions extends React.Component {
  static propTypes = {
    heading: PropTypes.string.isRequired,
    permToRead: PropTypes.string.isRequired,
    permToDelete: PropTypes.string.isRequired,
    permToModify: PropTypes.string.isRequired,
    availablePermissions: PropTypes.arrayOf(PropTypes.object),
    listedPermissions: PropTypes.arrayOf(PropTypes.object),
    addPermission: PropTypes.func.isRequired,
    removePermission: PropTypes.func.isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      config: PropTypes.shape({
        showPerms: React.PropTypes.bool,
        listInvisiblePerms: PropTypes.bool,
      }).isRequired,
    }).isRequired,
    accordionId: PropTypes.string,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    // set 'editable' to turn off read-only mode and reveal the 'Add permission' dropdown and delete buttons.
    editable: PropTypes.bool,
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
    this.props.addPermission(perm);
    this.onToggleAddPermDD();
  }

  isPermAvailable(perm) {
    if ((this.props.listedPermissions || []).some(x => x.permissionName === perm.permissionName))
      return false;

    if (!perm.visible && !this.props.stripes.config.listInvisiblePerms)
      return false;

    return _.includes(perm.displayName || perm.permissionName,
                      this.state.searchTerm.toLowerCase());
  }

  render() {
    const { accordionId, expanded, onToggle } = this.props;

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

    const showPerms = _.get(this.props.stripes, ['config', 'showPerms']);
    const listFormatter = item => (
      <li key={item.permissionName} >
        {
          (showPerms ?
           `${item.permissionName} (${item.displayName})` :
           (item.displayName || item.permissionName))
        }
        { this.props.editable &&
          <IfPermission perm={this.props.permToDelete}>
            <Button
              buttonStyle="fieldControl"
              align="end"
              type="button"
              onClick={() => this.props.removePermission(item)}
              aria-label={`Remove Permission: ${item.permissionName}`}
              title="Remove Permission"
            >
              <Icon icon="hollowX" iconClassName={css.removePermissionIcon} iconRootClass={css.removePermissionButton} />
            </Button>
          </IfPermission>
        }
      </li>
    );

    let permsDropdownButton = null;
    if (this.props.editable) {
      permsDropdownButton = (
        <IfPermission perm={this.props.permToModify}>
          <Dropdown
            id="AddPermissionDropdown"
            style={{ float: 'right' }}
            pullRight
            open={this.state ? this.state.addPermissionOpen : false}
            onToggle={this.onToggleAddPermDD}
          >
            <Button align="end" bottomMargin0 data-role="toggle" aria-haspopup="true">&#43; Add Permission</Button>
            <DropdownMenu
              data-role="menu"
              width="40em"
              aria-label="available permissions"
              onToggle={this.onToggleAddPermDD}
            >{permissionsDD}</DropdownMenu>
          </Dropdown>
        </IfPermission>
      );
    }

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={
          <h2 className="marginTop0">{this.props.heading}</h2>
        }
        displayWhenOpen={permsDropdownButton}
      >
        <List
          items={this.props.listedPermissions || []}
          itemFormatter={listFormatter}
          isEmptyMessage="This user has no permissions applied."
        />
      </Accordion>
    );
  }
}

export default RenderPermissions;