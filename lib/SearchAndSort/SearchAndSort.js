// A generalisation of the search-and-sort functionality that underlies searching-and-sorting modules

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import { withRouter } from 'react-router';
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
import Notes from '@folio/stripes-smart-components/lib/Notes';
import removeQueryParam from '../../removeQueryParam';
import contactTypes from '../../data/contactTypes';


class SearchAndSort extends React.Component {
  static contextTypes = {
    stripes: stripesShape.isRequired,
  };

  static propTypes = {
    visibleColumns: PropTypes.arrayOf(
      PropTypes.string,
    ),
    columnMapping: PropTypes.object,
    viewRecordPerms: PropTypes.string.isRequired,
    newRecordPerms: PropTypes.string.isRequired,
    resultsFormatter: PropTypes.shape({}),
    moduleName: PropTypes.string.isRequired, // machine-readable, for HTML ids and translation keys
    moduleTitle: PropTypes.string.isRequired, // human-readable
    objectName: PropTypes.string.isRequired, // machine-readable
    viewRecordComponent: PropTypes.func.isRequired,
    editRecordComponent: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    urlQuery: PropTypes.object.isRequired,
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
    parentResources: PropTypes.shape({
      resultCount: PropTypes.number,
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
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
      perms: PropTypes.shape({
        successfulMutations: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    parentMutator: PropTypes.shape({
      resultCount: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }).isRequired,
    initialPath: PropTypes.string.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    okapi: PropTypes.shape({}).isRequired,
    onSelectRow: PropTypes.func,
    onCreate: PropTypes.func.isRequired,
    disableRecordCreation: PropTypes.bool,
    initialResultCount: PropTypes.number.isRequired,
    resultCountIncrement: PropTypes.number.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    const urlQuery = this.props.urlQuery;

    let initiallySelected = {};
    const match = this.props.location.pathname.match('/[^/]*/view/');
    if (match && match.index === 0) {
      const id = /view\/(.*)$/.exec(this.props.location.pathname)[1];
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
    this.toggleNotes = this.toggleNotes.bind(this);
    this.anchoredRowFormatter = this.anchoredRowFormatter.bind(this);

    this.connectedViewRecord = context.stripes.connect(props.viewRecordComponent);
    this.connectedNotes = context.stripes.connect(Notes);
    this.SRStatus = null;
    const logger = context.stripes.logger;
    this.log = logger.log.bind(logger);
  }

  componentWillReceiveProps(nextProps) {
    const resource = this.props.parentResources.records;
    const perms = this.props.parentResources.perms;

    if (perms) {
      const permSm = nextProps.parentResources.perms.successfulMutations;
      const sm = nextProps.parentResources.records.successfulMutations;
      if (permSm.length > perms.successfulMutations.length)
        this.onSelectRow(undefined, { id: sm[0].record.id });
    }

    if (resource && resource.isPending && !nextProps.parentResources.records.isPending) {
      this.log('event', 'new search-result');
      const resultAmount = nextProps.parentResources.records.other.totalRecords;
      this.SRStatus.sendMessage(`Search returned ${resultAmount} result${resultAmount !== 1 ? 's' : ''}`);
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
    this.transitionToParams({ query });
  }, 350);

  onClearSearch = () => {
    const path = this.props.initialPath;
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
    this.props.parentMutator.resultCount.replace(this.props.initialResultCount);
    this.commonChangeFilter(e);
  }

  onNeedMore = () => {
    this.props.parentMutator.resultCount.replace(this.props.parentResources.resultCount + this.props.resultCountIncrement);
  }

  onSelectRow = this.props.onSelectRow ? this.props.onSelectRow : (e, meta) => {
    this.log('action', `clicked ${meta.id}, selected record =`, meta);
    this.setState({ selectedItem: meta });
    this.props.history.push(this.getRowURL(meta.id));
  }

  addNewRecord = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "add new record"');
    this.transitionToParams({ layer: 'create' });
  }

  closeNewRecord = (e) => {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close new record"');
    removeQueryParam('layer', this.props.location, this.props.history);
  }

  toggleNotes() {
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
    this.props.history.push(`${this.props.match.path}${this.props.location.search}`);
  }

  updateFilters = (filters) => { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  getRowURL(id) {
    const first = this.props.location.pathname.split('/')[1];
    return `/${first}/view/${id}${this.props.location.search}`;
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


  render() {
    const { parentResources, urlQuery, filterConfig, moduleName, newRecordPerms, viewRecordPerms, objectName } = this.props;
    const stripes = this.context.stripes;
    const objectNameUC = _.upperFirst(objectName);
    const records = (parentResources.records || {}).records || [];
    const patronGroups = (parentResources.patronGroups || {}).records || [];
    const addressTypes = (parentResources.addressTypes || {}).records || [];
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
          render={props => <this.connectedViewRecord stripes={stripes} okapi={this.okapi} paneWidth="44%" onClose={this.collapseDetails} addressTypes={addressTypes} notesToggle={this.toggleNotes} {...props} />}
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
            initialValues={{ active: true, personal: { preferredContactTypeId: '002' } }}
            addressTypes={addressTypes}
            onSubmit={(record) => { this.props.onCreate(record); }}
            onCancel={this.closeNewRecord}
            okapi={this.props.okapi}
            optionLists={{ patronGroups, contactTypes }}
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
