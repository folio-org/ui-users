import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Callout from '@folio/stripes-components/lib/Callout';
import Modal from '@folio/stripes-components/lib/Modal';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Popover from '@folio/stripes-components/lib/Popover';
import Button from '@folio/stripes-components/lib/Button';
import IconButton from '@folio/stripes-components/lib/IconButton';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import Label from '../../Label';
import css from './OpenLoans.css';
import ActionsBar from '../components/ActionsBar';

import withRenew from '../../../withRenew';

class OpenLoans extends React.Component {
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
    }),
    resources: PropTypes.shape({
      query: PropTypes.object,
    }),
  };

  static manifest = Object.freeze({
    query: {},
    loanPolicies: {
      type: 'okapi',
      records: 'loanPolicies',
      path: 'loan-policy-storage/loan-policies',
      accumulate: 'true',
      fetch: false,
    },
  });

  constructor(props) {
    super(props);

    this.onRowClick = this.onRowClick.bind(this);
    this.onSort = this.onSort.bind(this);
    this.getLoansFormatter = this.getLoansFormatter.bind(this);
    this.toggleItem = this.toggleItem.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.renewSelected = this.renewSelected.bind(this);
    this.formatDate = this.props.stripes.formatDate;
    this.formatDateTime = this.props.stripes.formatDateTime;
    this.hideRenewedLoansModal = this.hideRenewedLoansModal.bind(this);
    this.hideNonRenewedLoansModal = this.hideNonRenewedLoansModal.bind(this);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.callout = null;

    const { stripes } = props;

    this.sortMap = {
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.title' })]: loan => _.get(loan, ['item', 'title']),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.barcode' })]: loan => _.get(loan, ['item', 'barcode']),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.itemStatus' })]: loan => _.get(loan, ['item', 'status', 'name'], ''),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' })]: loan => loan.loanDate,
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.callNumber' })]: loan => _.get(loan, ['item', 'callNumber']),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.contributors' })]: loan => _.get(loan, ['item', 'contributors']),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' })]: loan => loan.dueDate,
      [stripes.intl.formatMessage({ id: 'ui-users.loans.columns.renewals' })]: loan => loan.renewalCount,
    };

    this.state = {
      checkedLoans: {},
      allChecked: false,
      sortOrder: ['title', 'barcode'],
      sortDirection: ['asc', 'asc'],
      renewedLoansModalOpen: false,
      renewedLoanItems: [],
      nonRenewedLoanItems: [],
      nonRenewedLoansModalOpen: false
    };
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
    const checkedLoans = this.state.checkedLoans;
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
          return `${titleTodisplay}(${_.get(loan, ['item', 'materialType', 'name'])})`;
        }
        return '-';
      },
      'barcode': loan => _.get(loan, ['item', 'barcode'], ''),
      'itemStatus': loan => `${_.get(loan, ['item', 'status', 'name'], '')}`,
      'Call number': loan => _.get(loan, ['item', 'callNumber'], '-'),
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

  showRenewedLoansModal() {
    this.setState({ renewedLoansModalOpen: true });
  }

  hideRenewedLoansModal() {
    this.setState({ renewedLoansModalOpen: false });
  }

  showNonRenewedLoansModal() {
    this.setState({ nonRenewedLoansModalOpen: true });
  }

  hideNonRenewedLoansModal() {
    this.setState({ nonRenewedLoansModalOpen: false });
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

  openNonRenewedLoansModal(nonRenewedLoanItems) {
    this.setState({ nonRenewedLoanItems });
    this.showNonRenewedLoansModal();
  }

  renew(loan, skipCallout) {
    const promise = this.props.renew(loan);
    if (skipCallout) return promise;
    const singleRenewalFailure = [];
    promise
      .then(() => this.showSingleRenewCallout(loan))
      .catch(() => {
        singleRenewalFailure.push(loan);
        this.openNonRenewedLoansModal(singleRenewalFailure);
      });
    return promise;
  }

  renewSelected() {
    const selectedLoans = Object.values(this.state.checkedLoans);
    const renewSuccess = [];
    const renewFailure = [];

    const renewedLoans = selectedLoans.map((loan) => {
      return this.renew(loan, true)
        .then(() => renewSuccess.push(loan))
        .catch(() => renewFailure.push(loan));
    });

    // map(p => p.catch(e => e)) part turns all rejections into resolved values for the promise.all to wait for everything to finish
    Promise.all(renewedLoans.map(p => p.catch(e => e)))
      .then(() => {
        if (renewSuccess.length >= 1) this.afterRenewSelected(renewSuccess);
      })
      .then(() => {
        if (renewFailure.length >= 1) this.openNonRenewedLoansModal(renewFailure);
      });

    this.setState({ checkedLoans: {}, allChecked: false });
  }

  afterRenewSelected(renewedLoanItems) {
    if (renewedLoanItems.length > 1) {
      this.showMultiRenewCallout(renewedLoanItems);
      this.setState({ renewedLoanItems });
    } else {
      this.showSingleRenewCallout(renewedLoanItems[0]);
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
            <Button buttonStyle="dropdownItem" href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`}><FormattedMessage id="ui-users.itemDetails" /></Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'renew' }}>
            <Button buttonStyle="dropdownItem"><FormattedMessage id="ui-users.renew" /></Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  renderSubHeader() {
    const checkedLoans = this.state.checkedLoans;

    let stringToolTip = this.props.stripes.intl.formatMessage({ id: 'ui-users.renew' });
    const isDisabled = _.size(checkedLoans) === 0;

    if (isDisabled) {
      stringToolTip = this.props.stripes.intl.formatMessage({ id: 'ui-users.renew.toolTip' });
    }

    return (
      <ActionsBar
        contentStart={<Label>{this.props.stripes.intl.formatMessage({ id: 'ui-users.resultCount' }, { count: this.props.loans.length })}</Label>}
        contentEnd={<Button marginBottom0 id="renew-all" disabled={isDisabled} title={stringToolTip} onClick={this.renewSelected}><FormattedMessage id="ui-users.renew" /></Button>}
      />
    );
  }

  render() {
    const { sortOrder, sortDirection, allChecked, renewedLoanItems, nonRenewedLoanItems } = this.state;
    const visibleColumns = ['  ', 'title', 'itemStatus', 'barcode', 'loanDate', 'Call number', 'Contributors', 'dueDate', 'renewals', ' '];
    const columnMapping = {
      '  ': (<input type="checkbox" checked={allChecked} name="check-all" onChange={this.toggleAll} />),
      'title': <FormattedMessage id="ui-users.loans.columns.title" />,
      'itemStatus': <FormattedMessage id="ui-users.loans.columns.itemStatus" />,
      'barcode': <FormattedMessage id="ui-users.loans.columns.barcode" />,
      'loanDate': <FormattedMessage id="ui-users.loans.columns.loanDate" />,
      'Call number': <FormattedMessage id="ui-users.loans.details.callNumber" />,
      'Contributors': <FormattedMessage id="ui-users.loans.columns.contributors" />,
      'dueDate': <FormattedMessage id="ui-users.loans.columns.dueDate" />,
      'renewals': <FormattedMessage id="ui-users.loans.columns.renewals" />,
    };

    const loans = _.orderBy(this.props.loans,
      [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const subHeading = (
      <p>
        <FormattedMessage
          id="ui-users.loans.items.renewed.subHeading"
          values={{
            strongCount: <strong>{renewedLoanItems.length}</strong>,
            count: renewedLoanItems.length,
            verb: <strong>{this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.item.renewed.callout.verb' })}</strong>,
          }}
        />
      </p>
    );

    const failedRenewalsSubHeading = (
      <p>
        <FormattedMessage
          id="ui-users.loans.items.nonRenewed.subHeading"
          values={{
            strongCount: <strong>{nonRenewedLoanItems.length}</strong>,
            count: nonRenewedLoanItems.length,
            verb: <strong>{this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.item.nonRenewed.callout.verb' })}</strong>,
          }}
        />
      </p>
    );

    const label = this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.items.renewed.label' });
    const nonRenewedLabel = this.props.stripes.intl.formatMessage({ id: 'ui-users.loans.items.nonRenewed.label' });
    return (
      <div className={css.root}>
        {this.props.loans.length > 0 && this.renderSubHeader()}
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={{ '  ': 28, 'barcode': 150, 'loanDate': 120, 'title': 250, 'Call number': 150, 'Contributors': 150, 'dueDate': 160, 'renewals': 70, ' ': 50 }}
          visibleColumns={visibleColumns}
          columnMapping={columnMapping}
          columnOverflow={{ ' ': true }}
          onHeaderClick={this.onSort}
          onRowClick={this.props.onClickViewLoanActionsHistory}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          contentData={loans}
        />
        <Modal dismissible closeOnBackgroundClick onClose={this.hideRenewedLoansModal} open={this.state.renewedLoansModalOpen} label={label}>
          {subHeading}
          {
              renewedLoanItems.map((loanItem, index) => (
                <li key={index}>
                  <span>{loanItem.item.title}</span>
                </li>))
          }
        </Modal>
        <Modal dismissible closeOnBackgroundClick onClose={this.hideNonRenewedLoansModal} open={this.state.nonRenewedLoansModalOpen} label={nonRenewedLabel}>
          {failedRenewalsSubHeading}
          {
              nonRenewedLoanItems.map((loanItem, index) => (
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
