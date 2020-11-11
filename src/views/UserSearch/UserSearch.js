// This view component contains purely presentational code.

import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { matchPath } from 'react-router';

import noop from 'lodash/noop';
import get from 'lodash/get';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import { IfPermission, AppIcon, CalloutContext } from '@folio/stripes/core';
import {
  Button,
  HasCommand,
  Icon,
  MultiColumnList,
  Pane,
  PaneMenu,
  Paneset,
  SearchField,
  SRStatus,
  MenuSection,
  Checkbox
} from '@folio/stripes/components';

import {
  SearchAndSortQuery,
  SearchAndSortNoResultsMessage as NoResultsMessage,
  ExpandFilterPaneButton,
  CollapseFilterPaneButton,
} from '@folio/stripes/smart-components';

import CsvReport from '../../components/data/reports';
import Filters from './Filters';
import css from './UserSearch.css';

const VISIBLE_COLUMNS_STORAGE_KEY = 'users-visible-columns';
const TOGGLEABLE_COLUMNS = ['active', 'barcode', 'patronGroup', 'username', 'email'];

function getFullName(user) {
  const lastName = get(user, ['personal', 'lastName'], '');
  const firstName = get(user, ['personal', 'firstName'], '');
  const middleName = get(user, ['personal', 'middleName'], '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}

const rawSearchableIndexes = [
  { label: 'ui-users.index.all', value: '' },
  { label: 'ui-users.index.username', value: 'username' },
  { label: 'ui-users.index.lastName', value: 'personal.lastName' },
  { label: 'ui-users.index.barcode', value: 'barcode' },
];
let searchableIndexes;

class UserSearch extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    contentRef: PropTypes.object,
    filterConfig: PropTypes.arrayOf(PropTypes.object),
    history: PropTypes.object.isRequired,
    idPrefix: PropTypes.string,
    initialSearch: PropTypes.string,
    intl: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    onComponentWillUnmount: PropTypes.func,
    onNeedMoreData: PropTypes.func.isRequired,
    queryGetter: PropTypes.func,
    querySetter: PropTypes.func,
    resources: PropTypes.shape({
      records: PropTypes.object,
      patronGroups: PropTypes.object,
      departments: PropTypes.object,
      query: PropTypes.shape({
        qindex: PropTypes.string,
      }).isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      loans: PropTypes.object,
      resultOffset: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
      query: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    source: PropTypes.object,
  }

  static defaultProps = {
    idPrefix: 'users-',
  };

  static contextType = CalloutContext;

  constructor(props) {
    super(props);
    this.state = {
      filterPaneIsVisible: true,
      selectedId: null,
      exportInProgress: false,
      searchPending: false,
      visibleColumns: this.getInitialVisibleColumns(),
    };

    this.resultsPaneTitleRef = createRef();
    this.SRStatusRef = createRef();

    const { formatMessage } = props.intl;
    this.CsvReport = new CsvReport({
      formatMessage
    });
  }

  static getDerivedStateFromProps(props) {
    const urlParams = matchPath(props.location.pathname, { path: '/users/preview/:id' });
    return {
      selectedId: urlParams ? urlParams.params.id : null,
    };
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentDidUpdate(prevProps) {
    if (
      this.state.searchPending &&
      prevProps.resources.records &&
      prevProps.resources.records.isPending &&
      !this.props.resources.records.isPending) {
      this.onSearchComplete(this.props.resources.records);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  getColumnMapping = () => {
    const { intl } = this.props;

    return {
      active: intl.formatMessage({ id: 'ui-users.active' }),
      name: intl.formatMessage({ id: 'ui-users.information.name' }),
      barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
      patronGroup: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
      username: intl.formatMessage({ id: 'ui-users.information.username' }),
      email: intl.formatMessage({ id: 'ui-users.contact.email' }),
    };
  }

  getInitialVisibleColumns = () => {
    const stored = sessionStorage.getItem(VISIBLE_COLUMNS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : TOGGLEABLE_COLUMNS;
  }

  handleToggleColumn = ({ target: { value: key } }) => {
    this.setState(({ visibleColumns }) => ({
      visibleColumns: visibleColumns.includes(key) ? visibleColumns.filter(k => key !== k) : [...visibleColumns, key]
    }), () => {
      sessionStorage.setItem(VISIBLE_COLUMNS_STORAGE_KEY, JSON.stringify(this.state.visibleColumns));
    });
  }

  onSearchComplete = records => {
    const { intl } = this.props;
    const headerEl = this.resultsPaneTitleRef.current;
    const resultsCount = get(records, 'other.totalRecords', 0);
    const hasResults = !!resultsCount;

    this.setState({ searchPending: false });

    // Announce the results for screen readers
    this.SRStatusRef.current.sendMessage(intl.formatMessage({
      id: 'ui-users.resultCount',
    }, {
      count: resultsCount
    }));

    // Focus the pane header if we have results to minimize tabbing distance
    if (hasResults && headerEl) {
      headerEl.focus();
    }
  }

  toggleFilterPane = () => {
    this.setState(curState => ({
      filterPaneIsVisible: !curState.filterPaneIsVisible,
    }));
  }
  // now generates both overdue and claims returned reports

  generateReport = (props, type) => {
    const { exportInProgress } = this.state;

    if (exportInProgress) {
      return;
    }

    this.setState({ exportInProgress: true }, async () => {
      this.context.sendCallout({ message: <FormattedMessage id="ui-users.reports.inProgress" /> });
      let reportError = false;
      try {
        await this.CsvReport.generate(props.mutator.loans, type, this.context);
      } catch (error) {
        if (error.message === 'noItemsFound') {
          reportError = true;
          this.context.sendCallout({ type: 'error', message: <FormattedMessage id="ui-users.reports.noItemsFound" /> });
        }
      }
      if (this._mounted || reportError === true) {
        this.setState({ exportInProgress: false });
      }
    });
  }

  getActionMenu = ({ onToggle }) => {
    const { intl } = this.props;
    const { visibleColumns } = this.state;
    const columnMapping = this.getColumnMapping();

    return (
      <>
        <MenuSection label="Actions" id="actions-menu-section">
          <IfPermission perm="users.item.post,login.item.post,perms.users.item.post">
            <PaneMenu>
              <FormattedMessage id="stripes-smart-components.addNew">
                {ariaLabel => (
                  <Button
                    id="clickable-newuser"
                    aria-label={ariaLabel}
                    to={`/users/create${this.props.location.search}`}
                    buttonStyle="dropdownItem"
                    marginBottom0
                  >
                    <Icon icon="plus-sign">
                      <FormattedMessage id="stripes-smart-components.new" />
                    </Icon>
                  </Button>
                )}
              </FormattedMessage>
            </PaneMenu>
          </IfPermission>
          <IfPermission perm="ui-users.loans.view">
            <Button
              buttonStyle="dropdownItem"
              id="export-overdue-loan-report"
              onClick={() => {
                onToggle();
                this.generateReport(this.props, 'overdue');
              }}
            >
              <Icon icon="report">
                <FormattedMessage id="ui-users.reports.overdue.label" />
              </Icon>
            </Button>
          </IfPermission>
          <Button
            buttonStyle="dropdownItem"
            id="export-claimed-returned-loan-report"
            onClick={() => {
              onToggle();
              this.generateReport(this.props, 'claimedReturned');
            }}
          >
            <Icon icon="report">
              <FormattedMessage id="ui-users.reports.claimReturned.label" />
            </Icon>
          </Button>
        </MenuSection>
        <MenuSection label={intl.formatMessage({ id: 'ui-users.showColumns' })} id="columns-menu-section">
          {TOGGLEABLE_COLUMNS.map(key => (
            <Checkbox
              key={key}
              name={key}
              label={columnMapping[key]}
              id={`users-search-column-checkbox-${key}`}
              checked={visibleColumns.includes(key)}
              value={key}
              onChange={this.handleToggleColumn}
            />
          ))}
        </MenuSection>
      </>
    );
  }

  renderResultsFirstMenu(filters) {
    const { filterPaneIsVisible } = this.state;
    const filterCount = filters.string !== '' ? filters.string.split(',').length : 0;

    if (filterPaneIsVisible) {
      return null;
    }

    return (
      <PaneMenu>
        <ExpandFilterPaneButton
          filterCount={filterCount}
          onClick={this.toggleFilterPane}
        />
      </PaneMenu>
    );
  }

  getRowURL(id) {
    const {
      match: { path },
      location: { search },
    } = this.props;

    return `${path}/preview/${id}${search}`;
  }

  // custom row formatter to wrap rows in anchor tags.
  anchoredRowFormatter = (row) => {
    const {
      rowIndex,
      rowClass,
      rowData,
      cells,
      rowProps,
      labelStrings
    } = row;

    return (
      <div
        key={`row-${rowIndex}`}
      >
        <Link
          to={this.getRowURL(rowData.id)}
          data-label={labelStrings && labelStrings.join('...')}
          className={rowClass}
          {...rowProps}
        >
          {cells}
        </Link>
      </div>
    );
  };

  rowUpdater = (rowData) => {
    const { resources: { patronGroups } } = this.props;
    const groupObj = patronGroups ? patronGroups.records.filter(g => g.id === rowData.patronGroup)[0] : null;
    return groupObj ? groupObj.group : null;
  }

  goToNew = () => {
    const { history } = this.props;
    history.push('/users/create');
  }

  onChangeIndex = (e) => {
    const index = e.target.value;
    this.props.mutator.query.update({ qindex: index });
  };

  shortcuts = [
    {
      name: 'new',
      handler: this.goToNew,
    },
  ];

  isSelected = ({ item }) => item.id === this.state.selectedId;

  handleSubmit = (e, onSubmit) => {
    this.setState({
      searchPending: true,
    });

    onSubmit(e);
  }

  render() {
    const {
      onComponentWillUnmount,
      idPrefix,
      queryGetter,
      querySetter,
      initialSearch,
      source,
      onNeedMoreData,
      resources,
      contentRef,
      mutator: { resultOffset },
    } = this.props;

    const { visibleColumns } = this.state;

    if (!searchableIndexes) {
      searchableIndexes = rawSearchableIndexes.map(x => (
        { value: x.value, label: this.props.intl.formatMessage({ id: x.label }) }
      )).sort((a, b) => a.label.localeCompare(b.label));
      // searchableIndexes is sorted now, but we need to keep the default value (no explicit index) at the beginning of the array
      searchableIndexes = [
        ...searchableIndexes.filter(({ value }) => !value || value.length === 0),
        ...searchableIndexes.filter(({ value }) => value)
      ];
    }

    const users = get(resources, 'records.records', []);
    const patronGroups = (resources.patronGroups || {}).records || [];
    const query = queryGetter ? queryGetter() || {} : {};
    const count = source ? source.totalCount() : 0;
    const sortOrder = query.sort || '';
    const resultsStatusMessage = source ? (
      <div data-test-user-search-no-results-message>
        <NoResultsMessage
          source={source}
          searchTerm={query.query || ''}
          filterPaneIsVisible
          toggleFilterPane={noop}
        />
      </div>) : 'no source yet';

    let resultPaneSub = <FormattedMessage id="stripes-smart-components.searchCriteria" />;
    if (source && source.loaded()) {
      resultPaneSub = <FormattedMessage id="stripes-smart-components.searchResultsCountHeader" values={{ count }} />;
    }

    const resultsFormatter = {
      active: user => (
        <AppIcon app="users" size="small" className={user.active ? undefined : css.inactiveAppIcon}>
          {user.active ? <FormattedMessage id="ui-users.active" /> : <FormattedMessage id="ui-users.inactive" />}
        </AppIcon>
      ),
      name: user => getFullName(user),
      barcode: user => user.barcode,
      patronGroup: (user) => {
        const pg = patronGroups.filter(g => g.id === user.patronGroup)[0];
        return pg ? pg.group : '?';
      },
      username: user => user.username,
      email: user => get(user, ['personal', 'email']),
    };

    return (
      <HasCommand commands={this.shortcuts}>
        <div data-test-user-instances ref={contentRef}>
          <SearchAndSortQuery
            querySetter={querySetter}
            queryGetter={queryGetter}
            onComponentWillUnmount={onComponentWillUnmount}
            initialSearch={initialSearch}
            initialSearchState={{ query: '' }}
          >
            {
              ({
                searchValue,
                getSearchHandlers,
                onSubmitSearch,
                onSort,
                getFilterHandlers,
                activeFilters,
                filterChanged,
                searchChanged,
                resetAll,
              }) => {
                return (
                  <Paneset id={`${idPrefix}-paneset`}>
                    {this.state.filterPaneIsVisible &&
                      <Pane
                        defaultWidth="22%"
                        paneTitle={<FormattedMessage id="ui-users.userSearch" />}
                        lastMenu={
                          <PaneMenu>
                            <CollapseFilterPaneButton onClick={this.toggleFilterPane} />
                          </PaneMenu>
                        }
                      >
                        <form onSubmit={e => this.handleSubmit(e, onSubmitSearch)}>
                          <SRStatus ref={this.SRStatusRef} />
                          <div className={css.searchGroupWrap}>
                            <FormattedMessage id="ui-users.userSearch">
                              {label => (
                                <SearchField
                                  aria-label={label}
                                  autoFocus
                                  autoComplete="off"
                                  name="query"
                                  id="input-user-search"
                                  className={css.searchField}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      getSearchHandlers().query(e);
                                    } else {
                                      getSearchHandlers().reset();
                                    }
                                  }}
                                  value={searchValue.query}
                                  searchableIndexes={searchableIndexes}
                                  selectedIndex={get(resources.query, 'qindex')}
                                  onChangeIndex={this.onChangeIndex}
                                  marginBottom0
                                  data-test-user-search-input
                                />
                              )}
                            </FormattedMessage>
                            <Button
                              id="submit-user-search"
                              type="submit"
                              buttonStyle="primary"
                              fullWidth
                              marginBottom0
                              disabled={(!searchValue.query || searchValue.query === '')}
                              data-test-user-search-submit
                            >
                              Search
                            </Button>
                          </div>
                          <div className={css.resetButtonWrap}>
                            <Button
                              buttonStyle="none"
                              id="clickable-reset-all"
                              disabled={!(filterChanged || searchChanged)}
                              fullWidth
                              onClick={resetAll}
                            >
                              <Icon icon="times-circle-solid">
                                <FormattedMessage id="stripes-smart-components.resetAll" />
                              </Icon>
                            </Button>
                          </div>
                          <Filters
                            activeFilters={activeFilters.state}
                            resources={resources}
                            onChangeHandlers={getFilterHandlers()}
                            resultOffset={resultOffset}
                          />
                        </form>
                      </Pane>
                    }
                    <Pane
                      id="users-search-results-pane"
                      firstMenu={this.renderResultsFirstMenu(activeFilters)}
                      paneTitleRef={this.resultsPaneTitleRef}
                      paneTitle={<FormattedMessage id="ui-users.userSearchResults" />}
                      paneSub={resultPaneSub}
                      defaultWidth="fill"
                      actionMenu={this.getActionMenu}
                      padContent={false}
                      noOverflow
                    >
                      <MultiColumnList
                        id="list-users"
                        visibleColumns={['name', ...visibleColumns]}
                        rowUpdater={this.rowUpdater}
                        contentData={users}
                        totalCount={count}
                        columnMapping={this.getColumnMapping()}
                        formatter={resultsFormatter}
                        rowFormatter={this.anchoredRowFormatter}
                        onNeedMoreData={onNeedMoreData}
                        onHeaderClick={onSort}
                        sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
                        sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
                        isEmptyMessage={resultsStatusMessage}
                        isSelected={this.isSelected}
                        autosize
                        virtualize
                        hasMargin
                        pageAmount={100}
                        pagingType="click"
                      />

                    </Pane>
                    { this.props.children }
                  </Paneset>
                );
              }}
          </SearchAndSortQuery>
        </div>
      </HasCommand>);
  }
}

export default injectIntl(UserSearch);
