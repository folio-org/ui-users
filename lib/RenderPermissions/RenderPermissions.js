import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Dropdown } from 'react-bootstrap';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import List from '@folio/stripes-components/lib/List';
import IfPermission from '@folio/stripes-components/lib/IfPermission';

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
        listInvisiblePerms: PropTypes.bool,
      }).isRequired,
    }).isRequired,
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

    const listFormatter = item => (
      <li key={item.permissionName} >
        {item.displayName || item.permissionName}
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
      </li>
    );

    return (
      <div style={{ marginBottom: '1rem' }}>
        <hr />
        <Row>
          <Col xs={5}>
            <h3 className="marginTop0">{this.props.heading}</h3>
          </Col>
          {/* <Col xs={4} sm={3}>
            <TextField
              rounded
              endControl={<Button buttonStyle="fieldControl"><Icon icon='clearX'/></Button>}
              startControl={<Icon icon='search'/>}
              placeholder="Search"
              fullWidth
              />
          </Col>*/}
          <Col xs={7}>
            <IfPermission perm={this.props.permToModify}>
              <Dropdown
                id="AddPermissionDropdown"
                style={{ float: 'right' }}
                pullRight
                open={this.state ? this.state.addPermissionOpen : false}
                onToggle={this.onToggleAddPermDD}
              >
                <Button align="end" bottomMargin0 bsRole="toggle" aria-haspopup="true">&#43; Add Permission</Button>
                <DropdownMenu
                  bsRole="menu"
                  width="40em"
                  aria-label="available permissions"
                  onToggle={this.onToggleAddPermDD}
                >{permissionsDD}</DropdownMenu>
              </Dropdown>
            </IfPermission>
          </Col>
        </Row>
        <br />
        <List
          items={this.props.listedPermissions || []}
          itemFormatter={listFormatter}
          isEmptyMessage="This user has no permissions applied."
        />
      </div>
    );
  }
}

export default RenderPermissions;
