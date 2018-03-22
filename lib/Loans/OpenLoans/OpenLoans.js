import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Callout from '@folio/stripes-components/lib/Callout';
import Modal from '@folio/stripes-components/lib/Modal';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Button from '@folio/stripes-components/lib/Button';
import IconButton from '@folio/stripes-components/lib/IconButton';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Label from '../../Label';
import { formatDate, formatDateTime } from '../../../util';
import css from './OpenLoans.css';
import ActionsBar from '../components/ActionsBar';

import withRenew from '../../../withRenew';

const sortMap = {
  title: loan => _.get(loan, ['item', 'title']),
  barcode: loan => _.get(loan, ['item', 'barcode']),
  'Item Status': loan => _.get(loan, ['item', 'status', 'name'], ''),
  'Loan Date': loan => loan.loanDate,
  'Due Date': loan => loan.dueDate,
  renewals: loan => loan.renewalCount,
};

class OpenLoans extends React.Component {
  static propTypes = {
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    loans: PropTypes.arrayOf(PropTypes.object).isRequired,
    renew: PropTypes.func,
    mutator: PropTypes.shape({
      query: PropTypes.object.isRequired,
    }),
    resources: PropTypes.shape({
      query: PropTypes.object,
    }),
  };

  static manifest = {
    query: {},
  }

  constructor(props) {
    super(props);

    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.renewSelected = this.renewSelected.bind(this);
    this.onSort = this.onSort.bind(this);
    this.hideLoansModal = this.hideLoansModal.bind(this);
    this.callout = null;

    this.state = {
      checkedLoans: {},
      allChecked: false,
      sortOrder: ['title', 'barcode'],
      sortDirection: ['asc', 'asc'],
      loanModalOpen: false,
      loanItems: [],
    };
  }

  onRowClick(e, row) {
    if (e.target.type !== 'button') {
      this.props.onClickViewLoanActionsHistory(e, row);
    }
  }

  onSort(e, meta) {
    if (!sortMap[meta.alias]) return;

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

  getLoansFormatter() {
    const checkedLoans = this.state.checkedLoans;

    return {
      '  ': loan => (
        <input
          checked={!!(checkedLoans[loan.id])}
          onClick={e => this.toggleItem(e, loan)}
          type="checkbox"
        />
      ),
      title: loan => _.get(loan, ['item', 'title'], ''),
      barcode: loan => _.get(loan, ['item', 'barcode'], ''),
      itemStatus: loan => `${_.get(loan, ['item', 'status', 'name'], '')}`,
      loanDate: loan => formatDate(loan.loanDate),
      dueDate: loan => formatDateTime(loan.dueDate),
      renewals: loan => loan.renewalCount || 0,
      ' ': loan => this.renderActions(loan),
    };
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

  toggleAll(e) {
    const loans = this.props.loans;
    const checkedLoans = (e.target.checked)
      ? loans.reduce((memo, loan) => (Object.assign(memo, { [loan.id]: loan })), {})
      : {};

    const allChecked = !this.state.allChecked;
    this.setState({ ...this.state, checkedLoans, allChecked });
  }

  details(loan, e) {
    this.props.onClickViewLoanActionsHistory(e, loan);
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

  showLoansModal() {
    this.setState({ loanModalOpen: true });
  }

  hideLoansModal() {
    this.setState({ loanModalOpen: false });
  }

  showSingleRenewCallout(loan) {
    const message = (
      <span>
        The loan for <strong>{loan.item.title}</strong> was successfully <strong>renewed</strong>.
      </span>
    );

    this.callout.sendCallout({ message });
  }

  showMultiRenewCallout(loanItems) {
    const message = (
      <span>
        Renewed <strong>{loanItems.length}</strong> loans
        <Button buttonStyle="link marginBottom0" onClick={() => this.showLoansModal()}>
          <strong>- view details</strong>
        </Button>
      </span>
    );

    this.callout.sendCallout({ message });
  }

  renew(loan, skipCallout) {
    const promise = this.props.renew(loan);
    if (skipCallout) return promise;

    promise
      .then(() => this.showSingleRenewCallout(loan));

    return promise;
  }

  renewSelected() {
    const selectedLoans = Object.values(this.state.checkedLoans);
    const renewedLoans = selectedLoans.map(loan => this.renew(loan, true));

    Promise.all(renewedLoans)
      .then(() => this.afterRenewSelected(selectedLoans));
    this.setState({ checkedLoans: {}, allChecked: false });
  }

  afterRenewSelected(loanItems) {
    if (loanItems.length > 1) {
      this.showMultiRenewCallout(loanItems);
      this.setState({ loanItems });
    } else {
      this.showSingleRenewCallout(loanItems[0]);
    }
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

  renderActions(loan) {
    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <IconButton data-role="toggle" icon="ellipsis" size="small" iconSize="medium" />
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '7px 3px' }}>
          <MenuItem itemMeta={{ loan, action: 'itemDetails' }}>
            <Button buttonStyle="dropdownItem" href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`}>Item details</Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'details' }}>
            <Button buttonStyle="dropdownItem" href={`/users/view/${loan.userId}?layer=loan&loan=${loan.id}`}>Loan details</Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'renew' }}>
            <Button buttonStyle="dropdownItem">Renew</Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  renderSubHeader() {
    const checkedLoans = this.state.checkedLoans;

    let stringToolTip = 'Renew';
    const isDisabled = _.size(checkedLoans) === 0;

    if (isDisabled) {
      stringToolTip = 'Multiple loans can be processed at the same time. Please select loans first.';
    }

    return (
      <ActionsBar
        contentStart={<Label>{this.props.loans.length} Records found</Label>}
        contentEnd={<Button marginBottom0 id="renew-all" disabled={isDisabled} title={stringToolTip} onClick={this.renewSelected}>Renew</Button>}
      />
    );
  }

  render() {
    const { sortOrder, sortDirection, allChecked, loanItems } = this.state;
    const visibleColumns = ['  ', 'title', 'itemStatus', 'barcode', 'loanDate', 'dueDate', 'renewals', ' '];
    const columnMapping = {
      '  ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
      loanDate: 'Loan Date',
      dueDate: 'Due Date',
      itemStatus: 'Item Status',
    };

    const loans = _.orderBy(this.props.loans,
      [sortMap[sortOrder[0]], sortMap[sortOrder[1]]], sortDirection);
    const subHeading = <p>The loans for the following <strong>{loanItems.length}</strong> instances were successfully <strong>renewed</strong></p>;
    const label = 'Successful Renewals';

    return (
      <div className={css.root}>
        {this.props.loans.length > 0 && this.renderSubHeader()}
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={{ '  ': 28, barcode: 150, title: 350 }}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          columnOverflow={{ ' ': true }}
          onHeaderClick={this.onSort}
          onRowClick={this.props.onClickViewLoanActionsHistory}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          contentData={loans}
          interactive={false}
        />
        <Modal dismissible closeOnBackgroundClick onClose={this.hideLoansModal} open={this.state.loanModalOpen} label={label}>
          {subHeading}
          {
              loanItems.map((loanItem, index) => (
                <li key={index}>
                  <span>{loanItem.item.title}</span>
                </li>))
          }
        </Modal>
        <Callout ref={(ref) => { this.callout = ref; }} />
      </div>
    );
  }
}

export default withRenew(OpenLoans);
