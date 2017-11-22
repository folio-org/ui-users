// A generalisation of the search-and-sort functionality that underlies searching-and-sorting modules

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import { withRouter } from 'react-router';
// eslint-disable-next-line import/no-unresolved
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import queryString from 'query-string';
import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Layer from '@folio/stripes-components/lib/Layer';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import SRStatus from '@folio/stripes-components/lib/SRStatus';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import Notes from '@folio/stripes-smart-components/lib/Notes';


class SearchAndSort extends React.Component {
  static contextTypes = {
    stripes: stripesShape.isRequired,
  };

  static propTypes = {
    // parameter properties provided by caller
    moduleName: PropTypes.string.isRequired, // machine-readable, for HTML ids and translation keys
    moduleTitle: PropTypes.string.isRequired, // human-readable
    objectName: PropTypes.string.isRequired, // machine-readable
    baseRoute: PropTypes.string.isRequired,
    filterConfig: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        cql: PropTypes.string.isRequired,
        values: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
              name: PropTypes.string.isRequired,
              cql: PropTypes.string.isRequired,
            }),
          ]),
        ).isRequired,
      }),
    ).isRequired,
    initialResultCount: PropTypes.number.isRequired,
    resultCountIncrement: PropTypes.number.isRequired,
    viewRecordComponent: PropTypes.func.isRequired,
    editRecordComponent: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    newRecordInitialValues: PropTypes.object.isRequired,
    visibleColumns: PropTypes.arrayOf(
      PropTypes.string,
    ),
    columnMapping: PropTypes.object,
    resultsFormatter: PropTypes.shape({}),
    onSelectRow: PropTypes.func,
    massageNewRecord: PropTypes.func,
    onCreate: PropTypes.func.isRequired,
    finishedResourceName: PropTypes.string,
    viewRecordPerms: PropTypes.string.isRequired,
    newRecordPerms: PropTypes.string.isRequired,
    disableRecordCreation: PropTypes.bool,
    parentResources: PropTypes.shape({
      query: PropTypes.shape({
        filters: PropTypes.string.isRequired,
      }),
      resultCount: PropTypes.number,
      records: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number.isRequired,
        }),
        isPending: PropTypes.bool.isPending,
        successfulMutations: PropTypes.arrayOf(
          PropTypes.shape({
            record: PropTypes.shape({
              id: PropTypes.string.isRequired,
            }).isRequired,
          }),
        ),
      }),
    }).isRequired,
    parentMutator: PropTypes.shape({
      resultCount: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
      query: PropTypes.shape({
        update: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
      }),
    }).isRequired,

    // react-route properties provided by withRouter
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
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

  constructor(props, context) {
    super(props, context);

    const queryResource = props.parentResources.query || {};

    let initiallySelected = {};
    const match = this.props.location.pathname.match('/[^/]*/view/');
    if (match && match.index === 0) {
      const id = /view\/(.*)$/.exec(this.props.location.pathname)[1];
      initiallySelected = { id };
    }

    this.state = {
      filters: { uninitialized: true },
      selectedItem: initiallySelected,
      searchTerm: queryResource.query || '',
      sortOrder: queryResource.sort || '',
      showNotesPane: queryString.parse(this.props.location.search || '').notes,
    };

    this.transitionToParams = values => this.props.parentMutator.query.update(values);
    this.commonChangeFilter = commonChangeFilter.bind(this);
    this.connectedViewRecord = context.stripes.connect(props.viewRecordComponent);
    this.connectedNotes = context.stripes.connect(Notes);
    this.SRStatus = null;

    const logger = context.stripes.logger;
    this.log = logger.log.bind(logger);
  }

  componentWillReceiveProps(nextProps) {
    const finishedResourceName = this.props.finishedResourceName || 'records';
    const recordResource = this.props.parentResources.records;
    const finishedResource = this.props.parentResources[finishedResourceName];

    // If the nominated mutation has finished, select the newly created record
    if (finishedResource) {
      const finishedResourceNextSM = nextProps.parentResources[finishedResourceName].successfulMutations;
      const sm = nextProps.parentResources.records.successfulMutations;
      if (finishedResourceNextSM.length > finishedResource.successfulMutations.length)
        this.onSelectRow(undefined, { id: sm[0].record.id });
    }

    // If a search that was pending is now complete, notify the screen-reader
    if (recordResource && recordResource.isPending && !nextProps.parentResources.records.isPending) {
      this.log('event', 'new search-result');
      const resultAmount = nextProps.parentResources.records.other.totalRecords;
      this.SRStatus.sendMessage(`Search returned ${resultAmount} result${resultAmount !== 1 ? 's' : ''}`);
    }

    if (this.state.filters.uninitialized && this.props.parentResources.query) {
      this.setState({
        filters: initialFilterState(this.props.filterConfig, this.props.parentResources.query.filters),
      });
    }
  }

  onChangeSearch = (e) => {
    const query = e.target.value;
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    this.setState({ searchTerm: query });
    this.performSearch(query);
  }

  // eslint-disable-next-line react/sort-comp
  performSearch = _.debounce((query) => {
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ search: query });
  }, 350);

  onClearSearch = () => {
    this.log('action', 'cleared search');
    // Should we need to set state? Shouldn't the state get set from the new URL?
    this.setState({
      searchTerm: '',
      sortOrder: 'Name',
      filters: { 'active.Active': true },
    });
    this.transitionToParams({
      search: '',
      sort: 'Name',
      filters: 'active.Active',
    });
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
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    this.commonChangeFilter(e);
  }

  onNeedMore = () => {
    this.props.parentMutator.resultCount.replace(this.props.parentResources.resultCount + this.props.resultCountIncrement);
  }

  onSelectRow = this.props.onSelectRow ? this.props.onSelectRow : (e, meta) => {
    this.log('action', `clicked ${meta.id}, selected record =`, meta);
    this.setState({ selectedItem: meta });
    this.transitionToParams({ _path: `${this.props.baseRoute}/view/${meta.id}` });
  }

  addNewRecord = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "add new record"');
    this.transitionToParams({ layer: 'create' });
  }

  closeNewRecord = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close new record"');
    this.transitionToParams({ layer: null });
  }

  toggleNotes = () => {
    this.setState((curState) => {
      const show = !curState.showNotesPane;
      return {
        showNotesPane: show,
      };
    });
  }

  collapseDetails = () => {
    this.setState({
      selectedItem: {},
    });
    this.transitionToParams({ _path: `${this.props.baseRoute}/view` });
  }

  updateFilters = (filters) => { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  getRowURL(id) {
    const first = this.props.location.pathname.split('/')[1];
    return `/${first}/view/${id}${this.props.location.search}`;
  }

  // custom row formatter to wrap rows in anchor tags.
  anchoredRowFormatter = (
    { rowIndex,
      rowClass,
      rowData,
      cells,
      rowProps,
      labelStrings,
    },
  ) => {
    return (
      <a
        href={this.getRowURL(rowData.id)} key={`row-${rowIndex}`}
        aria-label={labelStrings && labelStrings.join('...')}
        role="listitem"
        className={rowClass}
        {...rowProps}
      >
        {cells}
      </a>
    );
  }

  createRecord(record) {
    if (this.props.massageNewRecord) this.props.massageNewRecord(record);
    this.props.onCreate(record);
  }

  render() {
    const { parentResources, filterConfig, moduleName, newRecordPerms, viewRecordPerms, objectName } = this.props;
    const urlQuery = queryString.parse(this.props.location.search || '');
    const stripes = this.context.stripes;
    const objectNameUC = _.upperFirst(objectName);
    const records = (parentResources.records || {}).records || [];
    const resource = parentResources.records;

    /* searchHeader is a 'custom pane header' */
    const searchHeader = (<FilterPaneSearch
      searchFieldId={`input-${objectName}-search`}
      onChange={this.onChangeSearch}
      onClear={this.onClearSearch}
      resultsList={this.resultsList}
      value={this.state.searchTerm}
      placeholder={stripes.intl.formatMessage({ id: `ui-${moduleName}.search` })}
    />);

    const newRecordButton = (
      <IfPermission perm={newRecordPerms}>
        <PaneMenu>
          <Button id={`clickable-new${objectName}`} title={`Add New ${objectNameUC}`} onClick={this.addNewRecord} buttonStyle="primary paneHeaderNewButton">+ New</Button>
        </PaneMenu>
      </IfPermission>
    );

    const detailsPane = (
      stripes.hasPerm(viewRecordPerms) ?
        (<Route
          path={`${this.props.match.path}/view/:id`}
          render={props => <this.connectedViewRecord
            stripes={stripes}
            paneWidth="44%"
            parentResources={this.props.parentResources}
            parentMutator={this.props.parentMutator}
            onClose={this.collapseDetails}
            notesToggle={this.toggleNotes}
            {...props}
          />}
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
          <p>Sorry - your permissions do not allow access to this page.</p>
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
              <strong>{this.props.moduleTitle}</strong>
              <div>
                <em>{stripes.intl.formatMessage({ id: `ui-${moduleName}.resultCount` }, { count })}</em>
              </div>
            </div>
          }
          lastMenu={!this.props.disableRecordCreation ? newRecordButton : null}
          noOverflow
        >
          <MultiColumnList
            id={`list-${this.props.moduleName}`}
            contentData={records}
            selectedRow={this.state.selectedItem}
            formatter={this.props.resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            onNeedMoreData={this.onNeedMore}
            visibleColumns={this.props.visibleColumns}
            sortOrder={this.state.sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={this.state.sortOrder.startsWith('-') ? 'descending' : 'ascending'}
            isEmptyMessage={`No results found${maybeTerm}. Please check your ${maybeSpelling}filters.`}
            columnMapping={this.props.columnMapping}
            loading={resource ? resource.isPending : false}
            autosize
            virtualize
            ariaLabel={`${objectNameUC} search results`}
            rowFormatter={this.anchoredRowFormatter}
            containerRef={(ref) => { this.resultsList = ref; }}
          />
        </Pane>

        {detailsPane}
        <Layer isOpen={urlQuery.layer ? urlQuery.layer === 'create' : false} label={`Add New ${objectNameUC} Dialog`}>
          <this.props.editRecordComponent
            id={`${objectName}form-add${objectName}`}
            initialValues={this.props.newRecordInitialValues}
            onSubmit={record => this.createRecord(record)}
            onCancel={this.closeNewRecord}
            parentResources={this.props.parentResources}
            parentMutator={this.props.parentMutator}
          />
        </Layer>
        {
          this.state.showNotesPane &&
          <Route
            path={`${this.props.match.path}/view/:id`}
            render={props => <this.connectedNotes
              stripes={stripes}
              onToggle={this.toggleNotes}
              link={`${this.props.moduleName}/${props.match.params.id}`}
              {...props}
            />}
          />
          }
      </Paneset>
    );
  }
}

export default withRouter(SearchAndSort);
