import React, { PropTypes } from 'react'

/* shared stripes components */
import Pane from '@folio/stripes-components/lib/Pane'
import Paneset from '@folio/stripes-components/lib/Paneset'
import PaneMenu from '@folio/stripes-components/lib/PaneMenu'
import Button from '@folio/stripes-components/lib/Button'
import Icon from '@folio/stripes-components/lib/Icon'
import MultiColumnListUsers from './lib/MultiColumnList'
import KeyValue from '@folio/stripes-components/lib/KeyValue'
import {Row, Col} from 'react-bootstrap'
import TextField from '@folio/stripes-components/lib/TextField'
import Checkbox from '@folio/stripes-components/lib/Checkbox'
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch'
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup'
import Select from '@folio/stripes-components/lib/Select'
import ViewUser from './ViewUser'

class Users extends React.Component{
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props){
    super(props);
    this.state={
      //Search/Filter state...
      patronFilter: true,
      employeeFilter: false,
      searchTerm: ''
    };

    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
  }
  
  static manifest = {
    users: {
      type: 'okapi',
      records: 'users',
      path: 'users!{query}' // vile bespoke magic in !{query} -- see STRIPES-104
    }
  };

  //search Handlers...
  onChangeFilter(e){
    let stateObj = {};
    stateObj[e.target.id] = !this.state[e.target.id];
    this.setState(stateObj);
  }
  
  onChangeSearch(e){
    let term = e.target.value;
    console.log("User searched:", term);
    this.setState({ 'searchTerm': term });
    this.context.router.transitionTo('/users?query=' + term);
  }

  onClearSearch(e){
    console.log("User cleared search");
    this.setState({ 'searchTerm': '' });
    this.context.router.transitionTo("/users");
  }
  //end search Handlers

  onClickItemHandler (userId) {
    console.log("User clicked: ",userId);
    this.context.router.transitionTo("/users/view/"+userId);
  }

  render(){
    const { data, params } = this.props;
    if (!data.users) return <div/>;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark"/></button></PaneMenu>
    const fineHistory = [{"Due Date": "11/12/2014", "Amount":"34.23", "Status":"Unpaid"}];
    const displayUsers = data.users.reduce((results, user) => {
      results.push({"id": user.id, Name: user.personal.full_name, Username: user.username, Email: user.personal.email_primary});
      return results;
    }, []); 
    
    /*searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />
    
    return(
            <Paneset>
              {/*Filter Pane */}
              <Pane defaultWidth="16%" header={searchHeader}>
                <FilterControlGroup label="Filters">
                  <Checkbox 
                    id="patronFilter" 
                    label="Patrons" 
                    checked={this.state.patronFilter} 
                    onChange={this.onChangeFilter.bind(this)}
                    marginBottom0 
                    hover 
                    fullWidth 
                  />
                  <Checkbox 
                    id="employeeFilter" 
                    label="Employees" 
                    checked={this.state.employeeFilter} 
                    onChange={this.onChangeFilter.bind(this)}
                    marginBottom0 hover fullWidth 
                  />
                </FilterControlGroup>
                <FilterControlGroup label="Actions">
                  <Button fullWidth>Add User</Button>
                </FilterControlGroup>
              </Pane>
              
              {/*Results Pane*/}
              <Pane defaultWidth="fit-content" paneTitle="Results" lastMenu={resultMenu}>
                     <MultiColumnListUsers contentData={displayUsers} onClickItemHandler={this.onClickItemHandler.bind(this)}/>
              </Pane>
              
              {/*Details Pane*/}
              {(params.userid) ? <ViewUser userid={params.userid} fineHistory={fineHistory}/> : null}
            </Paneset>
            )
  }
    
}

export default Users;
