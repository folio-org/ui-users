// This view component contains purely presentational code.

import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { matchPath } from 'react-router';

import noop from 'lodash/noop';
import get from 'lodash/get';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import { IntlConsumer, IfPermission, AppIcon } from '@folio/stripes/core';
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
} from '@folio/stripes/components';

import {
  SearchAndSortQuery,
  SearchAndSortNoResultsMessage as NoResultsMessage,
  ExpandFilterPaneButton,
  CollapseFilterPaneButton,
} from '@folio/stripes/smart-components';

import OverdueLoanReport from '../../components/data/reports';
import Filters from './Filters';
import css from './UserSearch.css';

function getFullName(user) {
  const lastName = get(user, ['personal', 'lastName'], '');
  const firstName = get(user, ['personal', 'firstName'], '');
  const middleName = get(user, ['personal', 'middleName'], '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}

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
    }).isRequired,
    mutator: PropTypes.shape({
      loans: PropTypes.object,
      resultOffset: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
    }).isRequired,
    source: PropTypes.object,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    idPrefix: 'users-',
    visibleColumns: ['active', 'name', 'barcode', 'patronGroup', 'username', 'email'],
  };

  constructor(props) {
    super(props);
    this.state = {
      filterPaneIsVisible: true,
      selectedId: null,
      exportInProgress: false,
      searchPending: false,
    };

    this.resultsPaneTitleRef = createRef();
    this.SRStatusRef = createRef();

    const { formatMessage } = props.intl;
    this.overdueLoanReport = new OverdueLoanReport({
      formatMessage
    });
  }

  static getDerivedStateFromProps(props) {
    const urlParams = matchPath(props.location.pathname, { path: '/users/preview/:id' });
    return {
      selectedId: urlParams ? urlParams.params.id : null,
    };
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

  generateOverdueLoanReport = props => {
    const {
      reset,
      GET,
    } = props.mutator.loans;
    const { exportInProgress } = this.state;

    if (exportInProgress) {
      return;
    }

    this.setState({ exportInProgress: true }, () => {
      reset();
      GET()
        .then(loans => this.overdueLoanReport.toCSV(loans))
        .then(() => this.setState({ exportInProgress: false }));
    });
  }

  getActionMenu = ({ onToggle }) => (
    <>
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
                <FormattedMessage id="stripes-smart-components.new" />
              </Button>
            )}
          </FormattedMessage>
        </PaneMenu>
      </IfPermission>
      <Button
        buttonStyle="dropdownItem"
        id="export-overdue-loan-report"
        onClick={() => {
          onToggle();
          this.generateOverdueLoanReport(this.props);
        }}
      >
        <FormattedMessage id="ui-users.reports.overdue.label" />
      </Button>
    </>
  );

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
      visibleColumns,
      queryGetter,
      querySetter,
      initialSearch,
      source,
      onNeedMoreData,
      resources,
      contentRef,
      mutator: { resultOffset },
    } = this.props;

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
            initialSearchState={{ qindex: '', query: '' }}
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
                  <IntlConsumer>
                    {intl => (
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
                            visibleColumns={visibleColumns}
                            rowUpdater={this.rowUpdater}
                            contentData={users}
                            totalCount={count}
                            columnMapping={{
                              active: intl.formatMessage({ id: 'ui-users.active' }),
                              name: intl.formatMessage({ id: 'ui-users.information.name' }),
                              barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
                              patronGroup: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
                              username: intl.formatMessage({ id: 'ui-users.information.username' }),
                              email: intl.formatMessage({ id: 'ui-users.contact.email' }),
                            }}
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
                    )}
                  </IntlConsumer>
                );
              }}
          </SearchAndSortQuery>
        </div>
      </HasCommand>);
  }
}

export default injectIntl(UserSearch);
