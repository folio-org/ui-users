// A generalisation of the search-and-sort functionality that
// underlies ui-users, ui-items, etc.

import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import { withRouter } from 'react-router'
import queryString from 'query-string';
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Layer from '@folio/stripes-components/lib/Layer';
import SRStatus from '@folio/stripes-components/lib/SRStatus';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import UserForm from '../../UserForm'; // XXX relocate this
import ViewUser from '../../ViewUser'; // XXX relocate this
import contactTypes from '../../data/contactTypes';
import { getFullName } from '../../util';


const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;


class SearchAndSort extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    parentResources: PropTypes.shape({
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
    }).isRequired,
    resources: PropTypes.shape({
      notes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
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

    const urlQuery = this.props.urlQuery;

    let initiallySelected = {};
    if (/users\/view/.test(this.props.path)) {
      const id = /view\/(.*)$/.exec(this.props.path)[1];
      initiallySelected = { id };
    }

    this.state = {
      filters: initialFilterState(this.props.filterConfig, urlQuery.filters),
      selectedItem: initiallySelected,
      searchTerm: urlQuery.query || '',
      sortOrder: urlQuery.sort || '',
      showNotesPane: false,
    };

    this.transitionToParams = transitionToParams.bind(this);
    this.commonChangeFilter = commonChangeFilter.bind(this);
    this.connectedViewUser = props.stripes.connect(ViewUser);
    this.SRStatus = null;
    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);
  }

  componentWillReceiveProps(nextProps) {
    const resource = this.props.parentResources.users;
    if (resource) {
      const sm = nextProps.parentResources.users.successfulMutations;
      if (sm.length > resource.successfulMutations.length)
        this.onSelectRow(undefined, { id: sm[0].record.id, username: sm[0].record.username });
    }

    if (resource && resource.isPending && !nextProps.parentResources.users.isPending) {
      this.log('event', 'new search-result');
      const resultAmount = nextProps.parentResources.users.other.totalRecords;
      this.SRStatus.sendMessage(`Search returned ${resultAmount} result${resultAmount !== 1 ? 's' : ''}`);
    }
  }

  onChangeSearch = (e) => {
    const query = e.target.value;
    this.props.parentMutator.userCount.replace(INITIAL_RESULT_COUNT);
    this.setState({ searchTerm: query });
    this.performSearch(query);
  }

  performSearch = _.debounce((query) => {
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }, 350);

  onClearSearch = () => {
    const path = this.props.initialPath
    this.setState({
      searchTerm: '',
      sortOrder: 'Name',
      filters: { 'active.Active': true },
    });
    this.log('action', `cleared search: navigating to ${path}`);
    this.props.history.push(path);
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
    this.transitionToParams({ sort: sortOrder });
  }

  onChangeFilter = (e) => {
    this.props.parentMutator.userCount.replace(INITIAL_RESULT_COUNT);
    this.commonChangeFilter(e);
  }

  onNeedMore = () => {
    this.props.parentMutator.userCount.replace(this.props.parentResources.userCount + RESULT_COUNT_INCREMENT);
  }

  onSelectRow = this.props.onSelectRow ? this.props.onSelectRow : (e, meta) => {
    const userId = meta.id;
    this.log('action', `clicked ${userId}, selected user =`, meta);
    this.setState({ selectedItem: meta });
    this.props.history.push(`/users/view/${userId}${this.props.location.search}`);
  }

  updateFilters = (filters) => { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  render() {
    const { parentResources, stripes, urlQuery, filterConfig } = this.props;
    const users = (parentResources.users || {}).records || [];
    const patronGroups = (parentResources.patronGroups || {}).records || [];
    const addressTypes = (parentResources.addressTypes || {}).records || [];
    const resource = parentResources.users;

    /* searchHeader is a 'custom pane header' */
    const searchHeader = <FilterPaneSearch
      searchFieldId="input-user-search"
      onChange={this.onChangeSearch}
      onClear={this.onClearSearch}
      resultsList={this.resultsList}
      value={this.state.searchTerm}
      placeholder={stripes.intl.formatMessage({ id: 'ui-users.search' })} />;

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
          noOverflow
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
            visibleColumns={['Status', 'Name', 'Barcode', 'Patron Group', 'Username', 'Email']}
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
        <Layer isOpen={urlQuery.layer ? urlQuery.layer === 'create' : false} label="Add New User Dialog">
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
              usersResource={this.props.parentResources.users}
              {...props}
            />}
          />
          }
      </Paneset>
    );
  }
}

export default withRouter(SearchAndSort);
