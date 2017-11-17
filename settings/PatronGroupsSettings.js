import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

import { RenderPatronGroupLastUpdated, RenderPatronGroupNumberOfUsers } from '../lib/RenderPatronGroup';

class PatronGroupsSettings extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  static manifest = Object.freeze({
    usersPerGroup: {
      type: 'okapi',
      records: 'users',
      path: 'users?limit=0&facets=patronGroup'
    },
    users: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(%{usersLastUpdating.query})',
      accumulate: 'true'
    },
    groups: {
      type: 'okapi',
      records: 'usergroups',
      path: 'groups',
    },
    usersLastUpdating: {}
  });

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
    this.connectedPatronGroupLastUpdated = props.stripes.connect(RenderPatronGroupLastUpdated);
    this.connectedPatronGroupNumberOfUsers = props.stripes.connect(RenderPatronGroupNumberOfUsers);
  }

  componentWillReceiveProps(nextProps) {
    if(this.propsReadyToFetchUsers(nextProps)) {
      const ids = this.getLastUpdaterIds(nextProps.resources.groups.records);
      const query = this.craftQueryForLastUpdaters(ids);
      this.props.mutator.usersLastUpdating.update({ query });
    }
  }

  propsReadyToFetchUsers(nextProps) {
    return nextProps.resources.groups.hasLoaded && this.props.resources.usersLastUpdating.query === undefined;
  }

  getLastUpdaterIds(groups) {
    const userIds = [];
    for (let group of groups) {
      if(group.metadata && !_.includes(userIds, group.metadata.updatedByUserId)) {
        userIds.push(group.metadata.updatedByUserId);
      }
    }
    return userIds;
  }

  craftQueryForLastUpdaters(ids) {
    let query = "";
    for(let id of ids) {
      if(query.length > 0) {
        query += " or ";
      }
      query += `id=${id}`;
    }
    return query;
  }

  render() {
    return (
      <this.connectedControlledVocab
        {...this.props}
        baseUrl="groups"
        records="usergroups"
        label="Patron Groups"
        visibleFields={['group', 'desc']}
        itemTemplate={{ group: 'string', id: 'string', desc: 'string' }}
        nameKey="group"
        additionalFields={
          {
            lastUpdated: {
              component: this.connectedPatronGroupLastUpdated,
              gloss: "Last Updated",
              inheritedProps: this.props,
            },
            numberOfUsers: {
              component: this.connectedPatronGroupNumberOfUsers,
              gloss: "# of Users",
              inheritedProps: this.props,
            },
          }
        }
      />
    );
  }
}

export default PatronGroupsSettings;
