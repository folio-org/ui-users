import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import EditableList from '@folio/stripes-components/lib/structures/EditableList';

import { RenderPatronGroupLastUpdated, RenderPatronGroupNumberOfUsers } from '../lib/RenderPatronGroup';

class PatronGroupsSettings extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      usersPerGroup: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      users: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      groups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      usersLastUpdating: PropTypes.shape({
        query: PropTypes.string,
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      groups: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
        DELETE: PropTypes.func,
      }),
      usersLastUpdating: PropTypes.shape({
        update: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    usersPerGroup: {
      type: 'okapi',
      records: 'users',
      path: 'users?limit=0&facets=patronGroup',
    },
    users: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(%{usersLastUpdating.query})',
      accumulate: 'true',
    },
    groups: {
      type: 'okapi',
      records: 'usergroups',
      path: 'groups',
      PUT: {
        path: 'groups/%{activeRecord.id}',
      },
      DELETE: {
        path: 'groups/%{activeRecord.id}',
      },
    },
    activeRecord: {},
    usersLastUpdating: {},
  });

  constructor(props) {
    super(props);
    this.connectedPatronGroupLastUpdated = props.stripes.connect(RenderPatronGroupLastUpdated);
    this.connectedPatronGroupNumberOfUsers = props.stripes.connect(RenderPatronGroupNumberOfUsers);

    this.onCreateType = this.onCreateType.bind(this);
    this.onUpdateType = this.onUpdateType.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.propsReadyToFetchUsers(nextProps)) {
      const ids = this.getLastUpdaterIds(nextProps.resources.groups.records);
      const query = this.craftQueryForLastUpdaters(ids);
      this.props.mutator.usersLastUpdating.update({ query });
    }
  }

  onCreateType(type) {
    console.log('ui-items - settings - onCreateType called', type);
    this.props.mutator.groups.POST(type);
  }

  onUpdateType(type) {
    console.log('ui-items - settings - onUpdateType called', type);
    this.props.mutator.activeRecord.update({ id: type.id });
    // TODO: remove when back end PUT requests ignore read only properties
    // https://issues.folio.org/browse/RMB-92
    // eslint-disable-next-line no-param-reassign
    delete type.metadata;
    this.props.mutator.groups.PUT(type);
  }

  onDeleteType(typeId) {
    const type = this.props.resources.groups.records.find(t => t.id === typeId);
    console.log('ui-items - settings - onDeleteType called', type);
    this.props.mutator.activeRecord.update({ id: type.id });
    // TODO: remove when back end PUT requests ignore read only properties
    // https://issues.folio.org/browse/RMB-92
    // eslint-disable-next-line no-param-reassign
    delete type.metadata;
    this.props.mutator.groups.DELETE(type);
  }

  // eslint-disable-next-line class-methods-use-this
  getLastUpdaterIds(groups) {
    const ids = [];
    for (const group of groups) {
      if (group.metadata && !_.includes(ids, group.metadata.updatedByUserId)) {
        ids.push(group.metadata.updatedByUserId);
      }
    }
    return ids;
  }

  propsReadyToFetchUsers(nextProps) {
    const hasQuery = _.get(this.props, 'resources.usersLastUpdating.query', false);
    return nextProps.resources.groups.hasLoaded && !hasQuery;
  }

  // eslint-disable-next-line class-methods-use-this
  craftQueryForLastUpdaters(ids) {
    let query = '';
    for (const id of ids) {
      if (query.length > 0) {
        query += ' or ';
      }
      query += `id=${id}`;
    }
    return query;
  }

  render() {
    if (!this.props.resources.groups) return <div />;

    const suppressor = {
      // If a suppressor returns true, the control for that action will not appear
      delete: () => true,
      edit: () => false,
    };

    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle="Patron Groups">
          <EditableList
            {...this.props}
            // TODO: not sure why we need this OR if there are no groups
            // Seems to load this once before the groups data from the manifest
            // is pulled in. This still causes a JS warning, but not an error
            contentData={this.props.resources.groups.records || []}
            createButtonLabel="+ Add new"
            visibleFields={['group', 'desc']}
            itemTemplate={{ group: 'string', id: 'string', desc: 'string' }}
            actionSuppression={suppressor}
            onCreate={this.onCreateType}
            onUpdate={this.onUpdateType}
            onDelete={this.onDeleteType}
            isEmptyMessage="There are no patron groups"
            nameKey="group"
            additionalFields={{
              lastUpdated: {
                component: this.connectedPatronGroupLastUpdated,
                gloss: 'Last Updated',
                inheritedProps: this.props,
              },
              numberOfUsers: {
                component: this.connectedPatronGroupNumberOfUsers,
                gloss: '# of Users',
                inheritedProps: this.props,
              },
            }}
          />
        </Pane>
      </Paneset>
    );
  }
}

export default PatronGroupsSettings;
