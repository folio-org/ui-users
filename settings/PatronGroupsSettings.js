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
      pk: '_id',
      PUT: {
        pk: '_id',
        path: 'groups/${activeRecord.id}',
      },
      DELETE: {
        pk: '_id',
        path: 'groups/${activeRecord.id}'
      }
    },
    activeRecord: {}
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
    this.props.mutator.activeRecord.update({'id': groupObject._id });
    this.props.mutator.groups.PUT(groupObject);
  }

  onCreateGroup(groupObject){
    this.props.mutator.groups.POST(groupObject);
  }

  onDeleteGroup(groupId){
    this.props.mutator.activeRecord.update({'id': groupId });
    this.props.mutator.groups.DELETE(this.props.data.groups.find((g) => { return g._id == groupId }))
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
            // TODO: not sure why we need this OR if there are no groups
            // Seems to load this once before the groups data from the manifest
            // is pulled in. This still causes a JS warning, but not an error
            contentData={this.props.data.groups || []}
            label="Patron Groups"
            createButtonLabel="+ Add group"
            visibleFields={['group', 'desc']}
            itemTemplate={{group:'string', _id:'string', desc:'string', inUse:'bool'}}
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
