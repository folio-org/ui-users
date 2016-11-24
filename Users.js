import React from 'react'

/* shared stripes components */
import Pane from '@folio/stripes-components/lib/Pane'
import Paneset from '@folio/stripes-components/lib/Paneset'
import PaneMenu from '@folio/stripes-components/lib/PaneMenu'
import Button from '@folio/stripes-components/lib/Button'
import Icon from '@folio/stripes-components/lib/Icon'
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList'
import KeyValue from '@folio/stripes-components/lib/KeyValue'
import {Row, Col} from 'react-bootstrap'
import TextField from '@folio/stripes-components/lib/TextField'
import Checkbox from '@folio/stripes-components/lib/Checkbox'
import FilterPaneSearch from './lib/FilterPaneSearch'
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup'
import Select from '@folio/stripes-components/lib/Select'
import ViewUser from './ViewUser'

class Users extends React.Component{
  constructor(props){
    super(props);
    this.state={
      //Search/Filter state...
      patronFilter: true,
      employeeFilter: false,
      searchTerm: ''
    };
  }
  
  static manifest = {
    users: {
      type: 'okapi',
      records: 'users',
      path: 'users' 
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
    this.setState({searchTerm:term});
  }
  //end search Handlers

  render(){
    if (!this.props.data.users) return <div/>;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark"/></button></PaneMenu>
    const fineHistory = [{"Due Date": "11/12/2014", "Amount":"34.23", "Status":"Unpaid"}];
    const displayUsers = this.props.data.users.reduce((results, user) => {
      results.push({Name: user.personal.full_name, Username: user.username, Email: user.personal.email_primary});
      return results;
    }, []); 
    
    /*searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch.bind(this)} />
    
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
                     <MultiColumnList contentData={displayUsers}/>
              </Pane>
              
              {/*Details Pane*/}
              <ViewUser fineHistory={fineHistory}/>
            </Paneset>
            )
  }
    
}

export default Users;
