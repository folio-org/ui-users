import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import Match from 'react-router/Match';
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
import FilterGroups, { initialFilterState, filters2cql, onChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';

import UserForm from './UserForm';
import ViewUser from './ViewUser';

const filterConfig = [
  {
    label: 'Filters',
    name: 'active',
    cql: 'active',
    values: [
      { name: 'Active', cql: 'true' },
      { name: 'Inactive', cql: 'false' },
    ],
  },
];

class Users extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object,
  };

  static propTypes = {
    data: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      query: PropTypes.object, // object of key=value pairs
      search: PropTypes.string, // string combining all parts of query
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
      path: (queryParams, _pathComponents, _resourceValues) => {
        const { query, filters, sort } = queryParams || {};

        let cql;
        if (query) {
          cql = `username="${query}*" or personal.first_name="${query}*" or personal.last_name="${query}*"`;
        }

        const filterCql = filters2cql(filterConfig, filters);
        if (filterCql) {
          if (cql) {
            cql = `(${cql}) and ${filterCql}`;
          } else {
            cql = filterCql;
          }
        }

        if (sort) {
          const sortMap = {
            Active: 'active',
            Name: 'personal.last_name personal.first_name',
            Username: 'username',
            Email: 'personal.email',
          };
          const sortIndex = sortMap[sort];
          if (sortIndex) {
            if (cql === undefined) cql = 'username=*';
            cql += ` sortby ${sortIndex}`;
          }
        }

        let path = 'users';
        if (cql) path += `?query=${encodeURIComponent(cql)}`;

        console.log(`query=${query} filters=${filters} sort=${sort} -> ${path}`);
        return path;
      },
      staticFallback: { path: 'users' },
    },
  });

  constructor(props, context) {
    super(props);

    const query = props.location.query || {};
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
  }

  componentWillMount() {
    if (_.isEmpty(this.props.data.addUserMode)) this.props.mutator.addUserMode.replace({ mode: false });
  }

  // search Handlers...
  onClearSearch() {
    console.log('User cleared search');
    this.setState({ searchTerm: '' });
    this.context.router.transitionTo(this.props.location.pathname);
  }

  onSort(e, meta) {
    const sortOrder = meta.name;
    console.log('User sorted by', sortOrder);
    this.setState({ sortOrder });
    this.transitionToParams({ sort: sortOrder });
  }

  onSelectRow(e, meta) {
    const userId = meta.id;
    const username = meta.username;
    console.log('User clicked', userId, 'location = ', this.props.location);
    this.setState({ selectedItem: meta });
    this.context.router.transitionTo(`/users/view/${userId}/${username}${this.props.location.search}`);
  }

  // end search Handlers

  // AddUser Handlers
  onClickAddNewUser(e) {
    if (e) e.preventDefault();
    this.props.mutator.addUserMode.replace({ mode: true });
  }

  onClickCloseNewUser(e) {
    if (e) e.preventDefault();
    this.props.mutator.addUserMode.replace({ mode: false });
  }
  // end AddUser Handlers


  onChangeSearch(e) {
    const term = e.target.value;
    this.setState({ searchTerm: term });
    this.performSearch(term);
  }

  performSearch(term) {
    console.log('User searched:', term, 'at', this.props.location.pathname);
    this.transitionToParams({ query: term });
  }

  updateFilters(filters) { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  create(data) {
    // extract creds object from user object
    const creds = Object.assign({}, data.creds, { username: data.username });
    if (data.creds) delete data.creds; // eslint-disable-line no-param-reassign
    // POST user record
    const p = this.props.mutator.users.POST(data);
    console.log('got promise', p);
    p.then((x) => {
      console.log('POST promise was OK:', x);
    }).catch((x) => {
      console.log('POST promise failed:', x);
    });
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
        console.log('Users. POST of creds failed.');
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
        console.log('Users. POST of users permissions failed.');
      } else {
        // nothing to do
      }
    });
  }

  render() {
    const { data, pathname } = this.props;
    const users = data.users || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;

    const resultsFormatter = {
      Active: user => user.active,
      Name: user => `${_.get(user, ['personal', 'last_name'], '')}, ${_.get(user, ['personal', 'first_name'], '')}`,
      Username: user => user.username,
      Email: user => _.get(user, ['personal', 'email']),
    };

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
          <FilterControlGroup label="Actions">
            <Button fullWidth onClick={this.onClickAddNewUser}>New user</Button>
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
            visibleColumns={['Active', 'Name', 'Username', 'Email']}
            fullWidth
            sortOrder={this.state.sortOrder}
            isEmptyMessage={`No results found for "${this.state.searchTerm}". Please check your spelling and filters.`}
          />
        </Pane>

        {/* Details Pane */}
        <Match pattern={`${pathname}/view/:userid/:username`} render={props => <ViewUser placeholder={'placeholder'} {...props} />} />
        <Layer isOpen={data.addUserMode ? data.addUserMode.mode : false} label="Add New User Dialog">
          <UserForm
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewUser}
          />
        </Layer>
      </Paneset>
    );
  }
}

export default Users;
