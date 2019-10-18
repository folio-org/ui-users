// This view component contains purely presentational code.

import React from 'react';
import PropTypes from 'prop-types';
import { matchPath } from 'react-router';

import noop from 'lodash/noop';
import get from 'lodash/get';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import { IntlConsumer, IfPermission, AppIcon } from '@folio/stripes/core';
import {
  MultiColumnList,
  SearchField,
  Paneset,
  Pane,
  Icon,
  Button,
  PaneMenu,
} from '@folio/stripes/components';

import {
  SearchAndSortQuery,
  SearchAndSortNoResultsMessage as NoResultsMessage,
  SearchAndSortSearchButton as FilterPaneToggle,
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
    idPrefix: PropTypes.string,
    onSelectRow: PropTypes.func,
    onComponentWillUnmount: PropTypes.func,
    queryGetter: PropTypes.func,
    querySetter: PropTypes.func,
    initialSearch: PropTypes.string,
    source: PropTypes.object,
    resources: PropTypes.shape({
      records: PropTypes.object,
      patronGroups: PropTypes.object,
    }).isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
    filterConfig: PropTypes.arrayOf(PropTypes.object),
  }

  static defaultProps = {
    idPrefix: 'users-',
    visibleColumns: ['status', 'name', 'barcode', 'patronGroup', 'username', 'email'],
  };

  constructor(props) {
    super(props);
    this.state = {
      filterPaneIsVisible: true,
    };

    const { formatMessage } = props.intl;
    this.overdueLoanReport = new OverdueLoanReport({
      formatMessage
    });
  }

  toggleFilterPane = () => {
    this.setState(curState => ({
      filterPaneIsVisible: !curState.filterPaneIsVisible,
    }));
  }

  getActionMenu = ({ onToggle }) => (
    <Button
      buttonStyle="dropdownItem"
      id="export-overdue-loan-report"
      onClick={() => {
        onToggle();
        this.overdueLoanReport.toCSV(get(this.props.resources, 'loans.records', []));
      }}
    >
      <FormattedMessage id="ui-users.reports.overdue.label" />
    </Button>
  );

  renderResultsFirstMenu(filters) {
    const { filterPaneIsVisible } = this.state;

    const filterCount = filters.string !== '' ? filters.string.split(',').length : 0;
    const hideOrShowMessageId = filterPaneIsVisible
      ? 'stripes-smart-components.hideSearchPane'
      : 'stripes-smart-components.showSearchPane';

    return (
      <PaneMenu>
        <FormattedMessage
          id="stripes-smart-components.numberOfFilters"
          values={{ count: filterCount }}
        >
          {appliedFiltersMessage => (
            <FormattedMessage id={hideOrShowMessageId}>
              {hideOrShowMessage => (
                <FilterPaneToggle
                  visible={filterPaneIsVisible}
                  aria-label={`${hideOrShowMessage} \n\n${appliedFiltersMessage}`}
                  onClick={this.toggleFilterPane}
                  badge={!filterPaneIsVisible && filterCount ? filterCount : undefined}
                />
              )}
            </FormattedMessage>
          )}
        </FormattedMessage>
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

  renderNewRecordBtn() {
    return (
      <IfPermission perm="users.item.post,login.item.post,perms.users.item.post">
        <PaneMenu>
          <FormattedMessage id="stripes-smart-components.addNew">
            {ariaLabel => (
              <Button
                id="clickable-newuser"
                aria-label={ariaLabel}
                to="/users/create"
                buttonStyle="primary"
                marginBottom0
              >
                <FormattedMessage id="stripes-smart-components.new" />
              </Button>
            )}
          </FormattedMessage>
        </PaneMenu>
      </IfPermission>
    );
  }

  rowUpdater = (rowData) => {
    const { resources: { patronGroups } } = this.props;
    const groupObj = patronGroups ? patronGroups.records.filter(g => g.id === rowData.patronGroup)[0] : null;
    return groupObj ? groupObj.group : null;
  }

  render() {
    const {
      filterConfig,
      onSelectRow,
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
      location,
    } = this.props;

    const users = get(resources, 'records.records', []);
    const selectedRow = (matchPath(location.pathname, { path: '/users/preview/:id' }) || {}).params;
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

    const resultsHeader = 'User Search Results';
    let resultPaneSub = <FormattedMessage id="stripes-smart-components.searchCriteria" />;
    if (source && source.loaded()) {
      resultPaneSub = <FormattedMessage id="stripes-smart-components.searchResultsCountHeader" values={{ count }} />;
    }

    const resultsFormatter = {
      status: user => (
        <AppIcon app="users" size="small" className={user.active || css.inactiveAppIcon}>
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
                        <Pane defaultWidth="22%" paneTitle="User search">
                          <form onSubmit={onSubmitSearch}>
                            <div className={css.searchGroupWrap}>
                              <SearchField
                                aria-label="user search"
                                name="query"
                                className={css.searchField}
                                onChange={getSearchHandlers().query}
                                value={searchValue.query}
                                marginBottom0
                                autoFocus
                                inputRef={this.searchField}
                                data-test-user-search-input
                              />
                              <Button
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
                              onChangeHandlers={getFilterHandlers()}
                              activeFilters={activeFilters}
                              config={filterConfig}
                            />
                          </form>
                        </Pane>
                      }
                      <Pane
                        firstMenu={this.renderResultsFirstMenu(activeFilters)}
                        lastMenu={this.renderNewRecordBtn()}
                        paneTitle={resultsHeader}
                        paneSub={resultPaneSub}
                        defaultWidth="fill"
                        actionMenu={this.getActionMenu}
                        padContent={false}
                        noOverflow
                      >
                        <MultiColumnList
                          visibleColumns={visibleColumns}
                          rowUpdater={this.rowUpdater}
                          contentData={users}
                          totalCount={count}
                          columnMapping={{
                            status: intl.formatMessage({ id: 'ui-users.active' }),
                            name: intl.formatMessage({ id: 'ui-users.information.name' }),
                            barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
                            patronGroup: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
                            username: intl.formatMessage({ id: 'ui-users.information.username' }),
                            email: intl.formatMessage({ id: 'ui-users.contact.email' }),
                          }}
                          formatter={resultsFormatter}
                          rowFormatter={this.anchoredRowFormatter}
                          onRowClick={onSelectRow}
                          onNeedMoreData={onNeedMoreData}
                          onHeaderClick={onSort}
                          sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
                          sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
                          selectedRow={selectedRow}
                          isEmptyMessage={resultsStatusMessage}
                          autosize
                          virtualize
                        />

                      </Pane>
                      { this.props.children }
                    </Paneset>
                  )}
                </IntlConsumer>
              );
            }}
        </SearchAndSortQuery>
      </div>);
  }
}

export default injectIntl(UserSearch);
