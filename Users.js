import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import fetch from 'isomorphic-fetch';

import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import Notes from '@folio/stripes-smart-components/lib/Notes';
import { SubmissionError } from 'redux-form';
import uuid from 'uuid';

import SearchAndSort from'./lib/SearchAndSort';

import removeQueryParam from './removeQueryParam';
import { toUserAddresses } from './converters/address';
import packageInfo from './package';


// XXX Keep in sync with the value from <SearchAndSort>. Later, we will find a better way to share the value
const INITIAL_RESULT_COUNT = 30;


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
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      users: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number.isRequired,
        }),
        isPending: PropTypes.bool.isPending,
        successfulMutations: PropTypes.arrayOf(
          PropTypes.shape({
            record: PropTypes.shape({
              id: PropTypes.string.isRequired,
              username: PropTypes.string.isRequired,
            }).isRequired,
          }),
        ),
      }),
      userCount: PropTypes.number,
      notes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      userCount: PropTypes.shape({
        replace: PropTypes.func,
      }),
      users: PropTypes.shape({
        POST: PropTypes.func,
      }),
    }).isRequired,
    okapi: PropTypes.shape({
      url: PropTypes.string.isRequired,
      tenant: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired,
    }).isRequired,
    onSelectRow: PropTypes.func,
    disableUserCreation: PropTypes.bool,
  };

  static manifest = Object.freeze({
    userCount: { initialValue: INITIAL_RESULT_COUNT },
    users: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{userCount}',
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

    this.state = {};
    this.okapi = props.okapi;

    this.transitionToParams = transitionToParams.bind(this);
    this.connectedNotes = props.stripes.connect(Notes);
    this.connectedSearchAndSort = props.stripes.connect(SearchAndSort);

    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);

    this.anchoredRowFormatter = this.anchoredRowFormatter.bind(this);

    this.resultsList = null;

    this.toggleNotes = this.toggleNotes.bind(this);
  }

  componentWillUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];

    if (pg && pg.length) {
      filterConfig[1].values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
    }
  }

  onClickAddNewUser = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "add new user"');
    this.transitionToParams({ layer: 'create' });
  }

  onClickCloseNewUser = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close new user"');
    removeQueryParam('layer', this.props.location, this.props.history);
  }

  getRowURL(rowData) {
    return `/users/view/${rowData.id}${this.props.location.search}`;
  }

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
      this.onClickCloseNewUser();
      this.onSelectRow(null, { id: userId });
    });
  }

  postUser = user =>
    fetch(`${this.okapi.url}/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
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
    return fetch(`${this.okapi.url}/authn/credentials`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
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
    return fetch(`${this.okapi.url}/perms/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId, permissions }),
    }).then((response) => {
      if (response.status >= 400) {
        throw new SubmissionError('Creating empty permissions for new user failed');
      } else {
        return userId;
      }
    });
  }

  collapseDetails = () => {
    this.setState({
      selectedItem: {},
    });
    this.props.history.push(`${this.props.match.path}${this.props.location.search}`);
  }

  toggleNotes() {
    this.setState((curState) => {
      const show = !curState.showNotesPane;
      return {
        showNotesPane: show,
      };
    });
  }

  // custom row formatter to wrap rows in anchor tags.
  anchoredRowFormatter(
    { rowIndex,
      rowClass,
      rowData,
      cells,
      rowProps,
      labelStrings,
    },
  ) {
    return (
      <a
        href={this.getRowURL(rowData)} key={`row-${rowIndex}`}
        aria-label={labelStrings && labelStrings.join('...')}
        role="listitem"
        className={rowClass}
        {...rowProps}
      >
        {cells}
      </a>
    );
  }

  render() {
    const props = this.props;
    const urlQuery = queryString.parse(props.location.search || '');
    const initialPath = (_.get(packageInfo, ['stripes', 'home']) ||
                         _.get(packageInfo, ['stripes', 'route']));

    return (<this.connectedSearchAndSort
      stripes={props.stripes}
      onSelectRow={props.onSelectRow}
      parentResources={props.resources}
      parentMutator={props.mutator}
      urlQuery={urlQuery}
      path={props.location.pathname}
      filterConfig={filterConfig}
      initialPath={initialPath}
    />);
  }
}

export default Users;
