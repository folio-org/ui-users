// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React from 'react';
import PropTypes from 'prop-types';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PatronGroupsList from './PatronGroupsList';

class PatronGroupsSettings extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      groups: PropTypes.arrayOf(
        PropTypes.object,
      ),
    }).isRequired,
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }),
      groups: PropTypes.shape({
        DELETE: PropTypes.func.isRequired,
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }),
    }),
  };

  static manifest = Object.freeze({
    groups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
      PUT: {
        path: 'groups/${activeRecord.id}',
      },
      DELETE: {
        path: 'groups/${activeRecord.id}',
      },
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);

    // placeholder data...
    this.state = {
      // groups: [{group:"Orange", desc:"orange group", id:"0", inUse:false},
      //   {group:"Red", desc:"red group", id:"1", inUse:true},
      //   {group:"Blue", desc:"blue group", id:"2", inUse: true}],
    };

    this.onUpdateGroup = this.onUpdateGroup.bind(this);
    this.onCreateGroup = this.onCreateGroup.bind(this);
    this.onDeleteGroup = this.onDeleteGroup.bind(this);
  }
  onUpdateGroup(groupObject) {
    this.props.mutator.activeRecord.update({ id: groupObject.id });
    this.props.mutator.groups.PUT(groupObject);
  }

  onCreateGroup(groupObject) {
    this.props.mutator.groups.POST(groupObject);
  }

  onDeleteGroup(groupId) {
    this.props.mutator.activeRecord.update({ id: groupId });
    this.props.mutator.groups.DELETE(this.props.data.groups.find(g => (g.id === groupId)));
  }

  render() {
    const suppressor = {
      delete: () => true,
      edit: () => false, // suppress all editting of existing items...
    };

    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth>
          <PatronGroupsList
            // TODO: not sure why we need this OR if there are no groups
            // Seems to load this once before the groups data from the manifest
            // is pulled in. This still causes a JS warning, but not an error
            contentData={this.props.data.groups || []}
            label="Patron Groups"
            createButtonLabel="+ Add group"
            visibleFields={['group', 'desc']}
            itemTemplate={{ group: 'string', id: 'string', desc: 'string' }}
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
