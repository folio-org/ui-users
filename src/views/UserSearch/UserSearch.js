// This view component contains purely presentational code.

import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { matchPath } from 'react-router';

import {
  assign,
  get,
  each,
  noop,
  isEmpty,
} from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';
import { IfPermission, IfInterface, AppIcon, CalloutContext } from '@folio/stripes/core';
import {
  Button,
  HasCommand,
  Icon,
  TextLink,
  MultiColumnList,
  Pane,
  PaneMenu,
  Paneset,
  SearchField,
  SRStatus,
  MenuSection,
} from '@folio/stripes/components';

import {
  SearchAndSortQuery,
  SearchAndSortNoResultsMessage as NoResultsMessage,
  ExpandFilterPaneButton,
  CollapseFilterPaneButton,
  ColumnManager,
} from '@folio/stripes/smart-components';

import RefundsReportModal from '../../components/ReportModals/RefundsReportModal';
import CashDrawerReportModal from '../../components/ReportModals/CashDrawerReportModal';
import FinancialTransactionsReportModal from '../../components/ReportModals/FinancialTransactionsReportModal';

import CsvReport from '../../components/data/reports';
import RefundsReport from '../../components/data/reports/RefundReport';
import CashDrawerReconciliationReportPDF from '../../components/data/reports/cashDrawerReconciliationReportPDF';
import CashDrawerReconciliationReportCSV from '../../components/data/reports/cashDrawerReconciliationReportCSV';
import FinancialTransactionsReport from '../../components/data/reports/FinancialTransactionsReport';
import Filters from './Filters';
import css from './UserSearch.css';

const VISIBLE_COLUMNS_STORAGE_KEY = 'users-visible-columns';
const NON_TOGGLEABLE_COLUMNS = ['name'];

