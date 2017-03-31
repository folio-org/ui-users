import React from 'react';
import css from './RenderPermissions.css';
import ListDropdown from '../ListDropdown';
import { Row, Col, Dropdown } from 'react-bootstrap';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import List from '@folio/stripes-components/lib/List';
import IfPermission from '../IfPermission';

function RenderPermissions(props) {

	if (!props.stripes.hasPerm('perms.users.read'))
      return null;

	const permissionsDD = (
   		<ListDropdown
        	items={_.filter(props.availablePermissions, props.isPermAvailable)}
        	onClickItem={props.addPermission}
        	onChangeSearch={props.onChangeSearch}
      	/>
    );

	const listFormatter = item => (
      <li key={item.permissionName} >
        {!item.displayName ? item.permissionName : item.displayName}
        <Button
          buttonStyle="fieldControl"
          align="end"
          type="button"
          onClick={() => props.removePermission(item)}
          aria-label={`Remove Permission: ${item.permissionName}`}
          title="Remove Permission"
        >
          <IfPermission {...props} perm="perms.users.delete">
            <Icon icon="hollowX" iconClassName={css.removePermissionIcon} iconRootClass={css.removePermissionButton} />
          </IfPermission>
        </Button>
      </li>
    );
    
  return(
   	<div style={{ marginBottom: '1rem' }}>
        <hr />
        <Row>
          <Col xs={5}>
            <h3 className="marginTop0">{props.heading}</h3>
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
            <IfPermission {...props} perm="perms.users.modify">
              <Dropdown open={props.state.addPermissionOpen} pullRight onToggle={props.onToggleAddPermDD} id="AddPermissionDropdown" style={{ float: 'right' }}>
                <Button align="end" bottomMargin0 bsRole="toggle" aria-haspopup="true">&#43; Add Permission</Button>
                <DropdownMenu bsRole="menu" onToggle={props.onToggleAddPermDD} aria-label="available permissions" width="40em">{permissionsDD}</DropdownMenu>
              </Dropdown>
            </IfPermission>
          </Col>
        </Row>
        <List itemFormatter={listFormatter} items={props.userPermissions || []} isEmptyMessage="This user has no permissions applied." />
    </div>
  );
}

export default RenderPermissions;