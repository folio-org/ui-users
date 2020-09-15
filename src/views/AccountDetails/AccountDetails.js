import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FormattedMessage,
  FormattedTime,
} from 'react-intl';

import {
  Paneset,
  Pane,
  Button,
  Row,
  Col,
  KeyValue,
  MultiColumnList,
  NoValue,
} from '@folio/stripes/components';

import Actions from '../../components/Accounts/Actions/FeeFineActions';
import {
  getFullName,
  calculateSortParams,
} from '../../components/util';

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
      accountHistory: PropTypes.object,
      accountActions: PropTypes.object,
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
    user: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
    patronGroup: PropTypes.object,
    itemDetails: PropTypes.object,
    okapi: PropTypes.object,
  };

  static defaultProps = {
    itemDetails: {},
  }

  constructor(props) {
    super(props);
    this.onSort = this.onSort.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    // this.connectedActions = connect(Actions);
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
      },
      sortOrder: ['date', 'date'],
      sortDirection: ['desc', 'desc'],
      remaining: 0,
      paymentStatus: '',
    };
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
    this.setState({
      actions,
    });
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
    const { resources } = this.props;
    const account = resources?.accountHistory?.records[0] ?? {};
    const instanceTitle = account?.title;
    const instanceType = account?.materialType;
    const instanceTypeString = instanceType ? `(${instanceType})` : '';

    return instanceTitle ? `${instanceTitle} ${instanceTypeString}` : '-';
  }

  handleClose = () => {
    const {
      history,
      match: { params },
      resources
    } = this.props;

    const account = _.get(resources, ['accountHistory', 'records', 0]) || {};
    const status = account?.status?.name?.toLowerCase() || 'all';

    history.push({ pathname: `/users/${params.id}/accounts/${status}` });
  };

  render() {
    const {
      sortOrder,
      sortDirection,
    } = this.state;

    const {
      patronGroup: patron,
      resources,
      stripes,
      match: { params },
      user,
      itemDetails,
    } = this.props;

    const account = _.get(resources, ['accountHistory', 'records', 0]) || {};
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
          <Button
            id="accountActionHistory-add-comment"
            buttonClass={css.addCommentBtn}
            onClick={this.comment}
          >
            <span id="button"><FormattedMessage id="ui-users.details.button.new" /></span>
          </Button>
        </span>
      ),
    };

    const accountActionsFormatter = {
      // Action: aa => loanActionMap[la.action],
      date: action => <FormattedTime value={action.dateAction} day="numeric" month="numeric" year="numeric" />,
      action: action => action.typeAction + (action.paymentMethod ? ('-' + action.paymentMethod) : ' '),
      amount: action => (action.amountAction > 0 ? parseFloat(action.amountAction).toFixed(2) : '-'),
      balance: action => (action.balance > 0 ? parseFloat(action.balance).toFixed(2) : '-'),
      transactioninfo: action => action.transactionInformation || '-',
      created: action => {
        const servicePoint = this.props.okapi.currentUser.servicePoints.find(sp => sp.id === action.createdAt);

        return servicePoint ? servicePoint.name : action.createdAt;
      },
      source: action => action.source,
      comments: action => (action.comments ? (<div>{action.comments.split('\n').map(c => (<Row><Col>{c}</Col></Row>))}</div>) : ''),
    };

    const isAccountsPending = _.get(resources, ['accountHistory', 'isPending'], true);
    const isActionsPending = _.get(resources, ['accountActions', 'isPending'], true);

    const actions = this.state.data || [];
    const actionsSort = _.orderBy(actions, [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const amount = (account.amount) ? parseFloat(account.amount).toFixed(2) : '-';
    const loanId = account.loanId || '';
    const disabled = account.remaining === 0;
    const isAccountId = actions[0] && actions[0].accountId === account.id;
    const buttonDisabled = !this.props.stripes.hasPerm('ui-users.feesfines.actions.all');

    const overdueFinePolicyId = itemDetails?.overdueFinePolicyId;
    const overdueFinePolicyName = itemDetails?.overdueFinePolicyName;
    const lostItemPolicyId = itemDetails?.lostItemPolicyId;
    const lostItemPolicyName = itemDetails?.lostItemPolicyName;
    const contributors = itemDetails?.contributors.join(', ');

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
                disabled={disabled || buttonDisabled || isActionsPending || isAccountsPending}
                buttonStyle="primary"
                onClick={this.pay}
              >
                <FormattedMessage id="ui-users.accounts.history.button.pay" />
              </Button>
              <Button
                id="waiveAccountActionsHistory"
                disabled={disabled || buttonDisabled || isActionsPending || isAccountsPending}
                buttonStyle="primary"
                onClick={this.waive}
              >
                <FormattedMessage id="ui-users.accounts.history.button.waive" />
              </Button>
              <Button
                id="refundAccountActionsHistory"
                disabled
                buttonStyle="primary"
              >
                <FormattedMessage id="ui-users.accounts.history.button.refund" />
              </Button>
              <Button
                id="transferAccountActionsHistory"
                disabled={disabled || buttonDisabled || isActionsPending || isAccountsPending}
                buttonStyle="primary"
                onClick={this.transfer}
              >
                <FormattedMessage id="ui-users.accounts.history.button.transfer" />
              </Button>
              <Button
                id="errorAccountActionsHistory"
                disabled={disabled || buttonDisabled || isActionsPending || isAccountsPending}
                buttonStyle="primary"
                onClick={this.error}
              >
                <FormattedMessage id="ui-users.accounts.button.error" />
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
                value={parseFloat(this.state.remaining).toFixed(2)}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.latest" />}
                value={this.state.paymentStatus}
              />
            </Col>
            <Col
              data-test-overdue-policy
              xs={1.5}
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
            >
              <KeyValue
                label={<FormattedMessage id="ui-users.loans.details.lostItemPolicy" />}
                value={lostItemPolicyId
                  ? <Link to={`/settings/circulation/lost-item-fee-policy/${lostItemPolicyId}`}>{lostItemPolicyName}</Link>
                  : '-'
                }
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
                value={
                  (_.get(account, ['barcode'])) ? (
                    <Link
                      to={`/inventory/view/${_.get(account, ['instanceId'], '')}/${_.get(account, ['holdingsRecordId'], '')}/${_.get(account, ['itemId'], '')}`}
                    >
                      {_.get(account, ['barcode'], '')}
                    </Link>
                  ) : <NoValue />
                }
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
            <Col xs={1.5}>
              {(loanId !== '0' && user.id === account.userId) ?
                <KeyValue
                  label={<FormattedMessage id="ui-users.details.label.loanDetails" />}
                  value={(
                    <Link
                      to={`/users/${params.id}/loans/view/${loanId}`}
                    >
                      <FormattedMessage id="ui-users.details.field.loan" />
                    </Link>
                  )}
                />
                :
                <KeyValue
                  label={<FormattedMessage id="ui-users.details.label.loanDetails" />}
                  value="-"
                />
              }
            </Col>
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
            balance={account.remaining || 0}
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

        </Pane>
      </Paneset>
    );
  }
}

export default AccountDetails;
