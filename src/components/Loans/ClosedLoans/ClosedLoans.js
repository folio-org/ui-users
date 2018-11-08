import _ from 'lodash';
import React from 'react';
import {
  FormattedMessage,
  FormattedTime,
} from 'react-intl';
import PropTypes from 'prop-types';
import {
  Button,
  MultiColumnList,
  UncontrolledDropdown,
  MenuItem,
  DropdownMenu,
  Popover,
  IconButton,
  ExportCsv,
} from '@folio/stripes/components';
import ActionsBar from '../components/ActionsBar';
import Label from '../../Label';

class ClosedLoans extends React.Component {
  static manifest = Object.freeze({
    query: {},
    loanAccount: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=userId=%{activeRecord.user}',
    },
    anonymize: {
      type: 'okapi',
      records: 'accounts',
      path: 'circulation/loans',
      fetch: false,
      POST: {
        path: 'loan-storage/loans/anonymize/%{activeRecord.user}',
      },
    },
    activeRecord: {},
  });

  static propTypes = {
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    mutator: PropTypes.shape({
      query: PropTypes.object.isRequired,
      activeRecord: PropTypes.object,
      anonymize: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }),
    resources: PropTypes.shape({
      query: PropTypes.object,
    }),
    user: PropTypes.object,
    onClickViewChargeFeeFine: PropTypes.func,
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
    onClickViewOpenAccounts: PropTypes.func.isRequired,
    onClickViewClosedAccounts: PropTypes.func.isRequired,
    onClickViewAllAccounts: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.onSort = this.onSort.bind(this);
    this.getLoansFormatter = this.getLoansFormatter.bind(this);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.getFeeFine = this.getFeeFine.bind(this);
    this.anonymizeLoans = this.anonymizeLoans.bind(this);

    this.sortMap = {
      [<FormattedMessage id="ui-users.loans.columns.title" />]: loan => _.get(loan, ['item', 'title']),
      [<FormattedMessage id="ui-users.loans.columns.barcode" />]: loan => _.get(loan, ['item', 'barcode']),
      [<FormattedMessage id="ui-users.loans.columns.feefine" />]: loan => this.getFeeFine(loan),
      [<FormattedMessage id="ui-users.loans.columns.itemStatus" />]: loan => _.get(loan, ['item', 'status', 'name'], ''),
      [<FormattedMessage id="ui-users.loans.columns.loanDate" />]: loan => loan.loanDate,
      [<FormattedMessage id="ui-users.loans.details.callNumber" />]: loan => _.get(loan, ['item', 'callNumber']),
      [<FormattedMessage id="ui-users.loans.columns.contributors" />]: loan => {
        const contributorsList = this.getContributorslist(loan);
        const contributorsListString = contributorsList.join(' ');
        return contributorsListString;
      },
      [<FormattedMessage id="ui-users.loans.columns.dueDate" />]: loan => loan.dueDate,
      [<FormattedMessage id="ui-users.loans.columns.renewals" />]: loan => loan.renewalCount,
      [<FormattedMessage id="ui-users.loans.details.requestQueue" />]: () => {},
      [<FormattedMessage id="ui-users.loans.details.loanPolicy" />]: loan => this.state.loanPolicies[loan.loanPolicyId],
      [<FormattedMessage id="ui-users.loans.columns.returnDate" />]: loan => loan.systemReturnDate,
    };

    this.state = {
      sortOrder: [
        <FormattedMessage id="ui-users.loans.columns.title" />,
        <FormattedMessage id="ui-users.loans.columns.itemStatus" />,
        <FormattedMessage id="ui-users.loans.columns.dueDate" />,
        <FormattedMessage id="ui-users.loans.details.requestQueue" />,
        <FormattedMessage id="ui-users.loans.columns.barcode" />,
        <FormattedMessage id="ui-users.loans.columns.feefine" />,
        <FormattedMessage id="ui-users.loans.details.callNumber" />,
        <FormattedMessage id="ui-users.loans.columns.contributors" />,
        <FormattedMessage id="i-users.loans.columns.renewals" />,
        <FormattedMessage id="ui-users.loans.details.loanPolicy" />,
        <FormattedMessage id="ui-users.loans.columns.loanDate" />,
        <FormattedMessage id="ui-users.loans.columns.returnDate" />,
      ],
      sortDirection: ['asc', 'asc'],
    };
    props.mutator.activeRecord.update({ user: props.user.id });
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
      remaining += parseFloat(a.amount);
    });
    return (remaining === 0) ? '-' : remaining.toFixed(2);
  }

  getContributorslist(loan) { // eslint-disable-line class-methods-use-this
    const contributors = _.get(loan, ['item', 'contributors']);
    const contributorsList = [];
    if (typeof contributors !== 'undefined') {
      Object.keys(contributors).forEach(contributor => contributorsList.push(`${contributors[contributor].name}; `));
    } else {
      contributorsList.push('-');
    }
    return contributorsList;
  }

  getLoansFormatter() {
    return {
      'title': loan => _.get(loan, ['item', 'title'], ''),
      'dueDate': loan => {
        return <FormattedTime
          value={loan.dueDate}
          day="numeric"
          month="numeric"
          year="numeric"
        />;
      },
      'barcode': loan => _.get(loan, ['item', 'barcode'], ''),
      'Fee/Fine': loan => this.getFeeFine(loan),
      'Call Number': loan => _.get(loan, ['item', 'callNumber'], '-'),
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
      'renewals': loan => loan.renewalCount || 0,
      'loanDate': loan => {
        return <FormattedTime
          value={loan.loanDate}
          day="numeric"
          month="numeric"
          year="numeric"
        />;
      },
      'returnDate': loan => {
        return <FormattedTime
          value={loan.returnDate}
          day="numeric"
          month="numeric"
          year="numeric"
        />;
      },
      ' ': loan => this.renderActions(loan),
    };
  }


  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    const { loan, action } = itemMeta;

    if (action && this[action]) {
      this[action](loan);
    }
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

  anonymizeLoans() {
    this.props.mutator.anonymize.POST({});
  }

  renderActions(loan) {
    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <IconButton data-role="toggle" icon="ellipsis" size="small" iconSize="medium" />
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '7px 3px' }}>
          <MenuItem itemMeta={{ loan, action: 'itemDetails' }}>
            <Button buttonStyle="dropdownItem" href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`}><FormattedMessage id="ui-users.itemDetails" /></Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'feefine' }}>
            <Button buttonStyle="dropdownItem"><FormattedMessage id="ui-users.loans.newFeeFine" /></Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'feefinedetails' }}>
            <Button buttonStyle="dropdownItem">Fee/fine details</Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  render() {
    const { sortOrder, sortDirection } = this.state;
    const visibleColumns = ['title', 'dueDate', 'barcode', 'Fee/Fine', 'Call Number', 'Contributors', 'renewals', 'loanDate', 'returnDate', ' '];
    const columnMapping = {
      'title': <FormattedMessage id="ui-users.loans.columns.title" />,
      'barcode': <FormattedMessage id="ui-users.loans.columns.barcode" />,
      'Fee/Fine': <FormattedMessage id="ui-users.loans.columns.feefine" />,
      'loanDate': <FormattedMessage id="ui-users.loans.columns.loanDate" />,
      'dueDate': <FormattedMessage id="ui-users.loans.columns.dueDate" />,
      'returnDate': <FormattedMessage id="ui-users.loans.columns.returnDate" />,
      'renewals': <FormattedMessage id="ui-users.loans.columns.renewals" />,
      'Call Number': <FormattedMessage id="ui-users.loans.details.callNumber" />,
      'Contributors': <FormattedMessage id="ui-users.loans.columns.contributors" />,
    };

    const anonymizeString = <FormattedMessage id="ui-users.anonymize" />;
    const loans = _.orderBy(this.props.loans,
      [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);

    return (
      <div>
        <ActionsBar
          show={this.props.loans.length > 0}
          contentStart={
            <Label>
              <FormattedMessage
                id="ui-users.closedLoansCount"
                values={{ count: this.props.loans.length }}
              />
            </Label>}
          contentEnd={
            <div>
              <Button
                marginBottom0
                id="anonymize-all"
                title={anonymizeString}
                onClick={this.anonymizeLoans}
              >
                {anonymizeString}
              </Button>
              <ExportCsv data={this.props.loans} excludeKeys={['id', 'userId', 'itemId']} />
            </div>
          }
        />
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={{ 'title': 200, 'dueDate': 150, 'barcode': 140, 'Fee/Fine': 100, 'Call Number': 110, 'Contributors': 170, 'renewals': 90, 'loanDate': 150, 'returnDate': 150, ' ': 35 }}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          onHeaderClick={this.onSort}
          columnOverflow={{ ' ': true }}
          contentData={loans}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          onRowClick={this.props.onClickViewLoanActionsHistory}
        />
      </div>
    );
  }
}

export default ClosedLoans;
