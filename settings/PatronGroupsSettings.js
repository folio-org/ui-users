import React from 'react';
import { Component } from 'react';
import { connect } from '@folio/stripes-connect';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PatronGroupsList from './PatronGroupsList';

class PatronGroupsSettings extends React.Component { // eslint-disable-line

  static manifest = Object.freeze({
    groups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
      pk: '_id' // Not sure why this is required here and not in other sample manifests
    }
  });

  constructor(props){
    super(props);

    //placeholder data...
    this.state = {
      // groups: [{group:"Orange", desc:"orange group", id:"0", inUse:false},
      //   {group:"Red", desc:"red group", id:"1", inUse:true},
      //   {group:"Blue", desc:"blue group", id:"2", inUse: true}],
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
    // console.log('create');
    // console.log(groupObject);
    // let groups = this.state.groups;
    // groupObject.id = groups.length.toString();
    // groups.unshift(groupObject);
    // this.setState({
    //   groups
    // });
    this.props.mutator.groups.POST(groupObject);

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


        console.log("from manifest: props:" + JSON.stringify(this.props));
        console.log("from manifest: state:" + JSON.stringify(this.state));

    return (
      <Paneset>
        <Pane defaultWidth="fill" >
          <PatronGroupsList
            // TODO: not sure why we need this OR if there are no groups
            // Seems to load this once before the groups data from the manifest
            // is pulled in. This still causes a JS warning, but not an error
            contentData={this.props.data.groups || []}
            label="Patron Groups"
            createButtonLabel="+ Add Group"
            visibleFields={['group', 'desc']}
            itemTemplate={{group:'string', _id:'string', description:'string', inUse:'bool'}}
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

export default connect(PatronGroupsSettings, '@folio/ui-users');
