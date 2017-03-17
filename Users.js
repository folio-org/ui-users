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
import FilterGroups, { initialFilterState, onChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import makePathFunction from '@folio/stripes-components/util/makePathFunction';
import IfPermission from '@folio/stripes-components/lib/IfPermission';

import UserForm from './UserForm';
import ViewUser from './ViewUser';

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
    cql: 'patron_group',
    values: [
      { name: 'On-campus', cql: 'on_campus' },
      { name: 'Off-campus', cql: 'off_campus' },
      { name: 'Other', cql: 'other' },
    ],
  },
];

class Users extends React.Component {
  static contextTypes = {
    store: PropTypes.object,
  };

  static propTypes = {
    connect: PropTypes.func.isRequired,
    logger: PropTypes.shape({
      log: PropTypes.func.isRequired,
    }).isRequired,
    currentPerms: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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
      users: PropTypes.shape({
        POST: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    addUserMode: {},
    users: {
      type: 'okapi',
      records: 'users',
      path: makePathFunction(
        'users',
        'username=*',
        'username="$QUERY*" or personal.first_name="$QUERY*" or personal.last_name="$QUERY*"',
        {
          Active: 'active',
          Name: 'personal.last_name personal.first_name',
          'Patron Group': 'patron_group',
          Username: 'username',
          Email: 'personal.email',
        },
        filterConfig,
      ),
      staticFallback: { path: 'users' },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
      pk: '_id',
    },
  });

  constructor(props, context) {
    super(props);

    const query = props.location.search ? queryString.parse(props.location.search) : {};
    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: {},
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
    };

    this.okapi = context.store.getState().okapi;

    this.onClearSearch = this.onClearSearch.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
    this.onClickAddNewUser = this.onClickAddNewUser.bind(this);
    this.onClickCloseNewUser = this.onClickCloseNewUser.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.performSearch = this.performSearch.bind(this); // For now, prefer instant response
    // this.performSearch = _.debounce(this.performSearch.bind(this), 250);

    this.onChangeFilter = onChangeFilter.bind(this);
    this.transitionToParams = transitionToParams.bind(this);

    this.connectedViewUser = this.props.connect(ViewUser);
  }

  componentWillMount() {
    if (_.isEmpty(this.props.data.addUserMode)) this.props.mutator.addUserMode.replace({ mode: false });
  }

  onClearSearch() {
    this.props.logger.log('action', 'cleared search');
    this.setState({ searchTerm: '' });
    this.props.history.push(this.props.location.pathname);
  }

  onSort(e, meta) {
    const sortOrder = meta.name;
    this.props.logger.log('action', `sorted by ${sortOrder}`);
    this.setState({ sortOrder });
    this.transitionToParams({ sort: sortOrder });
  }

  onSelectRow(e, meta) {
    const userId = meta.id;
    const username = meta.username;
    this.props.logger.log('action', `clicked ${userId}, location =`, this.props.location, 'selected user =', meta);
    this.setState({ selectedItem: meta });
    this.props.history.push(`/users/view/${userId}/${username}${this.props.location.search}`);
  }

  onClickAddNewUser(e) {
    if (e) e.preventDefault();
    this.props.logger.log('action', 'clicked "add new user"');
    this.props.mutator.addUserMode.replace({ mode: true });
  }

  onClickCloseNewUser(e) {
    if (e) e.preventDefault();
    this.props.logger.log('action', 'clicked "close new user"');
    this.props.mutator.addUserMode.replace({ mode: false });
  }

  onChangeSearch(e) {
    const query = e.target.value;
    this.setState({ searchTerm: query });
    this.performSearch(query);
  }

  performSearch(query) {
    this.props.logger.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }

  updateFilters(filters) { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  create(data) {
    // extract creds object from user object
    const creds = Object.assign({}, data.creds, { username: data.username });
    if (data.creds) delete data.creds; // eslint-disable-line no-param-reassign
    // POST user record
    this.props.mutator.users.POST(data);
    // POST credentials, permission-user, permissions;
    this.postCreds(data.username, creds);
    this.onClickCloseNewUser();
  }

  postCreds(username, creds) {
    fetch(`${this.okapi.url}/authn/credentials`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify(creds),
    }).then((response) => {
      if (response.status >= 400) {
        this.props.logger.log('xhr', 'Users. POST of creds failed.');
      } else {
        this.postPerms(username, ['users.read', 'perms.users.read']);
      }
    });
  }

  postPerms(username, perms) {
    fetch(`${this.okapi.url}/perms/users`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.okapi.tenant, 'X-Okapi-Token': this.okapi.token, 'Content-Type': 'application/json' }),
      body: JSON.stringify({ username, permissions: perms }),
    }).then((response) => {
      if (response.status >= 400) {
        this.props.logger.log('xhr', 'Users. POST of users permissions failed.');
      } else {
        // nothing to do
      }
    });
  }

  render() {
    const { data, currentPerms } = this.props;
    const users = data.users || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;

    const resultsFormatter = {
      Active: user => user.active,
      Name: user => `${_.get(user, ['personal', 'last_name'], '')}, ${_.get(user, ['personal', 'first_name'], '')}`,
      'Patron Group': (user) => {
        const map = {
          on_campus: 'On-campus',
          off_campus: 'Off-campus',
          other: 'Other',
        };
        return map[user.patron_group] || '?';
      },
      Username: user => user.username,
      Email: user => _.get(user, ['personal', 'email']),
    };

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
          <FilterControlGroup label="Actions">
            <IfPermission {...this.props} perm="users.create">
              <Button fullWidth onClick={this.onClickAddNewUser}>New user</Button>
            </IfPermission>
          </FilterControlGroup>
        </Pane>
        {/* Results Pane */}
        <Pane
          defaultWidth="40%"
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
            visibleColumns={['Active', 'Name', 'Patron Group', 'Username', 'Email']}
            fullWidth
            sortOrder={this.state.sortOrder}
            isEmptyMessage={`No results found for "${this.state.searchTerm}". Please check your spelling and filters.`}
          />
        </Pane>

        {/* Details Pane */}
        <Route path={`${this.props.match.path}/view/:userid/:username`} render={props => <this.connectedViewUser currentPerms={currentPerms} connect={this.props.connect} placeholder={'placeholder'} {...props} />} />
        <Layer isOpen={data.addUserMode ? data.addUserMode.mode : false} label="Add New User Dialog">
          <UserForm
            initialValues={{ available_patron_groups: this.props.data.patronGroups }}
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewUser}
          />
        </Layer>
      </Paneset>
    );
  }
}

export default Users;
