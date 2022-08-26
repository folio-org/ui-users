import _ from 'lodash';
import React from 'react';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
} from 'react-intl';
import PropTypes from 'prop-types';

import {
  Button,
  MultiColumnList,
  Dropdown,
  DropdownMenu,
  Popover,
  IconButton,
  ExportCsv,
} from '@folio/stripes/components';
import {
  IfPermission,
  IntlConsumer,
  stripesShape,
} from '@folio/stripes/core';
import { effectiveCallNumber } from '@folio/stripes/util';

import {
  calculateSortParams,
  getChargeFineToLoanPath,
  nav,
} from '../../util';
import ActionsBar from '../components/ActionsBar';
import Label from '../../Label';
import ErrorModal from '../../ErrorModal';

import css from './ClosedLoans.css';

class ClosedLoans extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
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
    intl: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
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
    this.headers = ['action', 'dueDate', 'loanDate', 'returnDate', 'systemReturnDate', 'item.barcode', 'item.callNumberComponents.prefix',
      'item.callNumberComponents.callNumber', 'item.callNumberComponents.suffix', 'item.volume', 'item.enumeration', 'item.chronology',
      'item.copyNumber', 'item.contributors', 'item.holdingsRecordId', 'item.instanceId', 'item.status.name', 'item.title', 'item.materialType.name',
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
      'feefineIncurred': intl.formatMessage({ id: 'ui-users.loans.columns.feefineIncurred' }),
      'loanDate': intl.formatMessage({ id: 'ui-users.loans.columns.loanDate' }),
      'dueDate': intl.formatMessage({ id: 'ui-users.loans.columns.dueDate' }),
      'returnDate': intl.formatMessage({ id: 'ui-users.loans.columns.returnDate' }),
      'renewals': intl.formatMessage({ id: 'ui-users.loans.columns.renewals' }),
      'callNumber': intl.formatMessage({ id: 'ui-users.loans.details.effectiveCallNumber' }),
      'Contributors': intl.formatMessage({ id: 'ui-users.loans.columns.contributors' }),
      'checkinServicePoint': intl.formatMessage({ id: 'ui-users.loans.details.checkinServicePoint' }),
      ' ': intl.formatMessage({ id: 'ui-users.action' }),
    };

    this.sortMap = {
      [this.columnMapping.title]: loan => _.get(loan, ['item', 'title']),
      [this.columnMapping.barcode]: loan => _.get(loan, ['item', 'barcode']),
      [this.columnMapping.feefineIncurred]: loan => this.getFeeFine(loan),
      [this.columnMapping.loanDate]: loan => loan.loanDate,
      [this.columnMapping.callNumber]: loan => effectiveCallNumber(loan),
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
        this.columnMapping.feefineIncurred,
        this.columnMapping.loanDate,
        this.columnMapping.dueDate,
        this.columnMapping.callNumber,
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

    const {
      sortOrder,
      sortDirection,
    } = this.state;

    this.setState(calculateSortParams({
      sortOrder,
      sortDirection,
      sortValue: meta.alias,
    }));
  }

  onRowClick = (e, row) => {
    e.stopPropagation();

    if (e.target.type !== 'button') {
      const {
        history,
        match: { params },
        location,
      } = this.props;

      nav.onClickViewLoanActionsHistory(e, row, history, params, location.state);
    }
  };

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
    const { intl: { formatMessage } } = this.props;

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
      'feefineIncurred': loan => this.getFeeFine(loan),
      'callNumber': loan => (<div data-test-list-call-numbers>{effectiveCallNumber(loan)}</div>),
      'Contributors': (loan) => {
        const contributorsList = this.getContributorslist(loan);
        const contributorsListString = contributorsList.join(' ');
        // Truncate if no of contributors > 2
        const listTodisplay = (contributorsList === '-') ? '-' : (contributorsList.length > 2) ? `${contributorsList[0]}, ${contributorsList[1]}...` : `${contributorsListString.substring(0, contributorsListString.length - 2)}`;
        return (contributorsList.length > 2) ?
          (
            <Popover>
              <div data-role="target" className={css.pointer}>{listTodisplay}</div>
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
        return loan.returnDate
          ? (<FormattedTime
              value={loan.returnDate}
              day="numeric"
              month="numeric"
              year="numeric"
          />)
          : '-';
      },
      'checkinServicePoint': loan => _.get(loan, ['checkinServicePoint', 'name'], '-'),
      ' ': loan => {
        return <Dropdown
          usePortal
          renderTrigger={({ getTriggerProps }) => (
            <IconButton
              {...getTriggerProps()}
              icon="ellipsis"
              aria-label={formatMessage({ id: 'ui-users.action' })}
            />
          )}
          renderMenu={this.renderDropDownMenu(loan)}
        />;
      }
    };
  }

  handleOptionsChange = itemMeta => {
    const { loan, action } = itemMeta;

    if (action && this[action]) {
      this[action](loan);
    }
  };

  feefineDetails = (loan, e) => {
    const { history, match: { params } } = this.props;

    const accounts = _.get(this.props.resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    if (accountsLoan.length === 1) {
      nav.onClickViewAccountActionsHistory(e, { id: accountsLoan[0].id }, history, params);
    } else if (accountsLoan.length > 1) {
      const open = accountsLoan.filter(a => a.status.name === 'Open') || [];
      if (open.length === accountsLoan.length) {
        nav.onClickViewOpenAccounts(e, loan, history, params);
      } else if (open.length === 0) {
        nav.onClickViewClosedAccounts(e, loan, history, params);
      } else {
        nav.onClickViewAllAccounts(e, loan, history, params);
      }
    }
  };

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
      const { item } = record;
      const contributors = item?.contributors;

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

  renderDropDownMenu = loan => () => {
    const {
      stripes,
      match: { params },
    } = this.props;

    const accounts = _.get(this.props.resources, ['loanAccount', 'records'], []);
    const accountsLoan = accounts.filter(a => a.loanId === loan.id) || [];
    const itemDetailsLink = loan.item && `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`;
    const buttonDisabled = !stripes.hasPerm('ui-users.feesfines.actions.all');

    return (
      <DropdownMenu data-role="menu">
        {itemDetailsLink &&
          <IfPermission perm="inventory.items.item.get">
            <Button
              buttonStyle="dropdownItem"
              to={itemDetailsLink}
            >
              <FormattedMessage id="ui-users.itemDetails" />
            </Button>
          </IfPermission>
        }
        <Button
          data-testid="newFeeFineButton"
          disabled={buttonDisabled}
          buttonStyle="dropdownItem"
          to={getChargeFineToLoanPath(params.id, loan.id)}
        >
          <FormattedMessage id="ui-users.loans.newFeeFine" />
        </Button>
        <Button
          data-testid="feeFineDetailsButton"
          disabled={_.isEmpty(accountsLoan)}
          buttonStyle="dropdownItem"
          onClick={() => {
            this.handleOptionsChange({ loan, action: 'feefineDetails' });
          }}
        >
          <FormattedMessage id="ui-users.loans.feeFineDetails" />
        </Button>
      </DropdownMenu>
    );
  };

  render() {
    const {
      sortOrder,
      sortDirection,
      anonymizationErrorModalOpen,
      failedAnonymizationLoansCount,
    } = this.state;
    const {
      loans,
    } = this.props;

    const visibleColumns = ['title', 'dueDate', 'barcode', 'feefineIncurred', 'callNumber', 'Contributors', 'renewals', 'loanDate', 'returnDate', 'checkinServicePoint', ' '];
    const anonymizeString = <FormattedMessage id="ui-users.anonymize" />;
    const loansSorted = _.orderBy(loans,
      [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const clonedLoans = _.cloneDeep(loans);
    const recordsToCSV = this.buildRecords(clonedLoans);

    const columnWidths = {
      'title': { max: 200 },
      'dueDate': { max: 150 },
      'barcode': { max: 140 },
      'feefineIncurred': { max: 100 },
      'callNumber': { max: 110 },
      'Contributors': { max: 170 },
      'renewals': { max: 90 },
      'loanDate': { max: 150 },
      'returnDate': { max: 150 },
      'checkinServicePoint': { max: 150 },
      ' ': { max: 35 }
    };

    return (
      <div
        data-test-closed-loans
        role="tabpanel"
        id="closed-loans-list-panel"
      >
        <ActionsBar
          show={loans.length > 0}
          contentStart={
            <Label>
              <FormattedMessage
                id="ui-users.closedLoansCount"
                values={{ count: loans.length }}
              />
            </Label>
          }
          contentEnd={
            <IntlConsumer>
              {intl => (
                <div>
                  <IfPermission perm="ui-users.loans.anonymize">
                    <Button
                      marginBottom0
                      id="anonymize-all"
                      onClick={this.anonymizeLoans}
                    >
                      {anonymizeString}
                    </Button>
                  </IfPermission>
                  <ExportCsv
                    data={recordsToCSV}
                    onlyFields={this.columnHeadersMap}
                  />
                  <ErrorModal
                    id="anonymization-fees-fines-modal"
                    open={anonymizationErrorModalOpen}
                    label={intl.formatMessage({ id: 'ui-users.anonymization.confirmation.header' })}
                    message={intl.formatMessage(
                      { id: 'ui-users.anonymization.confirmation.message' },
                      { amount: failedAnonymizationLoansCount }
                    )}
                    onClose={this.closeLoansAnonymizationErrorModal}
                  />
                </div>
              )}
            </IntlConsumer>
          }
        />
        <MultiColumnList
          id="list-loanshistory"
          fullWidth
          formatter={this.getLoansFormatter()}
          columnWidths={columnWidths}
          visibleColumns={visibleColumns}
          columnMapping={this.columnMapping}
          onHeaderClick={this.onSort}
          columnOverflow={{ ' ': true }}
          contentData={loansSorted}
          sortOrder={sortOrder[0]}
          sortDirection={`${sortDirection[0]}ending`}
          onRowClick={this.onRowClick}
          totalCount={loansSorted.length}
        />
      </div>
    );
  }
}

export default injectIntl(ClosedLoans);
