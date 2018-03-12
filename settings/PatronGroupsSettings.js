import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import Paneset from '@folio/stripes-components/lib/Paneset';
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';
import Pane from '@folio/stripes-components/lib/Pane';
import EditableList from '@folio/stripes-components/lib/structures/EditableList';
import Callout from '@folio/stripes-components/lib/Callout';

import { RenderPatronGroupLastUpdated, RenderPatronGroupNumberOfUsers } from '../lib/RenderPatronGroup';

class PatronGroupsSettings extends React.Component {
  static propTypes = {
    // The stripes prop will probably get used eventually, so
    // it's probably best to leave it there.
    // eslint-disable-next-line
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
    this.state = {
      confirming: false,
      type: {},
    };
    this.onCreateType = this.onCreateType.bind(this);
    this.onUpdateType = this.onUpdateType.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
    this.showConfirm = this.showConfirm.bind(this);
    this.hideConfirm = this.hideConfirm.bind(this);
    this.callout = null;
  }

  componentWillReceiveProps(nextProps) {
    if (this.propsReadyToFetchUsers(nextProps)) {
      const ids = this.getLastUpdaterIds(nextProps.resources.groups.records);
      const query = this.craftQueryForLastUpdaters(ids);
      if (query) {
        this.props.mutator.usersLastUpdating.update({ query });
      }
    }
  }

  onCreateType(type) {
    return this.props.mutator.groups.POST(type);
  }

  onUpdateType(type) {
    this.props.mutator.activeRecord.update({ id: type.id });
    // TODO: remove when back end PUT requests ignore read only properties
    // https://issues.folio.org/browse/RMB-92
    // eslint-disable-next-line no-param-reassign
    delete type.metadata;
    return this.props.mutator.groups.PUT(type);
  }

  showCalloutMessage(name) {
    const message = (
      <span>
        The patron group <strong>{name.group}</strong> was successfully <strong>deleted</strong>.
      </span>
    );
    this.callout.sendCallout({ message });
  }

  onDeleteType() {
    const type = this.state.type;
    this.props.mutator.activeRecord.update({ id: type.id });
    // TODO: remove when back end PUT requests ignore read only properties
    // https://issues.folio.org/browse/RMB-92
    // eslint-disable-next-line no-param-reassign
    delete this.state.type.metadata;
    return this.props.mutator.groups.DELETE(type)
      .then(() => this.deletePatronResolve())
      .then(() => this.showCalloutMessage(type))
      .catch(() => this.deletePatronReject())
      .finally(() => this.hideConfirm());
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

  hideConfirm() {
    this.setState({
      confirming: false,
      type: {},
    });
  }

  showConfirm(typeId) {
    const type = this.props.resources.groups.records.find(t => t.id === typeId);
    this.setState({
      confirming: true,
      type,
    });

    this.deletePatronPromise = new Promise((resolve, reject) => {
      this.deletePatronResolve = resolve;
      this.deletePatronReject = reject;
    });
    return this.deletePatronPromise;
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
      query += `id==${id}`;
    }
    return query;
  }

  render() {
    if (!this.props.resources.groups) return <div />;

    const actionProps = {
      delete: (item) => {
        const usersPerGroup = (this.props.resources.usersPerGroup || {}).other || {};
        let disableDelete = [];
        if (_.has(usersPerGroup, ['resultInfo', 'facets'])) {
          const groupCounts = _.get(usersPerGroup, ['resultInfo', 'facets', 0, 'facetValues'], []);
          disableDelete = _.map(groupCounts, 'value');
        }
        if (_.includes(disableDelete, item.id)) {
          return {
            disabled: _.includes(disableDelete, item.id),
            title: 'Patron group cannot be deleted when used by one or more users',
          };
        }

        return {};
      },
    };

    const formatter = {
      lastUpdated: item => (<RenderPatronGroupLastUpdated
        item={item}
        groups={this.props.resources ? this.props.resources.groups : null}
        users={this.props.resources ? this.props.resources.users : null}
        gloss="Last Updated"
      />
      ),
      numberOfUsers: item => (<RenderPatronGroupNumberOfUsers
        item={item}
        usersPerGroup={this.props.resources ? this.props.resources.usersPerGroup : null}
        gloss="# of Users"
      />
      ),
    };

    const modalHeading = 'Delete patron group?';
    const modalMessage = <span>The patron group <strong>{this.state.type.group}</strong> will be <strong>deleted</strong></span>;
    const confirmLabel = 'Delete';

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
            visibleFields={['group', 'desc', 'lastUpdated', 'numberOfUsers']}
            columnMapping={{ desc: 'Description', lastUpdated: 'Last Updated', numberOfUsers: '# of Users' }}
            readOnlyFields={['lastUpdated', 'numberOfUsers']}
            actionProps={actionProps}
            onCreate={this.onCreateType}
            onUpdate={this.onUpdateType}
            onDelete={this.showConfirm}
            isEmptyMessage="There are no patron groups"
            nameKey="group"
            formatter={formatter}
            itemTemplate={{}}
            id="patrongroups"
          />
          <ConfirmationModal
            open={this.state.confirming}
            heading={modalHeading}
            message={modalMessage}
            onConfirm={this.onDeleteType}
            onCancel={this.hideConfirm}
            confirmLabel={confirmLabel}
          />
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default PatronGroupsSettings;
