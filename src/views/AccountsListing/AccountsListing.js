import _ from 'lodash';
import React from 'react';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import {
  Button,
  ButtonGroup,
  Checkbox,
  Col,
  Icon,
  filterState,
  Pane,
  PaneHeader,
  MenuSection,
  Paneset,
  Row,
  Callout,
} from '@folio/stripes/components';
import css from './AccountsListing.css';

import { getFullName, isRefundAllowed } from '../../components/util';
import Actions from '../../components/Accounts/Actions/FeeFineActions';
import FeeFineReport from '../../components/data/reports/FeeFineReport';
import {
  calculateOwedFeeFines,
  calculateTotalPaymentAmount,
  count,
  handleFilterChange,
  handleFilterClear,
} from '../../components/Accounts/accountFunctions';

import {
  Filters,
  Menu,
  ViewFeesFines,
} from '../../components/Accounts';

import { refundClaimReturned } from '../../constants';

const filterConfig = [
  {
    label: <FormattedMessage id="ui-users.accounts.history.columns.owner" />,
    name: 'owner',
    cql: 'feeFineOwner',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.accounts.history.columns.status" />,
    name: 'status',
    cql: 'paymentStatus.name',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.details.field.feetype" />,
    name: 'type',
    cql: 'feeFineType',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.details.field.type" />,
    name: 'material',
    cql: 'materialType',
    values: [],
  },
];

const controllableColumns = [
  'metadata.createdDate',
  'metadata.updatedDate',
  'feeFineType',
  'amount',
  'remaining',
  'paymentStatus.name',
  'feeFineOwner',
  'title',
  'barcode',
  'callNumber',
  'dueDate',
  'returnedDate',
];

const possibleColumns = [
  '  ',
  'metadata.createdDate',
  'metadata.updatedDate',
  'feeFineType',
  'amount',
  'remaining',
  'paymentStatus.name',
  'feeFineOwner',
  'title',
  'barcode',
  'callNumber',
  'dueDate',
  'returnedDate',
  ' ',
];

