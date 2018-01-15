import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { filters2cql } from '@folio/stripes-components/lib/FilterGroups';
import SearchAndSort from '@folio/stripes-smart-components/lib/SearchAndSort';

import uuid from 'uuid';
import ViewUser from './ViewUser';
import UserForm from './UserForm';
import { toUserAddresses } from './converters/address';
import { getFullName } from './util';
import packageInfo from './package';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const filterConfig = [
  {
    label: 'Status',
    name: 'active',
    cql: 'active',
    values: [
      { name: 'Active', cql: 'true' },
      { name: 'Inactive', cql: 'false' },
    ],
  },
  {
    label: 'Patron group',
    name: 'pg',
    cql: 'patronGroup',
    values: [], // will be filled in by componentWillUpdate
  },
];

class Users extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      creds: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      perms: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      records: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
    onSelectRow: PropTypes.func,
    disableRecordCreation: PropTypes.bool,
  };

  static manifest = Object.freeze({
    query: {
      initialValue: {
        query: '',
        filters: 'active.Active',
        sort: 'Name',
      },
    },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    records: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{resultCount}',
      perRequest: 30,
      path: 'users',
      GET: {
        params: {
          query: (...args) => {
            /*
              This code is not DRY as it is copied from makeQueryFunction in stripes-components.
              This is necessary, as makeQueryFunction only referneces query paramaters as a data source.
              STRIPES-480 is intended to correct this and allow this query function to be replace with a call
              to makeQueryFunction.
              https://issues.folio.org/browse/STRIPES-480
            */
            const resourceData = args[2];
            const sortMap = {
              Active: 'active',
              Name: 'personal.lastName personal.firstName',
              'Patron Group': 'patronGroup.group',
              Username: 'username',
              Barcode: 'barcode',
              Email: 'personal.email',
            };

            let cql = `(username="${resourceData.query.query}*" or personal.firstName="${resourceData.query.query}*" or personal.lastName="${resourceData.query.query}*" or personal.email="${resourceData.query.query}*" or barcode="${resourceData.query.query}*" or id="${resourceData.query.query}*" or externalSystemId="${resourceData.query.query}*")`;

            const filterCql = filters2cql(filterConfig, resourceData.query.filters);
            if (filterCql) {
              if (cql) {
                cql = `(${cql}) and ${filterCql}`;
              } else {
                cql = filterCql;
              }
            }

            const { sort } = resourceData.query;
            if (sort) {
              const sortIndexes = sort.split(',').map((sort1) => {
                let reverse = false;
                if (sort1.startsWith('-')) {
                  // eslint-disable-next-line no-param-reassign
                  sort1 = sort1.substr(1);
                  reverse = true;
                }
                let sortIndex = sortMap[sort1] || sort1;
                if (reverse) {
                  sortIndex = `${sortIndex.replace(' ', '/sort.descending ')}/sort.descending`;
                }
                return sortIndex;
              });

              cql += ` sortby ${sortIndexes.join(' ')}`;
            }

            return cql;
          },
        },
        staticFallback: { params: {} },
      },
    },
    creds: {
      type: 'okapi',
      path: 'authn/credentials',
      fetch: false,
    },
    perms: {
      type: 'okapi',
      path: 'perms/users',
      fetch: false,
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups?query=cql.allRecords=1 sortby group',
      records: 'usergroups',
    },
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes?query=cql.allRecords=1 sortby desc',
      records: 'addressTypes',
    },
    uniquenessValidator: {
      type: 'okapi',
      records: 'users',
      accumulate: 'true',
      path: 'users',
      fetch: false,
    },
  });

  componentWillUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];
    if (pg && pg.length) {
      const pgFilterConfig = filterConfig.find(group => group.name === 'pg');
      pgFilterConfig.values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
    }
  }

  massageNewRecord = (userdata) => {
    if (userdata.personal.addresses) {
      const addressTypes = (this.props.resources.addressTypes || {}).records || [];
      // eslint-disable-next-line no-param-reassign
      userdata.personal.addresses = toUserAddresses(userdata.personal.addresses, addressTypes);
    }
  }

  // XXX something prevents exceptions in this function from being received: see STRIPES-483
  create = (userdata) => {
    const { mutator } = this.props;
    const creds = Object.assign({}, userdata.creds, { username: userdata.username }, userdata.creds.password ? {} : { password: '' });
    const user = Object.assign({}, userdata, { id: uuid() });
    if (user.creds) delete user.creds;

    mutator.records.POST(user)
      .then(newUser => mutator.creds.POST(Object.assign(creds, { userId: newUser.id })))
      .then(newCreds => mutator.perms.POST({ userId: newCreds.userId, permissions: [] }))
      .then((perms) => {
        mutator.query.update({ _path: `/users/view/${perms.userId}`, layer: null });
      });
  }

  render() {
    const props = this.props;
    const { onSelectRow, disableRecordCreation } = this.props;
    const patronGroups = (props.resources.patronGroups || {}).records || [];
    const initialPath = (_.get(packageInfo, ['stripes', 'home']) ||
                         _.get(packageInfo, ['stripes', 'route']));

    const resultsFormatter = {
      Status: user => (user.active ? 'Active' : 'Inactive'),
      Name: user => getFullName(user),
      Barcode: user => user.barcode,
      'Patron Group': (user) => {
        const pg = patronGroups.filter(g => g.id === user.patronGroup)[0];
        return pg ? pg.group : '?';
      },
      Username: user => user.username,
      Email: user => _.get(user, ['personal', 'email']),
    };

    return (<SearchAndSort
      moduleName={packageInfo.name.replace(/.*\//, '')}
      moduleTitle={packageInfo.stripes.displayName}
      objectName="user"
      baseRoute={packageInfo.stripes.route}
      initialPath={initialPath}
      filterConfig={filterConfig}
      initialFilters={this.constructor.manifest.query.initialValue.filters}
      initialResultCount={INITIAL_RESULT_COUNT}
      resultCountIncrement={RESULT_COUNT_INCREMENT}
      viewRecordComponent={ViewUser}
      editRecordComponent={UserForm}
      newRecordInitialValues={{ active: true, personal: { preferredContactTypeId: '002' } }}
      visibleColumns={['Status', 'Name', 'Barcode', 'Patron Group', 'Username', 'Email']}
      resultsFormatter={resultsFormatter}
      onSelectRow={onSelectRow}
      onCreate={this.create}
      massageNewRecord={this.massageNewRecord}
      finishedResourceName="perms"
      viewRecordPerms="users.item.get"
      newRecordPerms="users.item.post,login.item.post,perms.users.item.post"
      disableRecordCreation={disableRecordCreation}
      parentResources={props.resources}
      parentMutator={props.mutator}
    />);
  }
}

export default Users;
