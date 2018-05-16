import _ from 'lodash';
import React from 'react';
import Popover from '@folio/stripes-components/lib/Popover';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import IconButton from '@folio/stripes-components/lib/IconButton';
import ActionsBar from '../components/ActionsBar';
import Label from '../../Label';

class ClosedLoans extends React.Component {
  static propTypes = {
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
      formatDate: PropTypes.func.isRequired,
      formatDateTime: PropTypes.func.isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      query: PropTypes.object.isRequired,
    }),
    resources: PropTypes.shape({
      query: PropTypes.object,
    }),
  };

  static manifest = Object.freeze({
    query: {},
  });

  constructor(props) {
    super(props);

    const { stripes } = this.props;
    this.formatDate = stripes.formatDate;
    this.formatDateTime = stripes.formatDateTime;
    this.onSort = this.onSort.bind(this);
    this.getLoansFormatter = this.getLoansFormatter.bind(this);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);

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
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.requestQueue' })]: () => {},
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.feeFine' })]: () => {},
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' })]: loan => this.state.loanPolicies[loan.loanPolicyId],
    };

    this.state = {
      sortOrder: [
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.details.requestQueue' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.barcode' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.details.feeFine' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.details.callNumber' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.contributors' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.renewals' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' }),
        stripes.intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' }),
      ],
      sortDirection: ['asc', 'asc'],
    };
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

  getLoansFormatter() {
    return {
      'title': loan => _.get(loan, ['item', 'title'], ''),
      'dueDate': loan => this.formatDateTime(loan.dueDate),
      'barcode': loan => _.get(loan, ['item', 'barcode'], ''),
      'Fine': () => {},
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
      'loanDate': loan => this.formatDateTime(loan.loanDate),
      'returnDate': loan => this.formatDateTime(loan.systemReturnDate),
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
        </DropdownMenu>
      </UncontrolledDropdown>
    );
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

  render() {
    const { sortOrder, sortDirection } = this.state;
    const visibleColumns = ['title', 'dueDate', 'barcode', 'Fine', 'Call Number', 'Contributors', 'renewals', 'loanDate', 'returnDate', ' ': 50];
    const columnMapping = {
      'title': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' }),
      'barcode': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.barcode' }),
      'loanDate': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' }),
      'dueDate': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
      'returnDate': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.returnDate' }),
      'renewals': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.renewals' }),
      'Fine': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.details.fine' }),
      'Call Number': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.details.callNumber' }),
      'Contributors': this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.columns.contributors' }),
    };

    const loans = _.orderBy(this.props.loans,
      [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);

    return (
      <div>
        <ActionsBar
          show={this.props.loans.length > 0}
          contentStart={<Label>{this.props.stripes.intl.formatMessage({ id: 'ui-users.closedLoansCount' }, { count: this.props.loans.length })}</Label>}
        />
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={{ 'title': 200, 'dueDate': 150, 'barcode': 140, 'Fine': 120, 'Call Number': 110, 'Contributors': 170, 'renewals': 90, 'loanDate': 150, 'returnDate': 150 }}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          onHeaderClick={this.onSort}
          columnOverflow={{ ' ': true }}
          contentData={loans}
          onRowClick={this.props.onClickViewLoanActionsHistory}
        />
      </div>
    );
  }
}

export default ClosedLoans;