class AccountsHistory extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      hasPerm: PropTypes.func,
    }),
    resources: PropTypes.shape({
      feefineshistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      comments: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loans: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      query: PropTypes.object,
      filter: PropTypes.object,
    }),
    okapi: PropTypes.object,
    user: PropTypes.object,
    currentUser: PropTypes.object,
    openAccounts: PropTypes.bool,
    patronGroup: PropTypes.object,
    mutator: PropTypes.shape({
      user: PropTypes.shape({
        update: PropTypes.func,
      }),
      query: PropTypes.shape({
        update: PropTypes.func,
      }),
      activeRecord: PropTypes.object,
    }),
    parentMutator: PropTypes.shape({
      query: PropTypes.object.isRequired,
    }),
    history: PropTypes.object,
    update: PropTypes.func,
    loans: PropTypes.arrayOf(PropTypes.object),
    location: PropTypes.object,
    match: PropTypes.object,
    intl: PropTypes.object.isRequired,
    num: PropTypes.number,
  };

  constructor(props) {
    super(props);

    const visibleColumns = controllableColumns.map(columnName => ({
      title: columnName,
      status: true,
    }));

    this.state = {
      exportReportInProgress: false,
      visibleColumns,
      toggleDropdownState: false,
      showFilters: false,
      selectedAccounts: [],
      selected: 0,
      actions: {
        cancellation: false,
        pay: false,
        regular: false,
        regularpayment: false,
        waive: false,
        waiveModal: false,
        waiveMany: false,
        transferModal: false,
        transferMany: false,
        transfer: false,
        refund: false,
        refundModal: false,
        refundMany: false,
      },
    };

    this.handleActivate = this.handleActivate.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    this.onChangeSelected = this.onChangeSelected.bind(this);
    this.onChangeSelectedAccounts = this.onChangeSelectedAccounts.bind(this);
    this.connectedActions = props.stripes.connect(Actions);

    this.accounts = [];
    this.addRecord = 100;
    this.editRecord = 0;

    this.transitionToParams = values => this.props.mutator.query.update(values);
    this.handleFilterChange = handleFilterChange.bind(this);
    this.handleFilterClear = handleFilterClear.bind(this);
    this.filterState = filterState.bind(this);
    this.getVisibleColumns = this.getVisibleColumns.bind(this);
    this.renderCheckboxList = this.renderCheckboxList.bind(this);
    this.toggleColumn = this.toggleColumn.bind(this);
    this.onDropdownClick = this.onDropdownClick.bind(this);

    const initialQuery = queryString.parse(props.location.search) || {};
    this.initialFilters = initialQuery.f;
    this.callout = null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const filter = this.props.resources?.filter?.records || [];
    const nextFilter = nextProps.resources?.filter?.records || [];
    const accounts = this.props.resources?.feefineshistory?.records || [];
    const loans = this.props.resources?.loans?.records || [];
    const nextLoans = nextProps.resources?.loans?.records || [];

    const nextAccounts = nextProps.resources?.feefineshistory?.records || [];
    const comments = this.props.resources?.comments?.records || [];
    const nextComments = nextProps.resources?.comments?.records || [];
    if (JSON.stringify(accounts) !== JSON.stringify(nextAccounts)) {
      let selected = 0;
      this.state.selectedAccounts.forEach(a => {
        selected += (nextAccounts.find(ac => ac.id === a.id).remaining * 100);
      });
      this.setState({ selected: selected / 100 });
    }

    // if (this.addRecord !== nextProps.num) {
    //   this.props.mutator.activeRecord.update({ records: nextProps.num, comments: nextProps.num + 150 });
    //   this.addRecord = nextProps.num;
    // }

    return this.state !== nextState ||
      filter !== nextFilter ||
      accounts !== nextAccounts ||
      loans !== nextLoans ||
      comments !== nextComments;
  }

  componentDidUpdate() {
    const {
      match: { params },
      resources
    } = this.props;

    let filterAccounts = resources?.filter?.records || [];
    filterAccounts = this.filterAccountsByStatus(filterAccounts, params.accountstatus);
    const feeFineTypes = count(filterAccounts.map(a => (a.feeFineType)));
    const feeFineOwners = count(filterAccounts.map(a => (a.feeFineOwner)));
    const paymentStatus = count(filterAccounts.map(a => (a.paymentStatus.name)));
    const itemTypes = count(filterAccounts.map(a => (a.materialType)));
    filterConfig[0].values = feeFineOwners.map(o => ({ name: `${o.name}`, cql: o.name }));
    filterConfig[1].values = paymentStatus.map(s => ({ name: `${s.name}`, cql: s.name }));
    filterConfig[2].values = feeFineTypes.map(f => ({ name: `${f.name}`, cql: f.name }));
    filterConfig[3].values = itemTypes.map(i => ({ name: `${i.name}`, cql: i.name }));
  }

  queryParam = name => {
    const query = queryString.parse(this.props.location.search) || {};
    return _.get(query, name);
  }

  onChangeActions(newActions, a) {
    this.setState(({ actions }) => ({
      actions: { ...actions, ...newActions }
    }));

    if (a) {
      this.accounts = a;
    }
  }

  handleActivate() {
    this.setState({
      selected: 0,
      selectedAccounts: [],
      actions: {
        cancellation: false,
        pay: false,
        regular: false,
        regularpayment: false,
        waive: false,
        waiveModal: false,
        waiveMany: false,
        transferModal: false,
        transferMany: false,
        transfer: false,
        refund: false,
        refundModal: false,
        refundMany: false,
      },
    });
  }

  handleEdit = (val) => {
    // this.props.handleAddRecords();
    this.editRecord = val;
  }

  onChangeSearch = (e) => {
    const query = e.target.value;
    this.transitionToParams({ q: query });
  }

  onClearSearch = () => {
    this.transitionToParams({ q: '' });
  }

  onChangeSelected(value, accounts = []) {
    this.setState({
      selected: value,
      selectedAccounts: accounts,
    });
    this.accounts = accounts;
  }

  onChangeSelectedAccounts(selectedAccounts) {
    this.setState({ selectedAccounts });
    this.accounts = selectedAccounts;
  }

  toggleFilterPane = () => {
    this.setState(prevState => ({ showFilters: !prevState.showFilters }));
  }

  renderCheckboxList(columnMapping) {
    const { visibleColumns } = this.state;
    return visibleColumns.filter((o) => Object.keys(columnMapping).includes(o.title))
      .map((column, i) => {
        const name = columnMapping[column.title];
        return (
          <li id={`column-item-${i}`} key={`columnitem-${i}`}>
            <Checkbox
              label={name}
              name={name}
              id={name}
              onChange={() => this.toggleColumn(column.title)}
              checked={column.status}
            />
          </li>
        );
      });
  }

  getVisibleColumns() {
    const { visibleColumns } = this.state;
    const visibleColumnsMap = visibleColumns.reduce((map, e) => {
      map[e.title] = e.status;
      return map;
    }, {});

    const columnsToDisplay = possibleColumns.filter((e) => visibleColumnsMap[e] === undefined || visibleColumnsMap[e] === true);
    return columnsToDisplay;
  }

  onDropdownClick() {
    this.setState(({ toggleDropdownState }) => ({
      toggleDropdownState: !toggleDropdownState
    }));
  }

  toggleColumn(title) {
    this.setState(({ visibleColumns }) => ({
      visibleColumns: visibleColumns.map(column => {
        if (column.title === title) {
          const status = column.status;
          column.status = status !== true;
        }
        return column;
      })
    }));
  }

  filterAccountsByStatus = (accounts, status = 'all') => {
    const { match: { params } } = this.props;
    if (accounts.length > 0 && params.id === accounts[0].userId) {
      if (status === 'all') return accounts;
      const res = accounts.filter(a => a.status.name.toLowerCase() === status) || [];
      return res;
    }
    return [];
  }

  generateFeesFinesReport = () => {
    const { exportReportInProgress } = this.state;

    if (exportReportInProgress) {
      return;
    }

    const {
      user,
      patronGroup: { group },
      okapi: {
        currentUser: {
          servicePoints
        }
      },
      resources: {
        comments,
        feefineshistory,
        loans,
      },
      intl,
    } = this.props;
    const feeFineActions = comments?.records || [];
    const accounts = feefineshistory?.records || [];
    const loansList = loans?.records || [];

    const reportData = {
      intl,
      data: {
        user,
        patronGroup: group,
        servicePoints,
        feeFineActions,
        accounts,
        loans: loansList
      }
    };

    this.setState({ exportReportInProgress: true }, () => {
      this.callout.sendCallout({
        type: 'success',
        message: <FormattedMessage id="ui-users.reports.inProgress" />
      });

      try {
        const report = new FeeFineReport(reportData);
        report.toCSV();
      } catch (error) {
        if (error.message) {
          this.callout.sendCallout({
            type: 'error',
            message: <FormattedMessage id="ui-users.settings.limits.callout.error" />
          });
        }
      } finally {
        this.setState({ exportReportInProgress: false });
      }
    });
  }

  getActionMenu = renderColumnsMenu => () => {
    const {
      match: { params },
      resources,
      intl,
    } = this.props;
    const selectedAccounts = this.state.selectedAccounts.map(a => this.accounts.find(ac => ac.id === a.id) || {});

    const feeFineActions = resources?.comments?.records || [];
    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');
    const canRefund = selectedAccounts.some((a) => isRefundAllowed(a, feeFineActions));

    const showActionMenu = this.props.stripes.hasPerm('ui-users.feesfines.actions.all');
    if (showActionMenu) {
      return (
        <>
          <MenuSection
            label={intl.formatMessage({ id: 'ui-users.actions' })}
            id="actions-menu-section"
          >
            <Button
              id="open-closed-all-charge-button"
              buttonStyle="dropdownItem"
              marginBottom0
              disabled={buttonDisabled}
              to={`/users/${params.id}/charge`}
            >
              <Icon icon="plus-sign">
                <FormattedMessage id="ui-users.accounts.button.new" />
              </Icon>
            </Button>
            <Button
              id="open-closed-all-pay-button"
              buttonStyle="dropdownItem"
              marginBottom0
              disabled={!((this.state.actions.regularpayment === true) && (buttonDisabled === false))}
              onClick={() => { this.onChangeActions({ regular: true }); }}
            >
              <Icon icon="cart">
                <FormattedMessage id="ui-users.accounts.history.button.pay" />
              </Icon>
            </Button>
            <Button
              id="open-closed-all-wave-button"
              marginBottom0
              disabled={!((this.state.actions.waive === true) && (buttonDisabled === false))}
              buttonStyle="dropdownItem"
              onClick={() => { this.onChangeActions({ waiveMany: true }); }}
            >
              <Icon icon="cancel">
                <FormattedMessage id="ui-users.accounts.history.button.waive" />
              </Icon>
            </Button>
            <Button
              id="open-closed-all-refund-button"
              marginBottom0
              disabled={!((this.state.actions.refund === true) && (buttonDisabled === false) && (canRefund === true))}
              buttonStyle="dropdownItem"
              onClick={() => { this.onChangeActions({ refundMany: true }); }}
            >
              <Icon icon="replace">
                <FormattedMessage id="ui-users.accounts.history.button.refund" />
              </Icon>
            </Button>
            <Button
              id="open-closed-all-transfer-button"
              marginBottom0
              disabled={!((this.state.actions.transfer === true) && (buttonDisabled === false))}
              buttonStyle="dropdownItem"
              onClick={() => { this.onChangeActions({ transferMany: true }); }}
            >
              <Icon icon="transfer">
                <FormattedMessage id="ui-users.accounts.history.button.transfer" />
              </Icon>
            </Button>
            <Button
              id="fee-fine-report-export-button"
              marginBottom0
              disabled={_.isEmpty(feeFineActions)}
              buttonStyle="dropdownItem"
              onClick={this.generateFeesFinesReport}
            >
              <Icon icon="download">
                <FormattedMessage id="ui-users.export.button" />
              </Icon>
            </Button>
          </MenuSection>
          {renderColumnsMenu}
        </>
      );
    } else {
      return null;
    }
  }

  render() {
    const {
      location,
      history,
      match: { params },
      user,
      currentUser,
      patronGroup,
      resources,
      intl,
      loans
    } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    let accounts = resources?.feefineshistory?.records || [];
    const allAccounts = accounts;
    const feeFineActions = resources?.comments?.records || [];
    let queryLoan = '';
    if (query.loan) {
      accounts = accounts.filter(a => a.loanId === query.loan);
      queryLoan = `?loan=${query.loan}`;
    }
    // const open = accounts.filter(a => a.status.name === 'Open') || [];// a.status.name
    // const closed = accounts.filter(a => a.status.name === 'Closed') || [];// a.status.name
    accounts = this.filterAccountsByStatus(accounts, params.accountstatus);
    // if (query.layer === 'open-accounts') badgeCount = open.length;
    // else if (query.layer === 'closed-accounts') badgeCount = closed.length;
    const filters = filterState(this.queryParam('f'));
    const selectedAccounts = this.state.selectedAccounts.map(a => accounts.find(ac => ac.id === a.id) || {});
    const userOwned = (user && user.id === (allAccounts[0] || {}).userId);

    const columnMapping = {
      'metadata.createdDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.created' }),
      'metadata.updatedDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.updated' }),
      'feeFineType': intl.formatMessage({ id: 'ui-users.accounts.history.columns.type' }),
      'amount': intl.formatMessage({ id: 'ui-users.accounts.history.columns.amount' }),
      'remaining': intl.formatMessage({ id: 'ui-users.accounts.history.columns.remaining' }),
      'paymentStatus.name': intl.formatMessage({ id: 'ui-users.accounts.history.columns.status' }),
      'feeFineOwner': intl.formatMessage({ id: 'ui-users.accounts.history.columns.owner' }),
      'title': intl.formatMessage({ id: 'ui-users.accounts.history.columns.title' }),
      'barcode': intl.formatMessage({ id: 'ui-users.accounts.history.columns.barcode' }),
      'callNumber': intl.formatMessage({ id: 'ui-users.accounts.history.columns.number' }),
      'dueDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.due' }),
      'returnedDate': intl.formatMessage({ id: 'ui-users.accounts.history.columns.returned' }),
    };

    const columnMenu = (
      <MenuSection
        id="sectionShowColumns"
        label={intl.formatMessage({ id: 'ui-users.showColumns' })}
      >
        <ul>
          {this.renderCheckboxList(columnMapping)}
        </ul>
      </MenuSection>
    );

    const header = (
      <Row style={{ width: '100%' }}>
        <Col className={css.buttonGroupWrap} xsOffset={4} xs={5}>
          <ButtonGroup
            fullWidth
          >
            <Button
              buttonStyle={params.accountstatus === 'open' ? 'primary' : 'default'}
              bottomMargin0
              id="open-accounts"
              to={`/users/${params.id}/accounts/open${queryLoan}`}
              replace
              onClick={this.handleActivate}
            >
              <FormattedMessage id="ui-users.accounts.open" />
            </Button>
            <Button
              buttonStyle={params.accountstatus === 'closed' ? 'primary' : 'default'}
              bottomMargin0
              id="closed-accounts"
              to={`/users/${params.id}/accounts/closed${queryLoan}`}
              replace
              onClick={this.handleActivate}
            >
              <FormattedMessage id="ui-users.accounts.closed" />
            </Button>
            <Button
              buttonStyle={params.accountstatus === 'all' ? 'primary' : 'default'}
              bottomMargin0
              id="all-accounts"
              to={`/users/${params.id}/accounts/all${queryLoan}`}
              replace
              onClick={this.handleActivate}
            >
              <FormattedMessage id="ui-users.accounts.all" />
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    );

    const selected = parseFloat(this.state.selected) || 0;

    let balance = 0;
    let balanceSuspended = 0;
    allAccounts.forEach((a) => {
      if (a.paymentStatus.name === refundClaimReturned.PAYMENT_STATUS) {
        balanceSuspended += (parseFloat(a.remaining) * 100);
      } else {
        balance += (parseFloat(a.remaining) * 100);
      }
    });
    balance /= 100;
    balanceSuspended /= 100;


    const totalPaidAmount = calculateTotalPaymentAmount(resources?.feefineshistory?.records, feeFineActions);
    const uncheckedAccounts = _.differenceWith(
      resources?.feefineshistory?.records || [],
      this.accounts || this.state.selectedAccounts,
      (account, selectedAccount) => (account.id === selectedAccount.id)
    );

    const owedAmount = calculateOwedFeeFines(uncheckedAccounts);

    const outstandingBalance = userOwned
      ? parseFloat(balance || 0).toFixed(2)
      : '0.00';

    const suspendedBalance = userOwned
      ? parseFloat(balanceSuspended || 0).toFixed(2)
      : '0.00';

    const visibleColumns = this.getVisibleColumns();

    return (
      <Paneset>
        <Pane
          id="pane-account-listing"
          defaultWidth="100%"
          dismissible
          padContent={false}
          onClose={() => { history.push(`/users/preview/${params.id}`); }}
          paneTitle={(
            <FormattedMessage id="ui-users.accounts.title.feeFine">
              {(title) => (
                `${title} - ${getFullName(user)} ${patronGroup ? '(' + _.upperFirst(patronGroup.group) + ')' : ''}`
              )}
            </FormattedMessage>
          )}
          paneSub={(
            <div id="outstanding-balance">
              <FormattedMessage
                id="ui-users.accounts.outstanding.total"
                values={{ amount: outstandingBalance }}
              />
              &nbsp;|&nbsp;
              <FormattedMessage
                id="ui-users.accounts.suspended.total"
                values={{ amount: suspendedBalance }}
              />
            </div>
          )}
          actionMenu={this.getActionMenu(columnMenu)}
        >
          <Paneset>
            <Filters
              query={query}
              mutator={this.props.mutator}
              toggle={this.toggleFilterPane}
              showFilters={this.state.showFilters}
              onChangeSearch={this.onChangeSearch}
              onClearFilters={this.handleFilterClear}
              onClearSearch={this.onClearSearch}
              filterConfig={filterConfig}
              filters={filters}
              onChangeFilter={(e) => { this.handleFilterChange(e, 'f'); }}
            />
            <section className={css.pane}>
              <PaneHeader id="search-filter-paneheader" header={header} />
              <Menu
                {...this.props}
                user={user}
                showFilters={this.state.showFilters}
                filters={filters}
                selected={selected}
                selectedAccounts={selectedAccounts}
                feeFineActions={feeFineActions}
                accounts={accounts}
                actions={this.state.actions}
                query={query}
                onChangeActions={this.onChangeActions}
                patronGroup={patronGroup}
                handleOptionsChange={this.handleOptionsChange}
              />
              <div className={css.paneContent}>
                {params.accountstatus === 'open' &&
                  (<ViewFeesFines
                    {...this.props}
                    loans={loans}
                    accounts={this.filterAccountsByStatus(accounts, 'open')}
                    feeFineActions={feeFineActions}
                    visibleColumns={visibleColumns}
                    selectedAccounts={selectedAccounts}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />)
                }
                {params.accountstatus === 'closed' &&
                  (<ViewFeesFines
                    {...this.props}
                    loans={loans}
                    accounts={this.filterAccountsByStatus(accounts, 'closed')}
                    visibleColumns={visibleColumns}
                    feeFineActions={feeFineActions}
                    selectedAccounts={selectedAccounts}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />)
                }
                {params.accountstatus === 'all' &&
                  (<ViewFeesFines
                    {...this.props}
                    loans={loans}
                    accounts={userOwned ? accounts : []}
                    feeFineActions={feeFineActions}
                    visibleColumns={visibleColumns}
                    selectedAccounts={selectedAccounts}
                    onChangeSelected={this.onChangeSelected}
                    onChangeActions={this.onChangeActions}
                  />)
                }
              </div>
              <this.connectedActions
                actions={this.state.actions}
                layer={query.layer}
                onChangeActions={this.onChangeActions}
                user={user}
                currentUser={currentUser}
                accounts={this.accounts}
                feeFineActions={feeFineActions}
                selectedAccounts={selectedAccounts}
                totalPaidAmount={totalPaidAmount}
                owedAmount={owedAmount}
                onChangeSelectedAccounts={this.onChangeSelectedAccounts}
                balance={balance}
                handleEdit={this.handleEdit}
              />
              <Callout ref={(ref) => { this.callout = ref; }} />
            </section>
          </Paneset>
        </Pane>
      </Paneset>
    );
  }
}

export default injectIntl(AccountsHistory);
