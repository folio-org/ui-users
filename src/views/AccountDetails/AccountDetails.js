import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
} from 'react-intl';

import {
  Button,
  Callout,
  Col,
  KeyValue,
  MultiColumnList,
  NoValue,
  Pane,
  Paneset,
  Row,
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes-core';

import Actions from '../../components/Accounts/Actions/FeeFineActions';
import {
  calculateSortParams,
  getFullName,
  formatActionDescription,
  formatCurrencyAmount,
  getServicePointOfCurrentAction,
  isRefundAllowed,
} from '../../components/util';

import {
  calculateTotalPaymentAmount,
  isCancelAllowed,
} from '../../components/Accounts/accountFunctions';
import FeeFineReport from '../../components/data/reports/FeeFineReport';
import {
  itemStatuses,
  refundClaimReturned,
} from '../../constants';

import css from './AccountDetails.css';

const columnWidths = {
  date: 100,
  action: 100,
  amount: 100,
  balance: 100,
  transactioninfo: 200,
  created: 100,
  source: 150,
  comments: 420
};

const columns = [
  'date',
  'action',
  'amount',
  'balance',
  'transactioninfo',
  'created',
  'source',
  'comments',
];

class AccountDetails extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
    resources: PropTypes.shape({
      feefineshistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      accountActions: PropTypes.object,
      accounts: PropTypes.object.isRequired,
      feefineactions: PropTypes.object.isRequired,
      loans: PropTypes.object.isRequired,
    }),
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }),
      feefineactions: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      accountActions: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }),
    }),
    num: PropTypes.number.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.object,
    match: PropTypes.object,
    patronGroup: PropTypes.shape({
      group: PropTypes.string.isRequired,
    }).isRequired,
    itemDetails: PropTypes.object,
    okapi: PropTypes.shape({
      currentUser: PropTypes.shape({
        servicePoints: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }).isRequired,
    account: PropTypes.object,
    owedAmount: PropTypes.number,
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    itemDetails: {},
    account: {},
    owedAmount: 0,
  }

  constructor(props) {
    super(props);
    this.onSort = this.onSort.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    this.error = this.error.bind(this);
    this.comment = this.comment.bind(this);
    this.num = props.num;
    this.sortMap = {
      date: action => action.dateAction,
      action: action => action.typeAction,
      amount: action => action.amountAction,
      balance: action => action.balance,
      transactioninfo: action => action.transactionInformation,
      created: action => action.createdAt,
      source: action => action.source,
      comments: action => action.comments,
    };

    this.state = {
      data: [],
      actions: {
        pay: false,
        cancellation: false,
        waive: false,
        waiveModal: false,
        comment: false,
        regular: false,
        transferModal: false,
        refundModal: false,
        refundMany: false,
      },
      sortOrder: ['date', 'date'],
      sortDirection: ['desc', 'desc'],
      remaining: 0,
      exportReportInProgress: false,
    };

    this.callout = null;
  }

  static getDerivedStateFromProps(props) {
    const {
      resources,
    } = props;

    const accountActivity = _.uniqBy(resources?.accountActions?.records || [], action => action.id);
    const sortData = _.orderBy(accountActivity, ['dateAction'], ['desc']);
    const balance = (sortData[0] || {}).balance;
    let paymentStatus;
    if (sortData.length === 1) {
      paymentStatus = 'Outstanding';
    } else {
      for (let i = 0; i < sortData.length; i++) {
        paymentStatus = (sortData[i] || {}).typeAction;
        if (paymentStatus !== 'Comment') {
          break;
        }
      }
    }

    return {
      data: accountActivity,
      remaining: balance,
      paymentStatus,
    };
  }

  onChangeActions(actions) {
    this.setState({ actions });
  }

  waive = () => {
    this.onChangeActions({ waiveModal: true });
  }

  pay = () => {
    this.onChangeActions({ pay: true });
  }

  error() {
    this.onChangeActions({ cancellation: true });
  }

  comment() {
    this.onChangeActions({ comment: true });
  }

  transfer = () => {
    this.onChangeActions({ transferModal: true });
  }

  refund = () => {
    this.onChangeActions({ refundModal: true });
  }

  getFeesFinesReportData = () => {
    const {
      user,
      okapi: {
        currentUser: {
          servicePoints,
        },
      },
      patronGroup: {
        group,
      },
      resources,
      intl,
    } = this.props;
    const feeFineActions = _.get(resources, ['feefineactions', 'records'], []);
    const accounts = _.get(resources, ['accounts', 'records'], []);
    const loans = _.get(resources, ['loans', 'records'], []);

    return {
      intl,
      data: {
        user,
        servicePoints,
        patronGroup: group,
        accounts,
        loans,
        feeFineActions,
      },
    };
  }

  generateFeesFinesReport = () => {
    const feesFinesReportData = this.getFeesFinesReportData();
    const {
      exportReportInProgress,
    } = this.state;

    if (exportReportInProgress) {
      return;
    }

    this.setState({
      exportReportInProgress: true,
    }, () => {
      this.callout.sendCallout({
        type: 'success',
        message: <FormattedMessage id="ui-users.reports.inProgress" />,
      });

      try {
        const report = new FeeFineReport(feesFinesReportData);
        report.toCSV();
      } catch (error) {
        if (error) {
          this.callout.sendCallout({
            type: 'error',
            message: <FormattedMessage id="ui-users.settings.limits.callout.error" />,
          });
        }
      } finally {
        this.setState({
          exportReportInProgress: false,
        });
      }
    });
  };

  onSort(e, meta) {
    if (!this.sortMap[meta.name] || e.target.type === 'button' || e.target.id === 'button') return;

    const {
      sortOrder,
      sortDirection,
    } = this.state;

    this.setState(calculateSortParams({
      sortOrder,
      sortDirection,
      sortValue: meta.name,
      secondarySortOrderIndex: 1,
      secondarySortDirectionIndex: 1,
    }));
  }

  getInstanceInfo = () => {
    const { account } = this.props;
    const instanceTitle = account?.title;
    const instanceType = account?.materialType;
    const instanceTypeString = instanceType ? `(${instanceType})` : '';

    return instanceTitle ? `${instanceTitle} ${instanceTypeString}` : '-';
  }

  handleClose = () => {
    const {
      account,
      history,
      match: { params },
    } = this.props;

    const status = account?.status?.name?.toLowerCase() || 'all';

    history.push({ pathname: `/users/${params.id}/accounts/${status}` });
  };

  render() {
    const {
      sortOrder,
      sortDirection,
    } = this.state;

    const {
      account,
      owedAmount,
      patronGroup: patron,
      resources,
      stripes,
      match: { params },
      user,
      itemDetails,
    } = this.props;

    const allAccounts = _.get(resources, ['feefineshistory', 'records'], []);
    const loan = _.get(resources, ['loans', 'records'], []).filter((l) => l.id === account.loanId);
    const loanPolicyId = loan[0]?.loanPolicyId;
    const loanPolicyName = loan[0]?.loanPolicy.name;

    // not all accounts are attached to loans. for those that are
    const hasLoan = !!account.barcode;

    // after loan anonymization, the loan will be empty but the barcode will not be
    const isLoanAnonymized = loan.length === 0 && hasLoan;
    let balance = 0;

    allAccounts.forEach((a) => {
      if (a.paymentStatus.name !== refundClaimReturned.PAYMENT_STATUS) {
        balance += (parseFloat(a.remaining) * 100);
      }
    });

    balance /= 100;

    account.remaining = this.state.remaining;

    const columnMapping = {
      date: <FormattedMessage id="ui-users.details.columns.date" />,
      action: <FormattedMessage id="ui-users.details.columns.action" />,
      amount: <FormattedMessage id="ui-users.details.columns.amount" />,
      balance: <FormattedMessage id="ui-users.details.columns.balance" />,
      transactioninfo: <FormattedMessage id="ui-users.details.columns.transactioninfo" />,
      created: <FormattedMessage id="ui-users.details.columns.created" />,
      source: <FormattedMessage id="ui-users.details.columns.source" />,
      comments: (
        <span className={css.commentsWrapper}>
          <FormattedMessage id="ui-users.details.columns.comments" />
          <IfPermission perm="ui-users.feesfines.actions.all">
            <Button
              id="accountActionHistory-add-comment"
              buttonClass={css.addCommentBtn}
              onClick={this.comment}
            >
              <span id="button"><FormattedMessage id="ui-users.details.button.new" /></span>
            </Button>
          </IfPermission>
        </span>
      ),
    };

    const accountActionsFormatter = {
      // Action: aa => loanActionMap[la.action],
      date: action => <FormattedTime value={action.dateAction} day="numeric" month="numeric" year="numeric" />,
      action: action => formatActionDescription(action),
      amount: action => (action.amountAction > 0 ? formatCurrencyAmount(action.amountAction) : '-'),
      balance: action => (action.balance > 0 ? formatCurrencyAmount(action.balance) : '-'),
      transactioninfo: action => action.transactionInformation || '-',
      created: action => getServicePointOfCurrentAction(action, this.props.okapi.currentUser.servicePoints),
      source: action => action.source,
      comments: action => (action.comments ? (<div>{action.comments.split('\n').map(c => (<Row><Col>{c}</Col></Row>))}</div>) : ''),
    };

    const isAccountsPending = _.get(resources, ['accounts', 'isPending'], true);
    const isActionsPending = _.get(resources, ['accountActions', 'isPending'], true);
    const feeFineActions = _.get(resources, ['feefineactions', 'records'], []);
    const allFeeFineActions = _.get(resources, ['feefineactions', 'records'], []);
    const latestPaymentStatus = account.paymentStatus.name;
    const isClaimReturnedItem = (itemDetails?.statusItemName === itemStatuses.CLAIMED_RETURNED);

    const actions = this.state.data || [];
    const actionsSort = _.orderBy(actions, [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const amount = account.amount ? formatCurrencyAmount(account.amount) : '-';
    const loanId = account.loanId || '';
    const disabled = account.remaining === 0;
    const isAccountId = actions[0] && actions[0].accountId === account.id;
    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');

    const overdueFinePolicyId = itemDetails?.overdueFinePolicyId;
    const overdueFinePolicyName = itemDetails?.overdueFinePolicyName;
    const lostItemPolicyId = itemDetails?.lostItemPolicyId;
    const lostItemPolicyName = itemDetails?.lostItemPolicyName;
    const contributors = itemDetails?.contributors?.join('; ');

    const totalPaidAmount = calculateTotalPaymentAmount(resources?.feefineshistory?.records, feeFineActions);
    const refundAllowed = isRefundAllowed(account, feeFineActions);
    const cancelAllowed = isCancelAllowed(account);

    // the loan-details display is special.
    // other loan-related fields use <NoValue /> when a loan has been anonymized,
    // but the loan-details value needs to show "Anonymized" instead.
    // OTOH, if an account was never attached to a loan in the first place,
    // then the loan-details value _should_ be <NoValue />.
    let loanDetailsValue = <NoValue />;
    if (hasLoan) {
      if (isLoanAnonymized) {
        loanDetailsValue = <FormattedMessage id="ui-users.details.label.loanAnonymized" />;
      } else if (stripes.hasPerm('ui-users.loans.view')) {
        loanDetailsValue = (
          <Link
            to={`/users/${params.id}/loans/view/${loanId}`}
          >
            <FormattedMessage id="ui-users.details.field.loan" />
          </Link>
        );
      } else {
        loanDetailsValue = <FormattedMessage id="ui-users.details.field.loan" />;
      }
    }

    // if an account record includes a barcode, itemId, holdingsRecordId, and
    // instanceId then we can link to it. An account may not have those fields
    // if, for instance, it isn't associated with a loan at all, the loan it
    // was associated with has been anonymized, or the user in question simply
    // doesn't have permission to view inventory records.
    let itemBarcodeLink = <NoValue />;
    if (account.barcode && account.instanceId && account.holdingsRecordId && account.itemId) {
      itemBarcodeLink = (
        <Link
          to={`/inventory/view/${account.instanceId}/${account.holdingsRecordId}/${account.itemId}`}
        >
          {account.barcode}
        </Link>);
    } else if (account.barcode) {
      itemBarcodeLink = account.barcode;
    }

    return (
      <Paneset isRoot>
        <Pane
          data-test-fee-fine-details
          id="pane-account-action-history"
          defaultWidth="100%"
          dismissible
          onClose={this.handleClose}
          paneTitle={(
            <FormattedMessage id="ui-users.details.paneTitle.feeFineDetails">
              {(msg) => `${msg} - ${getFullName(user)} (${_.upperFirst(patron.group)}) `}
            </FormattedMessage>
          )}
        >
          <Row>
            <Col xs={12}>
              <Button
                id="payAccountActionsHistory"
                disabled={disabled || buttonDisabled || isActionsPending || isAccountsPending || isClaimReturnedItem}
                buttonStyle="primary"
                onClick={this.pay}
              >
                <FormattedMessage id="ui-users.accounts.history.button.pay" />
              </Button>
              <Button
                id="waiveAccountActionsHistory"
                disabled={disabled || buttonDisabled || isActionsPending || isAccountsPending || isClaimReturnedItem}
                buttonStyle="primary"
                onClick={this.waive}
              >
                <FormattedMessage id="ui-users.accounts.history.button.waive" />
              </Button>
              <Button
                id="refundAccountActionsHistory"
                disabled={!refundAllowed || buttonDisabled || isActionsPending || isAccountsPending || isClaimReturnedItem}
                buttonStyle="primary"
                onClick={this.refund}
              >
                <FormattedMessage id="ui-users.accounts.history.button.refund" />
              </Button>
              <Button
                id="transferAccountActionsHistory"
                disabled={disabled || buttonDisabled || isActionsPending || isAccountsPending || isClaimReturnedItem}
                buttonStyle="primary"
                onClick={this.transfer}
              >
                <FormattedMessage id="ui-users.accounts.history.button.transfer" />
              </Button>
              <Button
                id="errorAccountActionsHistory"
                disabled={disabled || buttonDisabled || isActionsPending || isAccountsPending || !cancelAllowed || isClaimReturnedItem}
                buttonStyle="primary"
                onClick={this.error}
              >
                <FormattedMessage id="ui-users.accounts.button.error" />
              </Button>
              <Button
                id="exportAccountActionsHistoryReport"
                data-test-export-account-actions-history-report
                buttonStyle="primary"
                disabled={_.isEmpty(allFeeFineActions)}
                onClick={this.generateFeesFinesReport}
              >
                <FormattedMessage id="ui-users.export.button" />
              </Button>
            </Col>
          </Row>

          <Row>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.feetype" />}
                value={_.get(account, ['feeFineType'], '-')}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.owner" />}
                value={_.get(account, ['feeFineOwner'], '-')}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.billedate" />}
                value={(
                  _.get(account, ['metadata', 'createdDate'])
                    ? <FormattedTime
                        value={_.get(account, ['metadata', 'createdDate'])}
                        day="numeric"
                        month="numeric"
                        year="numeric"
                    />
                    : '-'
                )}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.billedamount" />}
                value={amount}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.remainingamount" />}
                value={formatCurrencyAmount(this.state.remaining)}
              />
            </Col>
            <Col
              data-test-latest-payment-status
              xs={1.5}
            >
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.latest" />}
                value={latestPaymentStatus}
              />
            </Col>
            <Col xs={1.5} sm={3} md={3} lg={3}>
              <KeyValue
                label={<FormattedMessage id="ui-users.feefines.details.dateClose" />}
                value="-"
              />
            </Col>
          </Row>
          <Row>
            <Col
              data-test-instance
              xs={1.5}
            >
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.instance.type" />}
                value={this.getInstanceInfo()}
              />
            </Col>
            <Col
              data-test-contributors
              xs={1.5}
            >
              <KeyValue
                label={<FormattedMessage id="ui-users.reports.overdue.item.contributors" />}
                value={contributors || '-'}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.barcode" />}
                value={itemBarcodeLink}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.callnumber" />}
                value={_.get(account, ['callNumber'], '-')}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.location" />}
                value={_.get(account, ['location'], '-')}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.duedate" />}
                value={
                  account.dueDate
                    ? <FormattedTime
                        value={account.dueDate}
                        day="numeric"
                        month="numeric"
                        year="numeric"
                    />
                    : '-'
                }
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.returnedate" />}
                value={
                  account.returnedDate
                    ? <FormattedTime
                        value={account.returnedDate}
                        day="numeric"
                        month="numeric"
                        year="numeric"
                    />
                    : '-'
                }
              />
            </Col>
            <Col
              data-testid="loan-details"
              xs={1.5}
            >
              <KeyValue
                label={<FormattedMessage id="ui-users.details.label.loanDetails" />}
                value={loanDetailsValue}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={1.5} sm={1.5} md={1.5} lg={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.loanPolicy" />}
                value={loanPolicyId
                  ? <Link to={`/settings/circulation/loan-policies/${loanPolicyId}`}>{loanPolicyName}</Link>
                  : '-'
                }
              />
            </Col>
            <Col
              data-test-overdue-policy
              xs={1.5}
              sm={1.5}
              md={1.5}
              lg={1.5}
            >
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.overduePolicy" />}
                value={overdueFinePolicyId
                  ? <Link to={`/settings/circulation/fine-policies/${overdueFinePolicyId}`}>{overdueFinePolicyName}</Link>
                  : '-'
                }
              />
            </Col>
            <Col
              data-test-lost-item-policy
              xs={1.5}
              sm={1.5}
              md={1.5}
              lg={1.5}
            >
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.lostItemPolicy" />}
                value={lostItemPolicyId
                  ? <Link to={`/settings/circulation/lost-item-fee-policy/${lostItemPolicyId}`}>{lostItemPolicyName}</Link>
                  : '-'
                }
              />
            </Col>
            <Col xs={1.5} sm={1.5} md={1.5} lg={1.5} xsOffset={6} smOffset={6} mdOffset={6} lgOffset={6} />
          </Row>
          <br />
          <MultiColumnList
            id="list-accountactions"
            formatter={accountActionsFormatter}
            columnMapping={columnMapping}
            visibleColumns={columns}
            contentData={isAccountId ? actionsSort : []}
            fullWidth
            sortOrder={sortOrder[0]}
            sortDirection={`${sortDirection[0]}ending`}
            columnWidths={columnWidths}
            onHeaderClick={this.onSort}
          />
          <Actions
            actions={this.state.actions}
            onChangeActions={this.onChangeActions}
            user={user}
            stripes={stripes}
            balance={balance}
            totalPaidAmount={totalPaidAmount}
            owedAmount={owedAmount}
            accounts={[account]}
            handleEdit={() => {
              // Neither of the following two functions exists after refactoring
              // done for v2.26.0. This was causing an error when attempting to
              // do a fine payment/waiver. But payment/waiving seems to work
              // perfectly well without them. ¯\_(ツ)_/¯
              // this.getAccountActions();
              // handleAddRecords();
              this.props.mutator.accountActions.GET();
            }}
          />
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default injectIntl(AccountDetails);
