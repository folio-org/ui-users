import React from 'react';
import css from './RenderPermissions.css';
import ListDropdown from '../ListDropdown';
import { Row, Col, Dropdown } from 'react-bootstrap';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import List from '@folio/stripes-components/lib/List';
import IfPermission from '@folio/stripes-components/lib/IfPermission';

class RenderPermissions extends React.Component {

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

	 isPermAvailable(perm) {

	    const permInUse = _.some(this.props.listedPermissions?this.props.listedPermissions:[], perm);

	    // This should be replaced with proper search when possible.
	    const nameToCompare = !perm.displayName ? perm.permissionName.toLowerCase() : perm.displayName.toLowerCase();
	    const permNotFiltered = _.includes(nameToCompare, this.state.searchTerm.toLowerCase());

	    return !permInUse && permNotFiltered;
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

	render() {

		//if (!this.props.stripes.hasPerm('perms.users.read'))
	      //return null;

		const permissionsDD = (
	   		<ListDropdown
	        	items={_.filter(this.props.availablePermissions, this.isPermAvailable)}
	        	onClickItem={this.addPermissionHandler}
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
	          onClick={() => this.props.removePermission(item)}
	          aria-label={`Remove Permission: ${item.permissionName}`}
	          title="Remove Permission"
	        >
	          {/*<IfPermission {...this.props} perm="perms.users.delete">*/}
	            <Icon icon="hollowX" iconClassName={css.removePermissionIcon} iconRootClass={css.removePermissionButton} />
	          {/*</IfPermission>*/}
	        </Button>
	      </li>
	    );
	    
	  	return(
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
		            {/*<IfPermission {...this.props} perm="perms.users.modify">*/}
		              <Dropdown open={this.state?this.state.addPermissionOpen:false} pullRight onToggle={this.onToggleAddPermDD} id="AddPermissionDropdown" style={{ float: 'right' }}>
		                <Button align="end" bottomMargin0 bsRole="toggle" aria-haspopup="true">&#43; Add Permission</Button>
		                <DropdownMenu bsRole="menu" onToggle={this.onToggleAddPermDD} aria-label="available permissions" width="40em">{permissionsDD}</DropdownMenu>
		              </Dropdown>
		            {/*</IfPermission>*/}
		          </Col>
		        </Row>
		        <br/>
		        <List itemFormatter={listFormatter} items={this.props.listedPermissions || []} isEmptyMessage="This user has no permissions applied." />
		    </div>
		);
    }
}

export default RenderPermissions;