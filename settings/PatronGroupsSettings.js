import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

import { RenderPatronGroupLastUpdated, RenderPatronGroupNumberOfUsers } from '../lib/RenderPatronGroup';

function validate(values) {
  const errors = [];
  if (Array.isArray(values.items)) {
    const itemArrayErrors = [];
    values.items.forEach((item, itemIndex) => {
      const itemErrors = {};
      if (!item.group) {
        itemErrors.group = 'Please fill this in to continue';
        itemArrayErrors[itemIndex] = itemErrors;
      }
    });
    if (itemArrayErrors.length) {
      errors.items = itemArrayErrors;
    }
  }
  return errors;
}

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
    location: PropTypes.object.isRequired,
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

    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
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
      query += `id==${id}`;
    }
    return query;
  }

  render() {
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
      numberOfObjects: item => (<RenderPatronGroupNumberOfUsers
        item={item}
        gloss="# of Users"
        usersPerGroup={this.props.resources ? this.props.resources.usersPerGroup : null}
      />
      ),
    };

    return (
      <this.connectedControlledVocab
        {...this.props}
        baseUrl="groups"
        records="usergroups"
        label="Patron Groups"
        labelSingular="Group"
        objectLabel="Users"
        visibleFields={['group', 'desc']}
        columnMapping={{ desc: 'Description' }}
        actionProps={actionProps}
        formatter={formatter}
        nameKey="group"
        id="patrongroups"
        validate={validate}
      />
    );
  }
}

export default PatronGroupsSettings;
