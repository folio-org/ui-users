import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { Callout } from '@folio/stripes/components';
import { MultiColumnList } from '@folio/stripes/components';
import { Popover } from '@folio/stripes/components';
import { Checkbox } from '@folio/stripes/components';
import { Button } from '@folio/stripes/components';
import { IconButton } from '@folio/stripes/components';
import { UncontrolledDropdown, Dropdown } from '@folio/stripes/components';
import { MenuItem } from '@folio/stripes/components';
import { DropdownMenu } from '@folio/stripes/components';
import ExportCsv from '@folio/stripes-components/lib/ExportCsv';
import { ChangeDueDateDialog } from '@folio/stripes/smart-components';
import BulkRenewalDialog from '../../BulkRenewalDialog';
import Label from '../../Label';
import css from './OpenLoans.css';
import ActionsBar from '../components/ActionsBar';

import withRenew from '../../../withRenew';

class OpenLoans extends React.Component {
  static manifest = Object.freeze({
    query: {},
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
      accumulate: 'true',
      fetch: false,
    },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      resourceShouldRefresh: true,
      records: 'requests',
      accumulate: 'true',
      fetch: false,
    },
    loanAccount: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=userId=%{activeRecord.user}&limit=100',
    },
    activeRecord: {},
  });

  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
      formatDate: PropTypes.func.isRequired,
      formatDateTime: PropTypes.func.isRequired,
    }),
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
    onClickViewOpenAccounts: PropTypes.func.isRequired,
    onClickViewClosedAccounts: PropTypes.func.isRequired,
    onClickViewAllAccounts: PropTypes.func.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    renew: PropTypes.func,
    mutator: PropTypes.shape({
      query: PropTypes.object.isRequired,
      activeRecord: PropTypes.object,
      loanPolicies: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      requests: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }),
    resources: PropTypes.shape({
      query: PropTypes.object,
    }),
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    onClickViewChargeFeeFine: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.onRowClick = this.onRowClick.bind(this);
    this.onSort = this.onSort.bind(this);
    this.getLoansFormatter = this.getLoansFormatter.bind(this);
    this.getOpenRequestsCount = this.getOpenRequestsCount.bind(this);
    this.toggleItem = this.toggleItem.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.getVisibleColumns = this.getVisibleColumns.bind(this);
    this.renderCheckboxList = this.renderCheckboxList.bind(this);
    this.toggleColumn = this.toggleColumn.bind(this);
    this.onDropdownClick = this.onDropdownClick.bind(this);
    this.renewSelected = this.renewSelected.bind(this);
    this.formatDate = this.props.stripes.formatDate;
    this.formatDateTime = this.props.stripes.formatDateTime;
    this.showChangeDueDateDialog = this.showChangeDueDateDialog.bind(this);
    this.hideChangeDueDateDialog = this.hideChangeDueDateDialog.bind(this);
    this.showBulkRenewalDialog = this.showBulkRenewalDialog.bind(this);
    this.hideBulkRenewalDialog = this.hideBulkRenewalDialog.bind(this);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.fetchLoanPolicyNames = this.fetchLoanPolicyNames.bind(this);
    this.callout = null;
    this.getFeeFine = this.getFeeFine.bind(this);

    const { stripes } = props;

    this.connectedChangeDueDateDialog = stripes.connect(ChangeDueDateDialog);
    this.connectedBulkRenewalDialog = stripes.connect(BulkRenewalDialog);

    // List of all possible columns that can be displayed
    this.possibleColumns = ['  ', 'title', 'itemStatus', 'dueDate', 'requests', 'barcode', 'Fee/Fine', 'Call number',
      'Contributors', 'renewals', 'loanPolicy', 'location', 'loanDate', ' '];

    // list of columns that can be shown/hidden, excludes ellipsis and checkboxes column
    this.controllableColumns = ['title', 'itemStatus', 'dueDate', 'requests', 'barcode', 'Fee/Fine', 'Call number',
      'Contributors', 'renewals', 'loanPolicy', 'location', 'loanDate'];
    // Object with title as key and checked/uncheked as status, initially all are checked
    const visibleColumns = this.controllableColumns.map(columnName => ({
      title: columnName,
      status: true,
    }));


    this.sortMap = {
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' })]: loan => _.get(loan, ['item', 'title']),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.barcode' })]: loan => _.get(loan, ['item', 'barcode']),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.feefine' })]: loan => this.getFeeFine(loan),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' })]: loan => _.get(loan, ['item', 'status', 'name'], ''),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' })]: loan => loan.loanDate,
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.callNumber' })]: loan => _.get(loan, ['item', 'callNumber']),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.contributors' })]: loan => {
        const contributorsList = this.getContributorslist(loan);
        const contributorsListString = contributorsList.join(' ');
        return contributorsListString;
      },
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' })]: loan => loan.dueDate,
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.renewals' })]: loan => loan.renewalCount,
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.requests' })]: (loan) => this.state.requestCounts[loan.itemId] || 0,
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' })]: loan => this.state.loanPolicies[loan.loanPolicyId],
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.location' })]: loan => _.get(loan, ['item', 'location', 'name'], ''),
    };

    this.state = {
      checkedLoans: {},
      allChecked: false,
      loanPolicies: {},
      requestCounts: {},
      toggleDropdownState: false,
      sortOrder: [
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.details.requests' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.barcode' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.feefine' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.details.callNumber' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.contributors' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.renewals' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.details.location' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' }),
      ],
      sortDirection: ['asc', 'asc'],
      activeLoan: undefined,
      loans: [],
      changeDueDateDialogOpen: false,
      bulkRenewalDialogOpen: false,
      renewFailure: [],
      renewSuccess: [],
      visibleColumns,
      errorMsg: {},
    };
    props.mutator.activeRecord.update({ user: props.user.id });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { loans } = nextProps;
    if (prevState.loans.length < nextProps.loans.length) {
      return { loans };
    }
    return null;
  }

  componentDidMount() {
    if (this.state.loans.length > 0) {
      this.fetchLoanPolicyNames();
      this.getOpenRequestsCount();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.loans.length > prevState.loans.length) {
      this.fetchLoanPolicyNames();
      this.getOpenRequestsCount();
    }
  }

  onRowClick(e, row) {
    if (e.target.type !== 'button') {
      this.props.onClickViewLoanActionsHistory(e, row);
    }
  }

  onSort(e, meta) {
    if (!this.sortMap[meta.alias]) return;

    let { sortOrder, sortDirection } = this.state;
    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[0]];
      sortDirection = ['asc', sortDirection[0]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }
    this.setState({ sortOrder, sortDirection });
  }

  getFeeFine(loan) {
    const accounts = _.get(this.props.resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    let remaining = 0;
    accountsLoan.forEach(a => {
      remaining += parseFloat(a.remaining);
    });
    return (remaining === 0) ? '-' : remaining.toFixed(2);
  }

  getContributorslist(loan) {
    this.loan = loan;
    const contributors = _.get(this.loan, ['item', 'contributors']);
    const contributorsList = [];
    if (typeof contributors !== 'undefined') {
      Object.keys(contributors).forEach(contributor => contributorsList.push(`${contributors[contributor].name}, `));
    } else {
      contributorsList.push('-');
    }
    return contributorsList;
  }

  getLoansFormatter() {
    const checkedLoans = this.state.checkedLoans;
    const { resources: { requests } } = this.props;
    const requestRecords = (requests || {}).records || [];
    return {
      '  ': loan => (
        <input
          checked={!!(checkedLoans[loan.id])}
          onClick={e => this.toggleItem(e, loan)}
          type="checkbox"
        />
      ),
      'title': loan => {
        const title = _.get(loan, ['item', 'title'], '');
        if (title) {
          const titleTodisplay = (title.length >= 77) ? `${title.substring(0, 77)}...` : title;
          return `${titleTodisplay} (${_.get(loan, ['item', 'materialType', 'name'])})`;
        }
        return '-';
      },
      'barcode': loan => _.get(loan, ['item', 'barcode'], ''),
      'Fee/Fine': loan => this.getFeeFine(loan),
      'itemStatus': loan => `${_.get(loan, ['item', 'status', 'name'], '')}`,
      'Call number': loan => _.get(loan, ['item', 'callNumber'], '-'),
      'requests': (loan) => this.state.requestCounts[loan.itemId] || 0,
      'loanPolicy': (loan) => this.state.loanPolicies[loan.loanPolicyId],
      'location': loan => `${_.get(loan, ['item', 'location', 'name'], '')}`,
      'Contributors': (loan) => {
        const contributorsList = this.getContributorslist(loan);
        const contributorsListString = contributorsList.join(' ');
        // Truncate if no of contributors > 2
        const listTodisplay = (contributorsList === '-') ? '-' : (contributorsList.length > 2) ? `${contributorsList[0]}, ${contributorsList[1]}...` : `${contributorsListString.substring(0, contributorsListString.length - 2)}`;
        return (contributorsList.length > 2) ?
          (
            <Popover>
              <div data-role="target" style={{ cursor: 'pointer' }}>{listTodisplay}</div>
              <div data-role="popover">
                {
                  contributorsList.map(contributor => <p key={contributor}>{contributor}</p>)
                }
              </div>
            </Popover>
          ) :
          (
            <div>
              {listTodisplay}
            </div>
          );
      },
      'loanDate': loan => this.formatDate(loan.loanDate),
      'dueDate': loan => this.formatDateTime(loan.dueDate),
      'renewals': loan => loan.renewalCount || 0,
      ' ': (loan) => {
        let requestQueue = false;
        if (requestRecords.length > 0) {
          requestRecords.forEach(r => {
            if (r.itemId === loan.itemId) requestQueue = true;
          });
        }
        return this.renderActions(loan, requestQueue);
      },
    };
  }

  changeDueDate(loan) {
    this.setState({
      activeLoan: loan.id,
      changeDueDateDialogOpen: true,
    });
  }

  details(loan, e) {
    this.props.onClickViewLoanActionsHistory(e, loan);
  }

  getOpenRequestsCount() {
    const q = this.state.loans.map(loan => {
      return `itemId==${loan.itemId}`;
    }).join(' or ');

    const query = `(${q}) and status==("Open - Awaiting pickup" or "Open - Not yet filled") sortby requestDate desc`;
    this.props.mutator.requests.reset();
    this.props.mutator.requests.GET({ params: { query } }).then((requestRecords) => {
      const requestCountObject = requestRecords.reduce((map, record) => {
        map[record.itemId] = map[record.itemId] ? ++map[record.itemId] : 1;
        return map;
      }, {});
      this.setState({ requestCounts: requestCountObject });
    });
  }

  fetchLoanPolicyNames() {
    const query = this.state.loans.map(loan => `id==${loan.loanPolicyId}`).join(' or ');
    this.props.mutator.loanPolicies.reset();
    this.props.mutator.loanPolicies.GET({ params: { query } }).then((loanPolicies) => {
      const loanPolicyObject = loanPolicies.reduce((map, loanPolicy) => {
        map[loanPolicy.id] = loanPolicy.name;
        return map;
      }, {});
      this.setState({ loanPolicies: loanPolicyObject });
    });
  }

  /**
   * change handler for the options-menu prevents the event from bubbling
   * up to the event handler attached to the row.
   */
  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    const { loan, action } = itemMeta;

    if (action && this[action]) {
      this[action](loan);
    }
  }

  getVisibleColumns() {
    const { visibleColumns } = this.state;
    const visibleColumnsMap = visibleColumns.reduce((map, e) => {
      map[e.title] = e.status;
      return map;
    }, {});

    const columnsToDisplay = this.possibleColumns.filter((e) => visibleColumnsMap[e] === undefined || visibleColumnsMap[e] === true);
    return columnsToDisplay;
  }

  onDropdownClick() {
    this.setState(({ toggleDropdownState }) => ({
      toggleDropdownState: !toggleDropdownState
    }));
  }

  renderCheckboxList(columnMapping) {
    const { visibleColumns } = this.state;
    return visibleColumns.filter((columnObj) => Object.keys(columnMapping).includes(columnObj.title))
      .map((e, i) => {
        const columnName = columnMapping[e.title];
        return (
          <li key={`columnitem-${i}`}>
            <Checkbox label={columnName} name={columnName} id={columnName} onChange={() => this.toggleColumn(e.title)} checked={e.status} />
          </li>
        );
      });
  }

  toggleColumn(e) {
    this.setState(({ visibleColumns }) => ({
      visibleColumns: visibleColumns.map(column => {
        if (column.title === e) {
          const status = column.status;
          column.status = status !== true;
        }
        return column;
      })
    }));
  }

  hideChangeDueDateDialog() {
    this.setState({
      changeDueDateDialogOpen: false,
      activeLoan: undefined,
    });
  }

  hideBulkRenewalDialog() {
    this.setState({
      bulkRenewalDialogOpen: false,
    });
  }

  itemDetails(loan, e) {
    if (e) e.preventDefault();

    // none of the query params relevent to finding a user
    // are relevent to finding instances so we purge them all.
    const q = {};
    Object.keys(this.props.resources.query).forEach((k) => { q[k] = null; });

    this.props.mutator.query.update({
      _path: `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`,
      ...q,
    });
  }

  feefine(loan, e) {
    this.props.onClickViewChargeFeeFine(e, loan);
  }

  feefinedetails(loan, e) {
    const accounts = _.get(this.props.resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    if (accountsLoan.length === 1) {
      this.props.onClickViewAccountActionsHistory(e, { id: accountsLoan[0].id });
    } else if (accountsLoan.length > 1) {
      const open = accountsLoan.filter(a => a.status.name === 'Open') || [];
      if (open.length === accountsLoan.length) {
        this.props.onClickViewOpenAccounts(e, loan);
      } else if (open.length === 0) {
        this.props.onClickViewClosedAccounts(e, loan);
      } else {
        this.props.onClickViewAllAccounts(e, loan);
      }
    }
  }

  renew(loan, bulkRenewal) {
    const { user, renew } = this.props;
    const promise = renew(loan, user, bulkRenewal);

    if (bulkRenewal) return promise;
    const singleRenewalFailure = [];
    promise
      .then(() => this.showSingleRenewCallout(loan))
      .catch(() => {
        singleRenewalFailure.push(loan);
      });
    return promise;
  }

  renewSelected() {
    const selectedLoans = Object.values(this.state.checkedLoans);
    const renewSuccess = [];
    const renewFailure = [];
    const bulkRenewal = (selectedLoans.length > 1);
    const errorMsg = {};
    const renewedLoans = selectedLoans.map((loan) => {
      return this.renew(loan, bulkRenewal)
        .then((renewedLoan) => renewSuccess.push(renewedLoan))
        .catch((error) => {
          renewFailure.push(loan);
          errorMsg[loan.id] = error;
        });
    });

    this.setState({ errorMsg });

    // map(p => p.catch(e => e)) turns all rejections into resolved values for the promise.all to wait for everything to finish
    Promise.all(renewedLoans.map(p => p.catch(e => e)))
      .then(() => {
        if (bulkRenewal) this.setState({ renewSuccess, renewFailure, bulkRenewalDialogOpen: true });
      });

    this.setState({ checkedLoans: {}, allChecked: false });
  }

  showChangeDueDateDialog() {
    this.setState({
      changeDueDateDialogOpen: true,
    });
  }

  showBulkRenewalDialog() {
    this.setState({
      bulkRenewalDialogOpen: true,
    });
  }

  showLoanPolicy(loan, e) {
    if (e) e.preventDefault();
    const q = {};
    Object.keys(this.props.resources.query).forEach((k) => { q[k] = null; });

    this.props.mutator.query.update({
      _path: `/settings/circulation/loan-policies/${loan.loanPolicyId}`,
      ...q,
    });
  }

  showMultiRenewCallout(renewedLoanItems) {
    const message = (
      <span>
        <SafeHTMLMessage
          id="ui-users.loans.items.renewed.callout"
          values={{
            strongCount: <strong>{renewedLoanItems.length}</strong>,
            count: renewedLoanItems.length,
          }}
        />
        <Button buttonStyle="link marginBottom0" onClick={() => this.showRenewedLoansModal()}>
          <strong>
-
            <FormattedMessage id="ui-users.loans.items.renewed.callout.details" />
          </strong>
        </Button>
      </span>
    );
    this.callout.sendCallout({ message });
  }

  showRequestQueue(loan, e) {
    if (e) e.preventDefault();
    const q = {};
    Object.keys(this.props.resources.query).forEach((k) => { q[k] = null; });
    const barcode = _.get(loan, ['item', 'barcode']);
    this.props.mutator.query.update({
      _path: `/requests?&query=${barcode}&sort=Request%20Date`,
      ...q,
    });
  }

  showSingleRenewCallout(loan) {
    const message = (
      <span>
        <SafeHTMLMessage
          id="ui-users.loans.item.renewed.callout"
          values={{ title: loan.item.title }}
        />
      </span>
    );

    this.callout.sendCallout({ message });
  }

  toggleAll(e) {
    const loans = this.props.loans;
    const checkedLoans = (e.target.checked)
      ? loans.reduce((memo, loan) => (Object.assign(memo, { [loan.id]: loan })), {})
      : {};

    this.setState(({ allChecked }) => ({
      allChecked: !allChecked,
      checkedLoans
    }));
  }

  toggleItem(e, loan) {
    e.stopPropagation();

    const id = loan.id;
    const loans = this.state.checkedLoans;
    const checkedLoans = (loans[id])
      ? _.omit(loans, id)
      : { ...loans, [id]: loan };
    const allChecked = _.size(checkedLoans) === this.props.loans.length;
    this.setState({ checkedLoans, allChecked });
  }

  renderActions(loan, requestQueue) {
    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <IconButton data-role="toggle" icon="ellipsis" size="small" iconSize="medium" />
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '7px 3px' }}>
          <MenuItem itemMeta={{ loan, action: 'itemDetails' }}>
            <Button buttonStyle="dropdownItem" href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`}><FormattedMessage id="ui-users.itemDetails" /></Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'renew' }}>
            <Button buttonStyle="dropdownItem"><FormattedMessage id="ui-users.renew" /></Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'changeDueDate' }}>
            <Button buttonStyle="dropdownItem"><FormattedMessage id="stripes-smart-components.cddd.changeDueDate" /></Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'showLoanPolicy' }}>
            <Button buttonStyle="dropdownItem" href={`/settings/circulation/loan-policies/${loan.loanPolicyId}`}><FormattedMessage id="ui-users.loans.details.loanPolicy" /></Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'feefine' }}>
            <Button buttonStyle="dropdownItem"><FormattedMessage id="ui-users.loans.newFeeFine" /></Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'feefinedetails' }}>
            <Button buttonStyle="dropdownItem">Fee/fine details</Button>
          </MenuItem>
          { requestQueue &&
            (
            <MenuItem itemMeta={{ loan, action: 'showRequestQueue' }}>
              <Button buttonStyle="dropdownItem" href={`/requests?&query=${_.get(loan, ['item', 'barcode'])}&sort=Request%20Date`}><FormattedMessage id="ui-users.loans.details.requestQueue" /></Button>
            </MenuItem>
            )
          }
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  renderChangeDueDateDialog() {
    const { loans } = this.props;
    const { activeLoan, checkedLoans } = this.state;

    let loanIds;
    if (activeLoan) { // Only changing one due date.
      loanIds = loans.filter(loan => activeLoan === loan.id);
    } else { // Bulk-changing due dates.
      loanIds = loans.filter(loan => checkedLoans[loan.id]);
    }

    return (
      <this.connectedChangeDueDateDialog
        stripes={this.props.stripes}
        loanIds={loanIds}
        onClose={this.hideChangeDueDateDialog}
        open={this.state.changeDueDateDialogOpen}
        user={this.props.user}
      />
    );
  }

  renderBulkRenewalDialog() {
    const { renewSuccess, renewFailure } = this.state;
    return (
      <this.connectedBulkRenewalDialog
        stripes={this.props.stripes}
        successRenewals={renewSuccess}
        failedRenewals={renewFailure}
        loanPolicies={this.state.loanPolicies}
        errorMessages={this.state.errorMsg}
        requestCounts={this.state.requestCounts}
        onClose={this.hideBulkRenewalDialog}
        open={this.state.bulkRenewalDialogOpen}
      />
    );
  }

  renderSubHeader(columnMapping) {
    const { formatMessage } = this.props.stripes.intl;
    const noSelectedLoans = _.size(this.state.checkedLoans) === 0;

    const bulkActionsTooltip = formatMessage({ id: 'ui-users.bulkActions.tooltip' });
    const renewString = formatMessage({ id: 'ui-users.renew' });
    const changeDueDateString = formatMessage({ id: 'stripes-smart-components.cddd.changeDueDate' });

    return (
      <ActionsBar
        contentStart={
          <span style={{ display: 'flex' }}>
            <Label>
              {formatMessage({ id: 'ui-users.resultCount' }, { count: this.props.loans.length })}
            </Label>
            <Dropdown id="columnsDropdown" open={this.state.toggleDropdownState} onToggle={this.onDropdownClick} style={{ float: 'right', marginLeft: '10px' }} group pullRight>
              <Button data-role="toggle" align="end" bottomMargin0 aria-haspopup="true">Select Columns</Button>
              <DropdownMenu data-role="menu" aria-label="available permissions">
                <ul>
                  {this.renderCheckboxList(columnMapping)}
                </ul>
              </DropdownMenu>
            </Dropdown>
          </span>
        }
        contentEnd={
          <span>
            <Button
              marginBottom0
              id="renew-all"
              disabled={noSelectedLoans}
              title={noSelectedLoans ? bulkActionsTooltip : renewString}
              onClick={this.renewSelected}
            >
              {renewString}
            </Button>
            <Button
              marginBottom0
              id="change-due-date-all"
              disabled={noSelectedLoans}
              title={noSelectedLoans ? bulkActionsTooltip : changeDueDateString}
              onClick={this.showChangeDueDateDialog}
            >
              {changeDueDateString}
            </Button>
            <ExportCsv data={this.props.loans} excludeKeys={['id', 'userId', 'itemId']} />
          </span>
        }
      />
    );
  }

  render() {
    const { sortOrder, sortDirection, allChecked, loanPolicies } = this.state;
    const visibleColumns = this.getVisibleColumns();

    if (_.isEmpty(loanPolicies)) {
      return <div />;
    }

    const columnMapping = {
      '  ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
      'title': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' }),
      'itemStatus': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
      'barcode': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.barcode' }),
      'Fee/Fine': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.feefine' }),
      'loanDate': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' }),
      'requests': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.details.requests' }),
      'Call number': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.details.callNumber' }),
      'loanPolicy': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' }),
      'Contributors': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.contributors' }),
      'dueDate': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
      'renewals': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.renewals' }),
      'location': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.details.location' }),
    };

    const loans = _.orderBy(this.props.loans,
      [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);

    return (
      <div className={css.root}>
        {this.props.loans.length > 0 && this.renderSubHeader(columnMapping)}
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={{ '  ': 28, 'title': 150, 'itemStatus': 100, 'dueDate': 140, 'requests': 90, 'barcode': 110, 'Fee/Fine': 50, 'Call number': 110, 'Contributors': 160, 'renewals': 70, 'loanPolicy': 100, 'location': 100, 'loanDate': 100, ' ': 50 }}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          columnOverflow={{ ' ': true }}
          onHeaderClick={this.onSort}
          onRowClick={this.onRowClick}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          contentData={loans}
        />
        { this.renderBulkRenewalDialog() }
        { this.renderChangeDueDateDialog() }
        <Callout ref={(ref) => { this.callout = ref; }} />
      </div>
    );
  }
}

export default withRenew(OpenLoans);
