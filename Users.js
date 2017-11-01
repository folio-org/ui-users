import _ from 'lodash';
import fetch from 'isomorphic-fetch';
import React from 'react';
import PropTypes from 'prop-types';
import { SubmissionError } from 'redux-form';
import queryString from 'query-string';
import uuid from 'uuid';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import ViewUser from './ViewUser';
import UserForm from './UserForm';
import removeQueryParam from './removeQueryParam';
import SearchAndSort from './lib/SearchAndSort';
import { toUserAddresses } from './converters/address';
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
    stripes: stripesShape.isRequired,
    okapi: PropTypes.shape({
      url: PropTypes.string.isRequired,
      tenant: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      creds: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      perms: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      users: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
    onSelectRow: PropTypes.func,
  };

  static manifest = Object.freeze({
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
            'username=*',
            'username="$QUERY*" or personal.firstName="$QUERY*" or personal.lastName="$QUERY*" or personal.email="$QUERY*" or barcode="$QUERY*" or id="$QUERY*" or externalSystemId="$QUERY*"',
            {
              Status: 'active',
              Name: 'personal.lastName personal.firstName',
              'Patron Group': 'patronGroup.group',
              Username: 'username',
              Barcode: 'barcode',
              Email: 'personal.email',
            },
            filterConfig,
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
      records: 'usergroups',
    },
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      records: 'addressTypes',
    },
  });

  constructor(props) {
    super(props);
    const logger = props.stripes.logger;
    this.state = {};
    this.log = logger.log.bind(logger);
    this.connectedSearchAndSort = props.stripes.connect(SearchAndSort);
  }

  componentWillUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];
    if (pg && pg.length) {
      filterConfig[1].values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
    }
  }

  // XXX something bad is happening here that prevents exceptions in this function from being received
  create = (userdata) => {
    if (userdata.personal.addresses) {
      const addressTypes = (this.props.resources.addressTypes || {}).records || [];
      userdata.personal.addresses = toUserAddresses(userdata.personal.addresses, addressTypes); // eslint-disable-line no-param-reassign
    }
    const creds = Object.assign({}, userdata.creds, { username: userdata.username });
    const user = Object.assign({}, userdata, { id: uuid() });
    if (user.creds) delete user.creds;

    this.postUser(user)
    .then(newUser => this.postCreds(newUser.id, creds))
    .then(userId => this.postPerms(userId))
    .then((userId) => {
      removeQueryParam('layer', this.props.location, this.props.history);
      this.props.history.push(`/users/view/${userId}${this.props.location.search}`);
    });
  }

  postUser(user) {
    return this.props.mutator.users.POST(user);
  }

  postCreds(userId, creds) {
    const localCreds = Object.assign({}, creds, creds.password ? {} : { password: '' }, { userId });
    return this.props.mutator.creds.POST(localCreds);
  }

  postPerms(userId) {
    const permissions = [];
    return this.props.mutator.perms.POST(permissions);
  }

  /*
  postUser = user =>
    fetch(`${this.props.okapi.url}/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.props.okapi.tenant, 'X-Okapi-Token': this.props.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify(user),
    }).then((userPostResponse) => {
      if (userPostResponse.status >= 400) {
        throw new SubmissionError('Creating new user failed');
      } else {
        return userPostResponse.json();
      }
    }).then(userJson => userJson);

  postCreds = (userId, creds) => {
    this.log('xhr', `POST credentials for new user '${userId}':`, creds);
    const localCreds = Object.assign({}, creds, creds.password ? {} : { password: '' }, { userId });
    return fetch(`${this.props.okapi.url}/authn/credentials`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.props.okapi.tenant, 'X-Okapi-Token': this.props.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify(localCreds),
    }).then((credsPostResponse) => {
      if (credsPostResponse.status >= 400) {
        throw new SubmissionError('Creating credentials for new user failed');
      } else {
        return userId;
      }
    });
  }

  postPerms = (userId) => {
    const permissions = [];
    this.log('xhr', `POST permissions for new user '${userId}':`, permissions);
    return fetch(`${this.props.okapi.url}/perms/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.props.okapi.tenant, 'X-Okapi-Token': this.props.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId, permissions }),
    }).then((response) => {
      if (response.status >= 400) {
        throw new SubmissionError('Creating empty permissions for new user failed');
      } else {
        return userId;
      }
    });
  }
  */

  render() {
    const props = this.props;
    const urlQuery = queryString.parse(props.location.search || '');
    const initialPath = (_.get(packageInfo, ['stripes', 'home']) ||
                         _.get(packageInfo, ['stripes', 'route']));

    return (<this.connectedSearchAndSort
      translationBase="ui-users"
      stripes={props.stripes}
      okapi={this.props.okapi}
      initialPath={initialPath}
      filterConfig={filterConfig}
      initialResultCount={INITIAL_RESULT_COUNT}
      resultCountIncrement={RESULT_COUNT_INCREMENT}
      viewRecordComponent={ViewUser}
      editRecordComponent={UserForm}
      parentResources={props.resources}
      parentMutator={this.props.mutator}
      onSelectRow={this.props.onSelectRow}
      onCreate={this.create}
      path={this.props.location.pathname}
      urlQuery={urlQuery}
      disableRecordCreation={props.disableRecordCreation}
    />);
  }
}

export default Users;
