import React from 'react'; // eslint-disable-line
import {Row, Col, Dropdown} from 'react-bootstrap'; // eslint-disable-line
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu'; // eslint-disable-line
import Button from '@folio/stripes-components/lib/Button'; // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon'; // eslint-disable-line
import TextField from '@folio/stripes-components/lib/TextField'; // eslint-disable-line
import List from '@folio/stripes-components/lib/List'; // eslint-disable-line
import ListDropdown from './lib/ListDropdown'; // eslint-disable-line
import css from './UserPermissions.css'; // eslint-disable-line

const propTypes = {
  availablePermissions: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  userId: React.PropTypes.number,
};

class UserPermissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addPermissionOpen: false,
      searchTerm: '',
      // handling active Permissions in state for presentation purposes only.
      activePermissions: [],
    };

    this.onToggleAddPermDD = this.onToggleAddPermDD.bind(this);
    this.addPermission = this.addPermission.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
  }

  onToggleAddPermDD() {
    const isOpen = this.state.addPermissionOpen;
    this.setState({
      addPermissionOpen: !isOpen,
    });
  }

  onChangeSearch(e) {

    const searchTerm = e.target.value;

    this.setState({
      searchTerm: searchTerm,
    });

  }

  addPermission(id) {
    // placeholder add logic...
    const currentPermissions = this.state.activePermissions;
    const currentPermission = _.find(this.props.availablePermissions, function(perm) {
      return perm.id === id;
    });

    if(currentPermission) currentPermissions.push(currentPermission);

    this.setState({
      activePermissions: currentPermissions,
    });
    this.onToggleAddPermDD();
  }

  removePermission(id) {
    // placeholder removal logic...
    const currentPermissions = this.state.activePermissions;
    const ind = currentPermissions.findIndex(p => p.id === id);
    currentPermissions.splice(ind, 1);
    this.setState({
      activePermissions: currentPermissions,
    });
  }

  render() {
    const permissionsDD = (
      <ListDropdown
        items={_.filter(this.props.availablePermissions, function(perm) {

          const permInUse = _.includes(this.state.activePermissions, perm);

          // This should be replaced with proper search when possible.
          const permNotFiltered = _.includes(perm.name.toLowerCase(),this.state.searchTerm.toLowerCase());

          return !permInUse && permNotFiltered;

        }.bind(this))}
        onClickItem={this.addPermission}
        onChangeSearch={this.onChangeSearch}
      />
    );

    const listFormatter = item => (
      <li key={item.name + item.id} >
        {item.name}
        <Button
          buttonStyle="fieldControl"
          align="end"
          type="button"
          onClick={() => this.removePermission(item.id)}
          aria-label={`Remove Permission: ${item.name}`}
          title="Remove Permission"
        >
          <Icon icon="hollowX" iconClassName={css.removePermissionIcon} iconRootClass={css.removePermissionButton} />
        </Button>
      </li>
    );

    return (
      <div style={{ marginBottom: '1rem' }}>
        <hr />
        <Row>
          <Col xs={5}>
            <h3 className="marginTop0">User permissions</h3>
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
            <Dropdown open={this.state.addPermissionOpen} pullRight onToggle={this.onToggleAddPermDD} id="AddPermissionDropdown" style={{ float: 'right' }}>
              <Button align="end" bottomMargin0 bsRole="toggle" aria-haspopup="true">&#43; Add Permission</Button>
              <DropdownMenu bsRole="menu" onToggle={this.onToggleAddPermDD} aria-label="available permissions">{permissionsDD}</DropdownMenu>
            </Dropdown>
          </Col>
        </Row>
        <List itemFormatter={listFormatter} items={this.state.activePermissions} isEmptyMessage="This user has no permissions applied." />
      </div>
    );
  }
}

UserPermissions.propTypes = propTypes;

export default UserPermissions;
