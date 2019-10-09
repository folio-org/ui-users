import _ from 'lodash';
import React from 'react';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
  intlShape,
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

import {
  IfPermission,
  stripesShape,
} from '@folio/stripes/core';

import ActionsBar from '../components/ActionsBar';
import Label from '../../Label';
import ErrorModal from '../../ErrorModal';

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
      fetch: false,
      POST: {
        path: 'loan-anonymization/by-user/%{activeRecord.user}',
      },
    },
    activeRecord: {},
  });

  static propTypes = {
    stripes: stripesShape.isRequired,
    // buildRecords: PropTypes.func,
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
    match: PropTypes.object,
    user: PropTypes.object,
    onClickViewChargeFeeFine: PropTypes.func,
    onClickViewAccountActionsHistory: PropTypes.func.isRequired,
    onClickViewOpenAccounts: PropTypes.func.isRequired,
    onClickViewClosedAccounts: PropTypes.func.isRequired,
    onClickViewAllAccounts: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);

    this.onSort = this.onSort.bind(this);
    this.getLoansFormatter = this.getLoansFormatter.bind(this);
    this.getContributorslist = this.getContributorslist.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.getFeeFine = this.getFeeFine.bind(this);
    this.anonymizeLoans = this.anonymizeLoans.bind(this);
    const { intl } = props;
    this.headers = ['action', 'dueDate', 'loanDate', 'returnDate', 'systemReturnDate', 'item.barcode', 'item.callNumber', 'item.contributors',
      'item.holdingsRecordId', 'item.instanceId', 'item.status.name', 'item.title', 'item.materialType.name',
      'item.location.name', 'metaData.createdByUserId', 'metadata.updatedDate', 'metadata.updatedByUserId', 'loanPolicyId'];

    // Map to pass into exportCsv
    this.columnHeadersMap = this.headers.map(item => {
      return {
        label: this.props.intl.formatMessage({ id: `ui-users.${item}` }),
        value: item
      };
    });

    this.columnMapping = {
      'title': intl.formatMessage({ id: 'ui-users.loans.columns.title' }),
      'barcode': intl.formatMessage({ id: 'ui-users.loans.columns.barcode' }),
      'Fee/Fine': intl.formatMessage({ id: 'ui-users.loans.columns.feefine' }),
      'loanDate': intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' }),
      'dueDate': intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
      'returnDate': intl.formatMessage({ id: 'ui-users.loans.columns.returnDate' }),
      'renewals': intl.formatMessage({ id: 'ui-users.loans.columns.renewals' }),
      'Call Number': intl.formatMessage({ id: 'ui-users.loans.details.callNumber' }),
      'Contributors': intl.formatMessage({ id: 'ui-users.loans.columns.contributors' }),
      'checkinServicePoint': intl.formatMessage({ id: 'ui-users.loans.details.checkinServicePoint' }),
    };

    this.sortMap = {
      [this.columnMapping.title]: loan => _.get(loan, ['item', 'title']),
      [this.columnMapping.barcode]: loan => _.get(loan, ['item', 'barcode']),
      [this.columnMapping['Fee/Fine']]: loan => this.getFeeFine(loan),
      [this.columnMapping.loanDate]: loan => loan.loanDate,
      [this.columnMapping['Call Number']]: loan => _.get(loan, ['item', 'callNumber']),
      [this.columnMapping.Contributors]: loan => {
        const contributorsList = this.getContributorslist(loan);
        const contributorsListString = contributorsList.join(' ');
        return contributorsListString;
      },
      [this.columnMapping.dueDate]: loan => loan.dueDate,
      [this.columnMapping.renewals]: loan => loan.renewalCount,
      [this.columnMapping.returnDate]: loan => loan.systemReturnDate,
      [this.columnMapping.checkinServicePoint]: loan => _.get(loan, ['checkinServicePoint', 'name'], '-'),
    };

    this.state = {
      sortOrder: [
        this.columnMapping.title,
        this.columnMapping.barcode,
        this.columnMapping['Fee/Fine'],
        this.columnMapping.loanDate,
        this.columnMapping.dueDate,
        this.columnMapping['Call Number'],
        this.columnMapping.Contributors,
        this.columnMapping.renewals,
        this.columnMapping.renewals,
        this.columnMapping.checkinServicePoint,
      ],
      sortDirection: ['asc', 'asc'],
      anonymizationErrorModalOpen: false,
      failedAnonymizationLoansCount: 0,
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
      'checkinServicePoint': loan => _.get(loan, ['checkinServicePoint', 'name'], '-'),
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

  getFeeFinePath = (loan) => {
    const {
      resources,
      match: { params }
    } = this.props;
    const accounts = _.get(resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    if (accountsLoan.length === 1) {
      return `/users/${params.id}/accounts/view/${accountsLoan[0].id}`;
      // this.props.onClickViewAccountActionsHistory(e, { id: accountsLoan[0].id });
    } else if (accountsLoan.length > 1) {
      const open = accountsLoan.filter(a => a.status.name === 'Open') || [];
      if (open.length === accountsLoan.length) {
        // this.props.onClickViewOpenAccounts(e, loan);
        return `/users/${params.id}/accounts/open`;
      } else if (open.length === 0) {
        // this.props.onClickViewClosedAccounts(e, loan);
        return `/users/${params.id}/accounts/closed`;
      } else {
        // this.props.onClickViewAllAccounts(e, loan);
        return `/users/${params.id}/accounts/all`;
      }
    }
    return '';
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

  async anonymizeLoans() {
    const response = await this.props.mutator.anonymize.POST({});

    this.handleLoansAssociatedFeesFinesAnonymizationError(response);
  }

  handleLoansAssociatedFeesFinesAnonymizationError(response) {
    const errors = _.get(response, 'errors', []);
    const associatedFeesFinesErrors = _.find(errors, { message: 'haveAssociatedFeesAndFines' });

    if (!associatedFeesFinesErrors) return;

    const parameters = _.get(associatedFeesFinesErrors, 'parameters', []);
    const loanIds = _.find(parameters, { key: 'loanIds' });
    const loanIdsValue = _.get(loanIds, 'value', '[]');

    try {
      const loanIdsCount = JSON.parse(loanIdsValue).length;

      if (!loanIdsCount) return;

      this.setState({
        anonymizationErrorModalOpen: Boolean(loanIdsCount),
        failedAnonymizationLoansCount: loanIdsCount,
      });
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
    }
  }

  buildRecords(records) {
    return records.map((record) => {
      const {
        item,
        item: { contributors },
      } = record;

      return _.isArray(contributors) ?
        {
          ...record,
          item: {
            ...item,
            contributors: contributors
              .map((currentContributor) => currentContributor.name)
              .join('; ')
          }
        } : record;
    });
  }

  closeLoansAnonymizationErrorModal = () => {
    this.setState({
      anonymizationErrorModalOpen: false,
      failedAnonymizationLoansCount: 0,
    });
  };

  renderActions(loan) {
    const accounts = _.get(this.props.resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    const { stripes, match: { params } } = this.props;
    const buttonDisabled = !stripes.hasPerm('ui-users.feesfines.actions.all');

    return (
      <UncontrolledDropdown
        onSelectItem={this.handleOptionsChange}
      >
        <IconButton data-role="toggle" icon="ellipsis" size="small" iconSize="medium" />
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '7px 3px' }}>
          <IfPermission perm="inventory.items.item.get">
            <MenuItem itemMeta={{ loan, action: 'itemDetails' }}>
              <Button buttonStyle="dropdownItem" href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`}><FormattedMessage id="ui-users.itemDetails" /></Button>
            </MenuItem>
          </IfPermission>
          <MenuItem itemMeta={{ loan, action: 'feefine' }}>
            <Button
              disabled={buttonDisabled}
              to={{ pathname: `/users/${params.id}/loans/view/${loan.id}/chargefee` }}
              buttonStyle="dropdownItem"
            >
              <FormattedMessage id="ui-users.loans.newFeeFine" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'feefinedetails' }}>
            <Button
              disabled={accountsLoan.length === 0}
              buttonStyle="dropdownItem"
              to={accountsLoan.length > 0 ? { pathname: this.getFeeFinePath(loan) } : undefined}
            >
              <FormattedMessage id="ui-users.loans.feeFineDetails" />
            </Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  render() {
    const {
      sortOrder,
      sortDirection,
      anonymizationErrorModalOpen,
      failedAnonymizationLoansCount,
    } = this.state;
    const {
      onClickViewLoanActionsHistory,
      loans,
    } = this.props;

    const visibleColumns = ['title', 'dueDate', 'barcode', 'Fee/Fine', 'Call Number', 'Contributors', 'renewals', 'loanDate', 'returnDate', 'checkinServicePoint', ' '];
    const anonymizeString = <FormattedMessage id="ui-users.anonymize" />;
    const loansSorted = _.orderBy(loans,
      [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const clonedLoans = _.cloneDeep(loans);
    const recordsToCSV = this.buildRecords(clonedLoans);
    return (
      <div data-test-closed-loans>
        <ActionsBar
          show={loans.length > 0}
          contentStart={
            <Label>
              <FormattedMessage
                id="ui-users.closedLoansCount"
                values={{ count: loans.length }}
              />
            </Label>}
          contentEnd={
            <div>
              <Button
                marginBottom0
                id="anonymize-all"
                onClick={this.anonymizeLoans}
              >
                {anonymizeString}
              </Button>
              <ExportCsv
                data={recordsToCSV}
                onlyFields={this.columnHeadersMap}
              />
              <ErrorModal
                id="anonymization-fees-fines-modal"
                open={anonymizationErrorModalOpen}
                label={<FormattedMessage id="ui-users.anonymization.confirmation.header" />}
                message={(
                  <FormattedMessage
                    id="ui-users.anonymization.confirmation.message"
                    values={{ amount: failedAnonymizationLoansCount }}
                  />
                )}
                onClose={this.closeLoansAnonymizationErrorModal}
              />
            </div>
          }
        />
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={{ 'title': 200, 'dueDate': 150, 'barcode': 140, 'Fee/Fine': 100, 'Call Number': 110, 'Contributors': 170, 'renewals': 90, 'loanDate': 150, 'returnDate': 150, 'checkinServicePoint': 150, ' ': 35 }}
          visibleColumns={visibleColumns}
          columnMapping={this.columnMapping}
          onHeaderClick={this.onSort}
          columnOverflow={{ ' ': true }}
          contentData={loansSorted}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          onRowClick={onClickViewLoanActionsHistory}
          totalCount={loansSorted.length}
        />
      </div>
    );
  }
}

export default injectIntl(ClosedLoans);
