import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import Route from 'react-router-dom/Route';
import queryString from 'query-string';
import fetch from 'isomorphic-fetch';

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup';
import Layer from '@folio/stripes-components/lib/Layer';
import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';

import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
import IfPermission from '@folio/stripes-components/lib/IfPermission';

import UserForm from './UserForm';
import ViewUser from './ViewUser';

import contactTypes from './data/contactTypes';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const filterConfig = [
  {
    label: 'User status',
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
    stripes: PropTypes.shape({
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
      connect: PropTypes.func.isRequired,
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    data: PropTypes.object.isRequired,
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
      addUserMode: PropTypes.shape({
        replace: PropTypes.func,
      }),
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
  };

  static manifest = Object.freeze({
    addUserMode: {},
    userCount: { initialValue: INITIAL_RESULT_COUNT },
    users: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '${userCount}',
      perRequest: 10,
      path: 'users',
      GET: {
        params: {
          query: makeQueryFunction(
            'username=*',
            'username="$QUERY*" or personal.firstName="$QUERY*" or personal.lastName="$QUERY*"',
            {
              Active: 'active',
              Name: 'personal.lastName personal.firstName',
              'Patron Group': 'patronGroup',
              'User ID': 'username',
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
  });

  constructor(props) {
    super(props);

    const query = props.location.search ? queryString.parse(props.location.search) : {};
    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: {},
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
    };

    this.okapi = props.okapi;

    this.commonChangeFilter = commonChangeFilter.bind(this);
    this.transitionToParams = transitionToParams.bind(this);
    this.connectedViewUser = props.stripes.connect(ViewUser);
    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);
  }

  componentWillMount() {
    if (_.isEmpty(this.props.data.addUserMode)) this.props.mutator.addUserMode.replace({ mode: false });
  }

  componentWillUpdate() {
    const pg = this.props.data.patronGroups;
    if (pg && pg.length) {
      filterConfig[1].values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
    }
  }

  onClearSearch = () => {
    this.log('action', 'cleared search');
    this.setState({ searchTerm: '' });
    this.props.history.push(this.props.location.pathname);
  }

  onSort = (e, meta) => {
    const sortOrder = meta.alias;
    this.log('action', `sorted by ${sortOrder}`);
    this.setState({ sortOrder });
    this.transitionToParams({ sort: sortOrder });
  }

  onSelectRow = (e, meta) => {
    const userId = meta.id;
    const username = meta.username;
    this.log('action', `clicked ${userId}, selected user =`, meta);
    this.setState({ selectedItem: meta });
    this.props.history.push(`/users/view/${userId}/${username}${this.props.location.search}`);
  }

  onClickAddNewUser = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "add new user"');
    this.props.mutator.addUserMode.replace({ mode: true });
  }

  onClickCloseNewUser = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close new user"');
    this.props.mutator.addUserMode.replace({ mode: false });
  }

  onChangeFilter = (e) => {
    this.props.mutator.userCount.replace(INITIAL_RESULT_COUNT);
    this.commonChangeFilter(e);
  }

  onChangeSearch = (e) => {
    const query = e.target.value;
    this.props.mutator.userCount.replace(INITIAL_RESULT_COUNT);
    this.setState({ searchTerm: query });
    this.performSearch(query);
  }

  onNeedMore = () => {
    this.props.mutator.userCount.replace(this.props.data.userCount + RESULT_COUNT_INCREMENT);
  }

  performSearch = _.debounce((query) => {
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }, 150);

  updateFilters = (filters) => { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  create = (data) => {
    // extract creds object from user object
    const creds = Object.assign({}, data.creds, { username: data.username });
    if (data.creds) delete data.creds; // eslint-disable-line no-param-reassign
    // POST user record
    this.props.mutator.users.POST(data);
    // POST credentials, permission-user, permissions;
    this.postCreds(data.username, creds);
    this.onClickCloseNewUser();
  }

  postCreds = (username, creds) => {
    this.log('xhr', `POST credentials for new user '${username}':`, creds);
    fetch(`${this.okapi.url}/authn/credentials`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify(creds),
    }).then((response) => {
      if (response.status >= 400) {
        this.log('xhr', 'Users. POST of creds failed.');
      } else {
        this.postPerms(username, [
          'users.collection.get',       // so the user can search for his own user record after login
          'perms.permissions.get',      // so the user can fetch his own permissions after login
        ]);
      }
    });
  }

  postPerms = (username, perms) => {
    this.log('xhr', `POST permissions for new user '${username}':`, perms);
    fetch(`${this.okapi.url}/perms/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify({ username, permissions: perms }),
    }).then((response) => {
      if (response.status >= 400) {
        this.log('xhr', 'Users. POST of users permissions failed.');
      } else {
        // nothing to do
      }
    });
  }

  collapseDetails = () => {
    this.setState({
      selectedItem: {},
    });
    this.props.history.push(`${this.props.match.path}${this.props.location.search}`);
  }

  render() {
    const { data, stripes } = this.props;
    const users = data.users || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;

    const resultsFormatter = {
      Active: user => user.active,
      Name: user => `${_.get(user, ['personal', 'lastName'], '')}, ${_.get(user, ['personal', 'firstName'], '')}`,
      'Patron Group': (user) => {
        const pg = data.patronGroups.filter(g => g.id === user.patronGroup)[0];
        return pg ? pg.group : '?';
      },
      'User ID': user => user.username,
      Email: user => _.get(user, ['personal', 'email']),
    };

    const detailsPane = (
      this.props.stripes.hasPerm('users.item.get') ?
        (<Route
          path={`${this.props.match.path}/view/:userid/:username`}
          render={props => <this.connectedViewUser stripes={stripes} okapi={this.okapi} paneWidth="44%" onClose={this.collapseDetails} {...props} />}
        />) :
        (<div
          style={{
            position: 'absolute',
            right: '1rem',
            bottom: '1rem',
            width: '34%',
            zIndex: '9999',
            padding: '1rem',
            backgroundColor: '#fff',
          }}
        >
          <h2>Permission Error</h2>
          <p>Sorry - your user permissions do not allow access to this page.</p>
        </div>));

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
          <FilterControlGroup label="Actions">
            <IfPermission perm="users.item.post">
              <IfPermission perm="login.item.post">
                <IfPermission perm="perms.users.item.post">
                  <Button fullWidth onClick={this.onClickAddNewUser}>New user</Button>
                </IfPermission>
              </IfPermission>
            </IfPermission>
          </FilterControlGroup>
        </Pane>
        {/* Results Pane */}
        <Pane
          defaultWidth="fill"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Results</strong>
              <div>
                <em>{users.length} Result{users.length === 1 ? '' : 's'} Found</em>
              </div>
            </div>
          }
          lastMenu={resultMenu}
        >
          <MultiColumnList
            contentData={users}
            selectedRow={this.state.selectedItem}
            rowMetadata={['id', 'username']}
            formatter={resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            onFetch={this.onNeedMore}
            visibleColumns={['Active', 'Name', 'Patron Group', 'User ID', 'Email']}
            sortOrder={this.state.sortOrder}
            isEmptyMessage={`No results found for "${this.state.searchTerm}". Please check your spelling and filters.`}
            columnMapping={{ 'User ID': 'username' }}
          />
        </Pane>

        {detailsPane}
        <Layer isOpen={data.addUserMode ? data.addUserMode.mode : false} label="Add New User Dialog">
          <UserForm
            initialValues={{ active: true, personal: { preferredContactTypeId: '002' }}}
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewUser}
            okapi={this.okapi}
            optionLists={{ patronGroups: this.props.data.patronGroups, contactTypes }}
          />
        </Layer>
      </Paneset>
    );
  }
}

export default Users;
