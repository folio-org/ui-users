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
      itemIds: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
    resources: PropTypes.shape({
      query: PropTypes.object,
      itemIds: PropTypes.object,
    }),
  };

  static manifest = Object.freeze({
    itemIds: {},
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
      path: 'circulation/requests?query=(%{itemIds.query}) and status==("Open - Awaiting pickup" or "Open - Not yet filled") sortby requestDate desc',
      resourceShouldRefresh: true,
      records: 'requests',
    },
  });

  static getDerivedStateFromProps(nextProps, prevState) {
    const { loans } = nextProps;

    if (prevState.loans.length < nextProps.loans.length) {
      const query = nextProps.loans.map(loan => {
        return `itemId==${loan.itemId}`;
      }).join(' or ');
      nextProps.mutator.itemIds.replace({ query });
      return { loans };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.onRowClick = this.onRowClick.bind(this);
    this.onSort = this.onSort.bind(this);
    this.getLoansFormatter = this.getLoansFormatter.bind(this);
    this.getOpenRequestsCount = this.getOpenRequestsCount.bind(this);
    this.toggleItem = this.toggleItem.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.renewSelected = this.renewSelected.bind(this);
    this.showContributors = this.showContributors.bind(this);
    this.formatDate = this.props.stripes.formatDate;
    this.formatDateTime = this.props.stripes.formatDateTime;
    this.hideRenewedLoansModal = this.hideRenewedLoansModal.bind(this);
    this.hideNonRenewedLoansModal = this.hideNonRenewedLoansModal.bind(this);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.fetchLoanPolicyNames = this.fetchLoanPolicyNames.bind(this);
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
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.requests' })]: (loan) => this.getOpenRequestsCount(loan),
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.loanPolicy' })]: loan => this.state.loanPolicies[loan.loanPolicyId],
      [stripes.intl.formatMessage({ id: 'ui-users.loans.details.location' })]: loan => _.get(loan, ['item', 'location', 'name'], ''),
    };

    this.state = {
      checkedLoans: {},
      allChecked: false,
      loanPolicies: {},
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
      loans: [],
      renewedLoansModalOpen: false,
      renewedLoanItems: [],
      nonRenewedLoanItems: [],
      nonRenewedLoansModalOpen: false
    };
  }

  componentDidMount() {
    if (this.state.loans.length > 0) {
      this.fetchLoanPolicyNames();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.loans.length > prevState.loans.length) {
      this.fetchLoanPolicyNames();
    }
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

  showContributors(list, listTodisplay, contributorsLength) {
    this.list = list;
    return (contributorsLength >= 25) ?
      (
        <Popover>
          <div data-role="target">{listTodisplay}</div>
          <div data-role="popover">
            {
              this.list.map(contributor => <p key={contributor}>{contributor}</p>)
            }
          </div>
        </Popover>
      ) :
      (
        <div>
          {listTodisplay}
        </div>
      );
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

  getOpenRequestsCount(loan) {
    const { resources: { requests } } = this.props;
    const requestRecords = (requests || {}).records || [];
    let requestCount = 0;
    requestRecords.forEach(record => {
      if (loan.itemId === record.itemId) requestCount++;
    });
    return requestCount;
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
      'requests': (loan) => this.getOpenRequestsCount(loan),
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

  showLoanPolicy(loan, e) {
    if (e) e.preventDefault();
    const q = {};
    Object.keys(this.props.resources.query).forEach((k) => { q[k] = null; });

    this.props.mutator.query.update({
      _path: `/settings/circulation/loan-policies/${loan.loanPolicyId}`,
      ...q,
    });
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
    const { sortOrder, sortDirection, allChecked, renewedLoanItems, nonRenewedLoanItems, loanPolicies } = this.state;

    if (_.isEmpty(loanPolicies)) {
      return <div />;
    }
    const visibleColumns = ['  ', 'title', 'itemStatus', 'dueDate', 'requests', 'barcode', 'Call number', 'Contributors', 'renewals', 'loanPolicy', 'location', 'loanDate', ' '];
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
