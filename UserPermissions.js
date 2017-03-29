import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import { Row, Col, Dropdown } from 'react-bootstrap';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import List from '@folio/stripes-components/lib/List';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import ListDropdown from './lib/ListDropdown';
import css from './UserPermissions.css';

const propTypes = {
  stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
  sectionHeading: PropTypes.string,
  availablePermissions: PropTypes.arrayOf(PropTypes.object),
  setPermissions: PropTypes.arrayOf(PropTypes.object),
  parentProps: PropTypes.shape({
    mutator: PropTypes.shape({
      setPermissions: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired,
      }),
    }),
  }),
};

class UserPermissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addPermissionOpen: false,
      searchTerm: '',
      // handling active Permissions in state for presentation purposes only.
    };

    this.onToggleAddPermDD = this.onToggleAddPermDD.bind(this);
    this.addPermission = this.addPermission.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.isPermAvailable = this.isPermAvailable.bind(this);
  }

  onToggleAddPermDD() {
    const isOpen = this.state.addPermissionOpen;
    this.setState({
      addPermissionOpen: !isOpen,
    });
  }

  onChangeSearch(e) {
    const searchTerm = e.target.value;
    this.setState({ searchTerm });
  }

  addPermission(perm) {
    this.props.parentProps.mutator.setPermissions.POST(perm, this.props.parentProps).then(() => {
      this.onToggleAddPermDD();
    });
  }

  removePermission(perm) {
    console.log(this.props);
    this.props.parentProps.mutator.setPermissions.DELETE(perm, this.props.parentProps, perm.permissionName);
  }

  isPermAvailable(perm) {
    const permInUse = _.some(this.props.setPermissions, perm);

    // This should be replaced with proper search when possible.
    const nameToCompare = !perm.displayName ? perm.permissionName.toLowerCase() : perm.displayName.toLowerCase();
    const permNotFiltered = _.includes(nameToCompare, this.state.searchTerm.toLowerCase());

    return !permInUse && permNotFiltered;
  }

  render() {
    const { setPermissions } = this.props;

    //if (!this.props.stripes.hasPerm('perms.users.read'))
      //return null;

    const permissionsDD = (
      <ListDropdown
        items={_.filter(this.props.availablePermissions, this.isPermAvailable)}
        onClickItem={this.addPermission}
        onChangeSearch={this.onChangeSearch}
      />
    );

    const listFormatter = item => (
      <li key={item.permissionName} >
        {!item.displayName ? item.permissionName : item.displayName}
        <Button
          buttonStyle="fieldControl"
          align="end"
          type="button"
          onClick={() => this.removePermission(item)}
          aria-label={`Remove Permission: ${item.permissionName}`}
          title="Remove Permission"
        >
          {/* <IfPermission {...this.props} perm="perms.users.delete"> */}
            <Icon icon="hollowX" iconClassName={css.removePermissionIcon} iconRootClass={css.removePermissionButton} />
          {/* </IfPermission> */}
        </Button>
      </li>
    );

    return (
      <div style={{ marginBottom: '1rem' }}>
        <hr />
        <Row>
          <Col xs={5}>
            <h3 className="marginTop0">{this.props.sectionHeading}</h3>
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
            {/* <IfPermission {...this.props} perm="perms.users.modify"> */}
              <Dropdown open={this.state.addPermissionOpen} pullRight onToggle={this.onToggleAddPermDD} id="AddPermissionDropdown" style={{ float: 'right' }}>
                <Button align="end" bottomMargin0 bsRole="toggle" aria-haspopup="true">&#43; Add Permission</Button>
                <DropdownMenu bsRole="menu" onToggle={this.onToggleAddPermDD} aria-label="available permissions" width="40em">{permissionsDD}</DropdownMenu>
              </Dropdown>
            {/* </IfPermission> */}
          </Col>
        </Row>
        <List itemFormatter={listFormatter} items={setPermissions || []} isEmptyMessage="This user has no permissions applied." />
      </div>
    );
  }
}

UserPermissions.propTypes = propTypes;

export default UserPermissions;
