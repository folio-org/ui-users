import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import queryString from 'query-string';
import fetch from 'isomorphic-fetch';

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import Layer from '@folio/stripes-components/lib/Layer';
import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter, filters2cql } from '@folio/stripes-components/lib/FilterGroups';
import SRStatus from '@folio/stripes-components/lib/SRStatus';

import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import Notes from '@folio/util-notes/lib/Notes';
import { SubmissionError } from 'redux-form';
import uuid from 'uuid';

import UserForm from './UserForm';
import ViewUser from './ViewUser';

import removeQueryParam from './removeQueryParam';
import contactTypes from './data/contactTypes';
import { toUserAddresses } from './converters/address';
import packageInfo from './package';

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
    query: {
      initialValue: {
        search: "",
        filters: "active.Active",
        sort: "Name"
      },
    },
    users: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{userCount}',
      perRequest: RESULT_COUNT_INCREMENT,
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
            }

            let cql = `(username="${resourceData.query.search}*" or personal.firstName="${resourceData.query.search}*" or personal.lastName="${resourceData.query.search}*" or personal.email="${resourceData.query.search}*" or barcode="${resourceData.query.search}*" or id="${resourceData.query.search}*" or externalSystemId="${resourceData.query.search}*")`;

            const filterCql = filters2cql(filterConfig, resourceData.query.filters);
            if (filterCql) {
              if (cql) {
                cql = `(${cql}) and ${filterCql}`;
              } else {
                cql = filterCql;
              }
            }

            let { sort } = resourceData.query;
            if (sort) {
              const sortIndexes = sort.split(',').map((sort1) => {
                let reverse = false;
                if (sort1.startsWith('-')) {
                  sort1 = sort1.substr(1);
                  reverse = true;
                }
                let sortIndex = sortMap[sort1] || sort1;
                if (reverse) {
                  sortIndex = sortIndex.replace(' ', '/sort.descending ') + '/sort.descending';
                }
                return sortIndex;
              });
        
              cql += ` sortby ${sortIndexes.join(' ')}`;
            }
            return cql;
          },
        },
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
    notes: {
      type: 'okapi',
      path: 'notes',
      records: 'notes',
      clear: false,
      GET: {
        params: {
          query: 'link=:{id}',
        },
      },
    },
  });

  constructor(props) {
    super(props);

    const query = props.location.search ? queryString.parse(props.location.search) : {};

    let initiallySelected = {};
    if (/users\/view/.test(this.props.location.pathname)) {
      const id = /view\/(.*)$/.exec(this.props.location.pathname)[1];
      initiallySelected = { id };
    }

    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: initiallySelected,
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
      showNotesPane: false,
    };

    this.okapi = props.okapi;

    this.commonChangeFilter = commonChangeFilter.bind(this);
    this.transitionToParams = transitionToParams.bind(this);
    this.connectedViewUser = props.stripes.connect(ViewUser);
    this.connectedNotes = props.stripes.connect(Notes);

    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);

    this.anchoredRowFormatter = this.anchoredRowFormatter.bind(this);

    this.resultsList = null;
    this.SRStatus = null;

    this.toggleNotes = this.toggleNotes.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const resource = this.props.resources.users;
    if (resource) {
      const sm = nextProps.resources.users.successfulMutations;
      if (sm.length > resource.successfulMutations.length)
        this.onSelectRow(undefined, { id: sm[0].record.id, username: sm[0].record.username });
    }

    if (resource && resource.isPending && !nextProps.resources.users.isPending) {
      this.log('event', 'new search-result');
      const resultAmount = nextProps.resources.users.other.totalRecords;
      this.SRStatus.sendMessage(`Search returned ${resultAmount} result${resultAmount !== 1 ? 's' : ''}`);
    }
  }

  componentWillUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];

    if (pg && pg.length) {
      filterConfig[1].values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
    }
  }

  onClearSearch = () => {
    const path = (_.get(packageInfo, ['stripes', 'home']) ||
                  _.get(packageInfo, ['stripes', 'route']));
    this.setState({
      searchTerm: '',
      sortOrder: 'Name',
      filters: { 'active.Active': true },
    });
    this.log('action', `cleared search: navigating to ${path}`);
    this.props.mutator.query.update({search: ""});
  }

  onSort = (e, meta) => {
    const newOrder = meta.alias;
    const oldOrder = this.state.sortOrder || '';

    const orders = oldOrder ? oldOrder.split(',') : [];
    if (orders[0] && newOrder === orders[0].replace(/^-/, '')) {
      orders[0] = `-${orders[0]}`.replace(/^--/, '');
    } else {
      orders.unshift(newOrder);
    }

    const sortOrder = orders.slice(0, 2).join(',');
    this.log('action', `sorted by ${sortOrder}`);
    this.setState({ sortOrder });
    const queryCopy = Object.assign({}, this.props.resources.query);
    queryCopy.sort = sortOrder;
    this.props.mutator.query.replace(queryCopy);
  }

  onSelectRow = this.props.onSelectRow ? this.props.onSelectRow : (e, meta) => {
    const userId = meta.id;
    this.log('action', `clicked ${userId}, selected user =`, meta);
    this.setState({ selectedItem: meta });
    this.props.history.push(`/users/view/${userId}${this.props.location.search}`);
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
    this.props.mutator.userCount.replace(this.props.resources.userCount + RESULT_COUNT_INCREMENT);
  }

  getRowURL(rowData) {
    return `/users/view/${rowData.id}${this.props.location.search}`;
  }

  performSearch = _.debounce((query) => {
    this.log('action', `searched for '${query}'`);
    this.props.mutator.query.update({search: query});
  }, 350);

  updateFilters = (filters) => { // provided for onChangeFilter
    const queryCopy = Object.assign({}, this.props.resources.query);
    queryCopy.filters = Object.keys(filters).filter(key => filters[key]).join(',');
    this.props.mutator.query.replace(queryCopy);
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
    const { resources, stripes, location } = this.props;
    const users = (resources.users || {}).records || [];
    const patronGroups = (resources.patronGroups || {}).records || [];
    const addressTypes = (resources.addressTypes || {}).records || [];
    const resource = resources.users;
    const query = location.search ? queryString.parse(location.search) : {};

    /* searchHeader is a 'custom pane header' */
    const searchHeader = <FilterPaneSearch searchFieldId="input-user-search" onChange={this.onChangeSearch} onClear={this.onClearSearch} resultsList={this.resultsList} value={this.state.searchTerm} placeholder={stripes.intl.formatMessage({ id: 'ui-users.search' })} />;

    const newUserButton = (
      <IfPermission perm="users.item.post">
        <IfPermission perm="login.item.post">
          <IfPermission perm="perms.users.item.post">
            <PaneMenu>
              <Button id="clickable-newuser" title="Add New User" onClick={this.onClickAddNewUser} buttonStyle="primary paneHeaderNewButton">+ New</Button>
            </PaneMenu>
          </IfPermission>
        </IfPermission>
      </IfPermission>
    );

    const resultsFormatter = {
      Active: user => user.active,
      Name: user => `${_.get(user, ['personal', 'lastName'], '')}, ${_.get(user, ['personal', 'firstName'], '')}`,
      Barcode: user => user.barcode,
      'Patron Group': (user) => {
        const pg = patronGroups.filter(g => g.id === user.patronGroup)[0];
        return pg ? pg.group : '?';
      },
      Username: user => user.username,
      Email: user => _.get(user, ['personal', 'email']),
    };

    const detailsPane = (
      stripes.hasPerm('users.item.get') ?
        (<Route
          path={`${this.props.match.path}/view/:userid`}
          render={props => <this.connectedViewUser stripes={stripes} okapi={this.okapi} paneWidth="44%" onClose={this.collapseDetails} addressTypes={addressTypes} notesToggle={this.toggleNotes} {...props} />}
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

    const maybeTerm = this.state.searchTerm ? ` for "${this.state.searchTerm}"` : '';
    const maybeSpelling = this.state.searchTerm ? 'spelling and ' : '';
    const count = resource && resource.hasLoaded ? resource.other.totalRecords : '';
    return (
      <Paneset>
        <SRStatus ref={(ref) => { this.SRStatus = ref; }} />
        {/* Filter Pane */}
        <Pane id="pane-filter" defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
        </Pane>
        {/* Results Pane */}
        <Pane
          id="pane-results"
          defaultWidth="fill"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Users</strong>
              <div>
                <em>{stripes.intl.formatMessage({ id: 'ui-users.resultCount' }, { count })}</em>
              </div>
            </div>
          }
          lastMenu={!this.props.disableUserCreation ? newUserButton : null}
        >
          <MultiColumnList
            id="list-users"
            contentData={users}
            selectedRow={this.state.selectedItem}
            rowMetadata={['id', 'username']}
            formatter={resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            onNeedMoreData={this.onNeedMore}
            visibleColumns={['Active', 'Name', 'Barcode', 'Patron Group', 'Username', 'Email']}
            sortOrder={this.state.sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={this.state.sortOrder.startsWith('-') ? 'descending' : 'ascending'}
            isEmptyMessage={`No results found${maybeTerm}. Please check your ${maybeSpelling}filters.`}
            columnMapping={{ Username: 'username' }}
            loading={resource ? resource.isPending : false}
            autosize
            virtualize
            ariaLabel={'User search results'}
            rowFormatter={this.anchoredRowFormatter}
            containerRef={(ref) => { this.resultsList = ref; }}
          />
        </Pane>

        {detailsPane}
        <Layer isOpen={query.layer ? query.layer === 'create' : false} label="Add New User Dialog">
          <UserForm
            id="userform-adduser"
            initialValues={{ active: true, personal: { preferredContactTypeId: '002' } }}
            addressTypes={addressTypes}
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewUser}
            okapi={this.okapi}
            optionLists={{ patronGroups, contactTypes }}
          />
        </Layer>
        {
          this.state.showNotesPane &&
          <Route
            path={`${this.props.match.path}/view/:id`}
            render={props => <this.connectedNotes
              stripes={stripes}
              okapi={this.okapi}
              onToggle={this.toggleNotes}
              link={`users/${props.match.params.id}`}
              notesResource={this.props.resources.notes}
              usersResource={this.props.resources.users}
              {...props}
            />}
          />
          }
      </Paneset>
    );
  }
}

export default Users;