function getFullName(user) {
  let firstName = user?.personal?.firstName ?? '';
  const lastName = user?.personal?.lastName ?? '';
  const middleName = user?.personal?.middleName ?? '';
  const preferredFirstName = user?.personal?.preferredFirstName ?? '';

  if (preferredFirstName && firstName) {
    firstName = `${preferredFirstName} (${firstName})`;
  }

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
    // filterConfig: PropTypes.arrayOf(PropTypes.object),
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
      owners: PropTypes.object,
      servicePointsUsers: PropTypes.object,
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
      refundsReport: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
      cashDrawerReport: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
      cashDrawerReportSources: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
      financialTransactionsReport: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    okapi: PropTypes.shape({
      currentUser: PropTypes.shape({
        servicePoints: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    source: PropTypes.object,
    stripes: PropTypes.shape({
      timezone: PropTypes.string.isRequired,
    }),
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
      showRefundsReportModal: false,
      refundExportInProgress: false,
      showCashDrawerReportModal: false,
      cashDrawerReportInProgress: false,
      showFinancialTransactionsReportModal: false,
      financialTransactionsReportInProgress: false,
    };

    this.resultsPaneTitleRef = createRef();
    this.SRStatusRef = createRef();

    const { intl } = props;
    this.CsvReport = new CsvReport({ intl });
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

    const { resources, source, history } = this.props;
    // Open the detail view when there's a single hit
    if (resources.records.records[0] !== prevProps.resources.records.records[0] &&
      source.totalCount() === 1) {
      history.push(this.getRowURL(resources.records.records[0].id));
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  changeModalState = (modal, modalState) => {
    this.setState({ [modal]: modalState });
  }

  getColumnMapping = () => {
    const { intl } = this.props;

    return {
      name: intl.formatMessage({ id: 'ui-users.information.name' }),
      active: intl.formatMessage({ id: 'ui-users.active' }),
      barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
      patronGroup: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
      username: intl.formatMessage({ id: 'ui-users.information.username' }),
      email: intl.formatMessage({ id: 'ui-users.contact.email' }),
    };
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

  getActionMenu = renderColumnsMenu => ({ onToggle }) => {
    const { intl } = this.props;

    return (
      <>
        <MenuSection
          label={intl.formatMessage({ id: 'ui-users.actions' })}
          id="actions-menu-section"
        >
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
          <IfPermission perm="ui-users.lost-items.requiring-actual-cost">
            <Button
              id="requiring-actual-cost"
              to="/users/lost-items"
              buttonStyle="dropdownItem"
            >
              <Icon icon="edit">
                <FormattedMessage id="ui-users.actionMenu.lostItems" />
              </Icon>
            </Button>
          </IfPermission>
        </MenuSection>
        <MenuSection
          label={intl.formatMessage({ id: 'ui-users.reports' })}
          id="reports-menu-section"
        >
          <IfInterface name="circulation">
            <IfPermission perm="ui-users.loans.view">
              <Button
                buttonStyle="dropdownItem"
                id="export-overdue-loan-report"
                onClick={() => {
                  onToggle();
                  this.generateReport(this.props, 'overdue');
                }}
              >
                <Icon icon="download">
                  <FormattedMessage id="ui-users.reports.overdue.label" />
                </Icon>
              </Button>
              <Button
                buttonStyle="dropdownItem"
                id="export-claimed-returned-loan-report"
                onClick={() => {
                  onToggle();
                  this.generateReport(this.props, 'claimedReturned');
                }}
              >
                <Icon icon="download">
                  <FormattedMessage id="ui-users.reports.claimReturned.label" />
                </Icon>
              </Button>
            </IfPermission>
          </IfInterface>
          <IfInterface name="feesfines">
            <IfPermission perm="ui-users.cashDrawerReport">
              <Button
                buttonStyle="dropdownItem"
                id="cash-drawer-report"
                onClick={() => {
                  onToggle();
                  this.changeModalState('showCashDrawerReportModal', true);
                }}
              >
                <Icon icon="download">
                  <FormattedMessage id="ui-users.reports.cashDrawer.label" />
                </Icon>
              </Button>
            </IfPermission>
            <IfPermission perm="ui-users.financialTransactionReport">
              <Button
                buttonStyle="dropdownItem"
                id="financial-transaction-report"
                onClick={() => {
                  onToggle();
                  this.changeModalState('showFinancialTransactionsReportModal', true);
                }}
              >
                <Icon icon="download">
                  <FormattedMessage id="ui-users.reports.financialTransaction.label" />
                </Icon>
              </Button>
            </IfPermission>
            <IfPermission perm="ui-users.manualProcessRefundsReport">
              <Button
                buttonStyle="dropdownItem"
                id="export-refunds-report"
                onClick={() => {
                  onToggle();
                  this.changeModalState('showRefundsReportModal', true);
                }}
              >
                <Icon icon="download">
                  <FormattedMessage id="ui-users.reports.refunds.label" />
                </Icon>
              </Button>
            </IfPermission>
          </IfInterface>
        </MenuSection>
        {renderColumnsMenu}
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

  handleRefundsReportFormSubmit = async ({ startDate, endDate, owners = [] }) => {
    if (this.state.refundExportInProgress) {
      return;
    }

    this.setState({
      refundExportInProgress: true,
      showRefundsReportModal: false,
    });

    const {
      mutator: {
        refundsReport,
      },
      intl: { formatMessage }
    } = this.props;

    const feeFineOwners = owners.reduce((ids, owner) => {
      ids.push(owner.value);
      return ids;
    }, []);

    const getRequestData = (refundsReportRequestData) => {
      const refundsReportRequestParameter = {};

      each(refundsReportRequestData, (val, key) => {
        if (val) {
          assign(refundsReportRequestParameter, { [key]: val });
        }
      });

      return refundsReportRequestParameter;
    };

    try {
      this.context.sendCallout({ message: <FormattedMessage id="ui-users.reports.inProgress" /> });

      const requestData = getRequestData({ startDate, endDate, feeFineOwners });
      const { reportData } = await refundsReport.POST(requestData);

      if (isEmpty(reportData)) {
        this.context.sendCallout({
          type: 'error',
          message: <FormattedMessage id="ui-users.reports.noItemsFound" />,
        });
      } else {
        const report = new RefundsReport({ data: reportData, formatMessage });

        report.toCSV();
      }
    } catch (error) {
      if (error) {
        this.context.sendCallout({
          type: 'error',
          message: <FormattedMessage id="ui-users.reports.callout.error" />,
        });
      }
    } finally {
      this.setState({ refundExportInProgress: false });
    }
  }

  handleCashDrawerReportFormSubmit = async (data) => {
    const {
      startDate,
      endDate,
      servicePoint,
      sources = [],
      format,
    } = data;

    if (this.state.cashDrawerReportInProgress) {
      return;
    }

    this.setState({
      cashDrawerReportInProgress: true,
      showCashDrawerReportModal: false,
    });

    const {
      mutator: { cashDrawerReport },
      okapi: { currentUser },
      intl,
    } = this.props;
    const reportParameters = {
      createdAt: servicePoint,
      sources: sources.map(s => s.label),
      startDate,
      endDate,
    };

    try {
      this.context.sendCallout({ message: <FormattedMessage id="ui-users.reports.inProgress" /> });
      const reportData = await cashDrawerReport.POST(reportParameters);

      if (isEmpty(reportData?.reportData)) {
        this.context.sendCallout({
          type: 'error',
          message: <FormattedMessage id="ui-users.reports.noItemsFound" />,
        });
      } else {
        const servicePoints = currentUser.servicePoints;
        const chosenServicePoint = servicePoints.find(sp => sp.id === servicePoint);
        const headerData = {
          ...reportParameters,
          createdAt: chosenServicePoint?.name ?? '',
          sources: reportParameters.sources.join(', '),
        };
        const reportParams = {
          data: reportData,
          intl,
          headerData,
        };
        const reportPDF = new CashDrawerReconciliationReportPDF(reportParams);
        const reportCSV = new CashDrawerReconciliationReportCSV(reportParams);

        switch (format) {
          case 'pdf':
            reportPDF.toPDF();
            break;
          case 'csv':
            reportCSV.toCSV();
            break;
          case 'both':
            reportPDF.toPDF();
            reportCSV.toCSV();
            break;
          default:
            reportPDF.toPDF();
        }
      }
    } catch (error) {
      if (error) {
        this.context.sendCallout({
          type: 'error',
          message: <FormattedMessage id="ui-users.reports.callout.error" />,
        });
      }
    } finally {
      this.setState({ cashDrawerReportInProgress: false });
    }
  }

  handleFinancialTransactionsReportFormSubmit = async (data) => {
    if (this.state.financialTransactionsReportInProgress) {
      return;
    }

    this.setState({
      financialTransactionsReportInProgress: true,
      showFinancialTransactionsReportModal: false,
    });

    const {
      startDate,
      endDate,
      servicePoint: servicePoints,
      feeFineOwner,
    } = data;
    const {
      resources,
      mutator: { financialTransactionsReport },
      intl,
    } = this.props;
    const reportParameters = {
      createdAt: servicePoints.map(servicePoint => servicePoint.value),
      feeFineOwner,
      startDate,
      endDate,
    };

    try {
      this.context.sendCallout({ message: <FormattedMessage id="ui-users.reports.inProgress" /> });
      const reportData = await financialTransactionsReport.POST(reportParameters);

      if (isEmpty(reportData?.reportData)) {
        this.context.sendCallout({
          type: 'error',
          message: <FormattedMessage id="ui-users.reports.noItemsFound" />,
        });
      } else {
        const selectedOwner = resources.owners.records.find(({ id }) => id === feeFineOwner);
        const headerData = {
          ...reportParameters,
          createdAt: servicePoints.map(servicePoint => servicePoint.label).join(', '),
          feeFineOwner: selectedOwner.owner,
        };
        const reportParams = {
          data: reportData,
          intl,
          headerData,
        };
        const report = new FinancialTransactionsReport(reportParams);

        report.toCSV();
      }
    } catch (error) {
      if (error) {
        this.context.sendCallout({
          type: 'error',
          message: <FormattedMessage id="ui-users.reports.callout.error" />,
        });
      }
    } finally {
      this.setState({ financialTransactionsReportInProgress: false });
    }
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
      mutator: { resultOffset, cashDrawerReportSources },
      stripes: { timezone },
      okapi: { currentUser },
      intl: { formatMessage },
    } = this.props;
    const {
      filterPaneIsVisible,
      showRefundsReportModal,
      showCashDrawerReportModal,
      showFinancialTransactionsReportModal,
    } = this.state;
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

    const columnMapping = this.getColumnMapping();
    const users = get(resources, 'records.records', []);
    const owners = resources.owners.records;
    const servicePoints = currentUser.servicePoints;
    const patronGroups = (resources.patronGroups || {}).records || [];
    const query = queryGetter ? queryGetter() || {} : {};
    const count = source ? source.totalCount() : 0;
    const sortOrder = query.sort || '';
    const initialCashDrawerReportValues = {
      format: 'both'
    };
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
      active: user => { return user.active ? <FormattedMessage id="ui-users.active" /> : <FormattedMessage id="ui-users.inactive" />; },
      name: user => (
        <>
          <AppIcon app="users" size="small" className={user.active ? undefined : css.inactiveAppIcon} />
          &nbsp;
          <TextLink to={this.getRowURL(user.id)}>{getFullName(user)}</TextLink>
        </>
      ),
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
                    {filterPaneIsVisible &&
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
                                  indexName="qindex"
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
                                  selectedIndex={searchValue.qindex}
                                  onChangeIndex={getSearchHandlers().query}
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
                    <ColumnManager
                      id={VISIBLE_COLUMNS_STORAGE_KEY}
                      columnMapping={columnMapping}
                      excludeKeys={NON_TOGGLEABLE_COLUMNS}
                    >
                      {({ renderColumnsMenu, visibleColumns }) => (
                        <Pane
                          id="users-search-results-pane"
                          firstMenu={this.renderResultsFirstMenu(activeFilters)}
                          paneTitleRef={this.resultsPaneTitleRef}
                          paneTitle={<FormattedMessage id="ui-users.userSearchResults" />}
                          paneSub={resultPaneSub}
                          defaultWidth="fill"
                          actionMenu={this.getActionMenu(renderColumnsMenu)}
                          padContent={false}
                          noOverflow
                        >
                          <MultiColumnList
                            id="list-users"
                            visibleColumns={visibleColumns}
                            rowUpdater={this.rowUpdater}
                            contentData={users}
                            totalCount={count}
                            columnMapping={columnMapping}
                            formatter={resultsFormatter}
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
                      )}
                    </ColumnManager>
                    { this.props.children }
                  </Paneset>
                );
              }}
          </SearchAndSortQuery>
          {showRefundsReportModal && (
            <RefundsReportModal
              open
              label={formatMessage({ id:'ui-users.reports.refunds.modal.label' })}
              owners={owners}
              onClose={() => { this.changeModalState('showRefundsReportModal', false); }}
              onSubmit={this.handleRefundsReportFormSubmit}
              timezone={timezone}
            />
          )}
          {showCashDrawerReportModal && (
            <CashDrawerReportModal
              open
              label={formatMessage({ id:'ui-users.reports.cash.drawer.modal.label' })}
              servicePoints={servicePoints}
              onClose={() => { this.changeModalState('showCashDrawerReportModal', false); }}
              onSubmit={this.handleCashDrawerReportFormSubmit}
              timezone={timezone}
              initialValues={initialCashDrawerReportValues}
              cashDrawerReportSources={cashDrawerReportSources}
            />
          )}
          {showFinancialTransactionsReportModal && (
            <FinancialTransactionsReportModal
              open
              label={formatMessage({ id:'ui-users.reports.financial.trans.modal.label' })}
              onClose={() => { this.changeModalState('showFinancialTransactionsReportModal', false); }}
              onSubmit={this.handleFinancialTransactionsReportFormSubmit}
              timezone={timezone}
              owners={owners}
            />
          )}
        </div>
      </HasCommand>
    );
  }
}

export default injectIntl(UserSearch);
