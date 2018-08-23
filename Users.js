import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
import SearchAndSort from '@folio/stripes-smart-components/lib/SearchAndSort';
import exportToCsv from '@folio/stripes-util/lib/exportCsv';

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
      { name: 'Show inactive users', cql: 'false' },
      { name: 'Show active users', cql: 'true', hidden: true },
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
  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: {} },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    records: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{resultCount}',
      perRequest: 30,
      path: 'users',
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            '(username="%{query.query}*" or personal.firstName="%{query.query}*" or personal.lastName="%{query.query}*" or personal.email="%{query.query}*" or barcode="%{query.query}*" or id="%{query.query}*" or externalSystemId="%{query.query}*")',
            {
              'Active': 'active',
              'Name': 'personal.lastName personal.firstName',
              'Patron group': 'patronGroup.group',
              'Username': 'username',
              'Barcode': 'barcode',
              'Email': 'personal.email',
            },
            filterConfig,
            2,
          ),
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
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '40',
      },
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

  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
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
      initializedFilterConfig: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
      perms: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      records: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
    onSelectRow: PropTypes.func,
    onComponentWillUnmount: PropTypes.func,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
    disableRecordCreation: PropTypes.bool,
    showSingleResult: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    browseOnly: PropTypes.bool,
  };

  static defaultProps = {
    showSingleResult: true,
    browseOnly: false,
  }

  componentDidUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];
    if (pg && pg.length) {
      const pgFilterConfig = filterConfig.find(group => group.name === 'pg');
      const oldValuesLength = pgFilterConfig.values.length;
      pgFilterConfig.values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
      if (oldValuesLength === 0) {
        this.props.mutator.initializedFilterConfig.replace(true); // triggers refresh of users
      }
    }
  }

  // XXX something prevents exceptions in this function from being received: see STRIPES-483
  create = (userdata) => {
    const { mutator } = this.props;
    if (userdata.username) {
      const creds = Object.assign({}, userdata.creds, { username: userdata.username }, userdata.creds.password ? {} : { password: '' });
      const user = Object.assign({}, userdata, { id: uuid() });
      if (user.creds) delete user.creds;

      mutator.records.POST(user)
        .then(newUser => mutator.creds.POST(Object.assign(creds, { userId: newUser.id })))
        .then(newCreds => mutator.perms.POST({ userId: newCreds.userId, permissions: [] }))
        .then((perms) => {
          mutator.query.update({ _path: `/users/view/${perms.userId}`, layer: null });
        });
    } else {
      const user = Object.assign({}, userdata, { id: uuid() });
      if (user.creds) delete user.creds;

      mutator.records.POST(user)
        .then((newUser) => mutator.perms.POST({ userId: newUser.id, permissions: [] }))
        .then((perms) => {
          mutator.query.update({ _path: `/users/view/${perms.userId}`, layer: null });
        });
    }
  }

  massageNewRecord = (userdata) => {
    if (userdata.personal.addresses) {
      const addressTypes = (this.props.resources.addressTypes || {}).records || [];
      // eslint-disable-next-line no-param-reassign
      userdata.personal.addresses = toUserAddresses(userdata.personal.addresses, addressTypes);
    }
  }

  render() {
    const { onSelectRow, disableRecordCreation, onComponentWillUnmount, showSingleResult, browseOnly, stripes: { intl } } = this.props;
    const patronGroups = (this.props.resources.patronGroups || {}).records || [];

    const resultsFormatter = {
      status: user => (user.active ? intl.formatMessage({ id: 'ui-users.active' }) : intl.formatMessage({ id: 'ui-users.inactive' })),
      name: user => getFullName(user),
      barcode: user => user.barcode,
      patronGroup: (user) => {
        const pg = patronGroups.filter(g => g.id === user.patronGroup)[0];
        return pg ? pg.group : '?';
      },
      username: user => user.username,
      email: user => _.get(user, ['personal', 'email']),
    };
    const actionMenuItems = [
      {
        label: 'Export to CSV',
        onClick: (() => {
          this.props.mutator.resultCount.replace(this.props.resources.records.other.totalRecords);
          console.debug(this.props.resources.records.records.length)
          exportToCsv(this.props.resources.records.records, ['id']);
        }).bind(this),
        id: "exportToCsvPaneHeaderBtn",
      },
    ];

    return (<SearchAndSort
      actionMenuItems={actionMenuItems}
      packageInfo={packageInfo}
      objectName="user"
      filterConfig={filterConfig}
      initialResultCount={INITIAL_RESULT_COUNT}
      resultCountIncrement={RESULT_COUNT_INCREMENT}
      viewRecordComponent={ViewUser}
      editRecordComponent={UserForm}
      newRecordInitialValues={{ active: true, personal: { preferredContactTypeId: '002' } }}
      visibleColumns={this.props.visibleColumns ? this.props.visibleColumns : ['status', 'name', 'barcode', 'patronGroup', 'username', 'email']}
      resultsFormatter={resultsFormatter}
      onSelectRow={onSelectRow}
      onCreate={this.create}
      onComponentWillUnmount={onComponentWillUnmount}
      massageNewRecord={this.massageNewRecord}
      finishedResourceName="perms"
      viewRecordPerms="users.item.get"
      newRecordPerms="users.item.post,login.item.post,perms.users.item.post"
      disableRecordCreation={disableRecordCreation}
      parentResources={this.props.resources}
      parentMutator={this.props.mutator}
      showSingleResult={showSingleResult}
      columnMapping={{
        status: intl.formatMessage({ id: 'ui-users.active' }),
        name: intl.formatMessage({ id: 'ui-users.information.name' }),
        barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
        patronGroup: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
        username: intl.formatMessage({ id: 'ui-users.information.username' }),
        email: intl.formatMessage({ id: 'ui-users.contact.email' }),
      }}
      browseOnly={browseOnly}
    />);
  }
}

export default Users;
