import React from 'react';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PatronGroupsList from './PatronGroupsList';

class PatronGroupsSettings extends React.Component {
  constructor(props){
    super(props);
    
    //placeholder data...
    this.state = {
      groups: [{name:"Orange", email:"orange@colors.com", id:"0", inUse:false},
        {name:"Red", email:"red@colors.com", id:"1", inUse:true},
        {name:"Blue", email:"blue@colors.com", id:"2", inUse: true}],
    }
    
    this.onUpdateGroup = this.onUpdateGroup.bind(this);
    this.onCreateGroup = this.onCreateGroup.bind(this);
    this.onDeleteGroup = this.onDeleteGroup.bind(this);
  }
  onUpdateGroup(groupObject){
    //placeholder logic
    console.log('updating');
    console.log(groupObject);
  }
  
  onCreateGroup(groupObject){
    //placeholder logic
    console.log('create');
    console.log(groupObject);
    let groups = this.state.groups;
    groupObject.id = groups.length.toString();
    groups.unshift(groupObject);
    this.setState({
      groups
    });
   
  }
  
  onDeleteGroup(groupId){
    //placeholder logic
    console.log('deleting');
    console.log(groupId);
    let tempGroups = this.state.groups;
    const ind = tempGroups.findIndex(obj => obj.id === groupId);
    tempGroups.splice(ind, 1);
    this.setState({
      groups: tempGroups,
    });
  }
  
  render() {
    
    const suppressor = {
      delete: (item) => { return (!item.inUse)}, // suppress delete action based on 'inUse' prop
      edit: item => false, // suppress all editting of existing items...
    }
    
    return (
      <Paneset>
        <Pane defaultWidth="fill" >
          <PatronGroupsList
            contentData={this.state.groups} 
            label="Access Groups"
            createButtonLabel="+ Add Group"
            visibleFields={['name', 'email']}
            itemTemplate={{name:'string', id:'string', description:'string', inUse:'bool'}}
            actionSuppression={suppressor}
            onUpdate={this.onUpdateGroup}
            onCreate={this.onCreateGroup}
            onDelete={this.onDeleteGroup}
            isEmptyMessage="There are no Patron Groups"
          />
        </Pane>
      </Paneset>
    );
  }
}

export default PatronGroupsSettings;
