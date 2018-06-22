import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import Callout from '@folio/stripes-components/lib/Callout';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Popover from '@folio/stripes-components/lib/Popover';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import Button from '@folio/stripes-components/lib/Button';
import IconButton from '@folio/stripes-components/lib/IconButton';
import { UncontrolledDropdown, Dropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import ChangeDueDateDialog from '@folio/stripes-smart-components/lib/ChangeDueDateDialog';
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
  });

  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
      formatDate: PropTypes.func.isRequired,
      formatDateTime: PropTypes.func.isRequired,
    }),
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    renew: PropTypes.func,
    mutator: PropTypes.shape({
      query: PropTypes.object.isRequired,
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
    this.getColumns = this.getColumns.bind(this);
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

    const { stripes } = props;

    this.connectedChangeDueDateDialog = stripes.connect(ChangeDueDateDialog);
    this.connectedBulkRenewalDialog = stripes.connect(BulkRenewalDialog);

    this.sortMap = {
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' })]: loan => _.get(loan, ['item', 'title']),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.barcode' })]: loan => _.get(loan, ['item', 'barcode']),
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

    const visibleColumns = [
      { 'title': 'title', 'status': true },
      { 'title': 'itemStatus', 'status': true },
      { 'title': 'dueDate', 'status': true },
      { 'title': 'requests', 'status': true },
      { 'title': 'barcode', 'status': true },
      { 'title': 'Call number', 'status': true },
      { 'title': 'Contributors', 'status': true },
      { 'title': 'renewals', 'status': true },
      { 'title': 'loanPolicy', 'status': true },
      { 'title': 'location', 'status': true },
    ];

    this.state = {
      checkedLoans: {},
      allChecked: false,
      loanPolicies: {},
      requestCounts: {},
      toggleColumnState: false,
      sortOrder: [
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.details.requests' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.barcode' }),
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
      nonRenewedLoansModalOpen: false,
      changeDueDateDialogOpen: false,
      bulkRenewalDialogOpen: false,
      renewFailure: [],
      renewSuccess: [],
      visibleColumns,
      errorMsg: {},
    };
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
    this.setState({ ...this.state, sortOrder, sortDirection });
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

  getColumns() {
    this.state.visibleColumns.map((e) => {
      const newArr = [];
      if (e.status === true) newArr.push(e.title);
      return newArr;
    });
  }

  onDropdownClick() {
    const state = this.state.toggleColumnState !== true;
    this.setState({ toggleColumnState: state });
  }

  renderCheckboxList(e, i) {
    const title = e.title;
    const status = e.status;
    return (
      <li key={`columnitem-${i}`}>
        <Checkbox label={title} name={title} id={title} onChange={() => this.toggleColumn(title)} checked={status} />
      </li>
    );
  }

  toggleColumn(e) {
    const columnList = this.state.visibleColumns.map(column => {
      if (column.title === e) {
        const status = column.status;
        column.status = status !== true;
      }
      return column;
    });
    this.setState({ visibleColumns: columnList });
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
          const formattedErrorMsg = `Loan cannot be renewed because: ${error}. See ${this.state.loanPolicies[loan.loanPolicyId]} for more information`;
          errorMsg[loan.id] = formattedErrorMsg;
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
          <strong>- <FormattedMessage id="ui-users.loans.items.renewed.callout.details" /></strong>
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

    const allChecked = !this.state.allChecked;
    this.setState({ ...this.state, checkedLoans, allChecked });
  }

  toggleItem(e, loan) {
    e.stopPropagation();

    const id = loan.id;
    const loans = this.state.checkedLoans;
    const checkedLoans = (loans[id])
      ? _.omit(loans, id)
      : { ...loans, [id]: loan };
    const allChecked = _.size(checkedLoans) === this.props.loans.length;
    this.setState({ ...this.state, checkedLoans, allChecked });
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

  renderSubHeader() {
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
            <Dropdown id="columnsDropdown" open={this.state.toggleColumnState} onToggle={this.onDropdownClick} style={{ float: 'right', marginLeft: '10px' }} group pullRight>
              <Button data-role="toggle" align="end" bottomMargin0 aria-haspopup="true">Select Columns</Button>
              <DropdownMenu data-role="menu" aria-label="available permissions">
                <ul>
                  {this.state.visibleColumns.map(this.renderCheckboxList)}
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
            >{renewString}
            </Button>
            <Button
              marginBottom0
              id="change-due-date-all"
              disabled={noSelectedLoans}
              title={noSelectedLoans ? bulkActionsTooltip : changeDueDateString}
              onClick={this.showChangeDueDateDialog}
            >{changeDueDateString}
            </Button>
          </span>
        }
      />
    );
  }

  render() {
    const { sortOrder, sortDirection, allChecked, loanPolicies } = this.state;
    const checkBoxColumn = ['  '];
    const ellipsisColumn = [' '];
    const controllableColumns = this.getColumns() ? this.getColumns() : [];
    const visibleColumns = [...checkBoxColumn, ...controllableColumns, ...ellipsisColumn];

    if (_.isEmpty(loanPolicies)) {
      return <div />;
    }

    const columnMapping = {
      '  ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
      'title': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' }),
      'itemStatus': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
      'barcode': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.barcode' }),
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
        {this.props.loans.length > 0 && this.renderSubHeader()}
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={{ '  ': 28, 'title': 150, 'itemStatus': 100, 'dueDate': 140, 'requests': 90, 'barcode': 110, 'Call number': 110, 'Contributors': 160, 'renewals': 70, 'loanPolicy': 100, 'location': 100, 'loanDate': 100, ' ': 50 }}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          columnOverflow={{ ' ': true }}
          onHeaderClick={this.onSort}
          onRowClick={this.props.onClickViewLoanActionsHistory}
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
