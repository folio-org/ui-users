import _ from 'lodash';
import React from 'react';
import {
  FormattedMessage,
  FormattedTime,
} from 'react-intl';
import Link from 'react-router-dom/Link';
import PropTypes from 'prop-types';

import {
  Paneset,
  Pane,
  Button,
  Row,
  Col,
  KeyValue,
  MultiColumnList,
} from '@folio/stripes/components';

import { Actions } from './components/Accounts/Actions';
import { getFullName } from './util';

import css from './AccountsHistory.css';

const columnWidths = {
  action: 250,
  amount: 100,
  balance: 100,
  transactioninfo: 200,
  created: 100,
  source: 200,
  comments: 700
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

class AccountActionsHistory extends React.Component {
  static manifest = Object.freeze({
    accountHistory: {
      type: 'okapi',
      resource: 'accounts',
      path: 'accounts/%{activeRecord.accountId}',
    },
    accountActions: {
      type: 'okapi',
      records: 'feefineactions',
      accumulate: 'true',
      path: 'feefineactions?query=(accountId=%{activeRecord.accountId})&limit=50',
    },
    activeRecord: {
      accountId: '0',
    },
  });

  static propTypes = {
    stripes: PropTypes.object,
    resources: PropTypes.shape({
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
    account: PropTypes.object,
    num: PropTypes.number.isRequired,
    user: PropTypes.object,
    history: PropTypes.object,
    patronGroup: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
    handleAddRecords: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const {
      stripes: { connect },
    } = props;
    this.onSort = this.onSort.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    this.connectedActions = connect(Actions);
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
      },
      sortOrder: [...columns],
      sortDirection: ['desc', 'desc'],
    };
  }

  componentDidMount() {
    const { history } = this.props;
    const str = history.location.search || '';
    const n = str.indexOf('account=');
    const id = str.substring(n + 8, n + 44);
    this.props.mutator.activeRecord.update({ accountId: id, records: this.num });
    this.getAccountActions();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props;
    const nextAccounts = _.get(nextProps.resources, ['accountHistory', 'records', 0], {});
    const accounts = _.get(props.resources, ['accountHistory', 'records', 0], {});
    const nextActions = _.get(nextProps.resources, ['accountActions', 'records'], []);
    const actions = _.get(props.resources, ['accountActions', 'records'], []);

    if (this.num !== nextProps.num) {
      props.mutator.activeRecord.update({ records: nextProps.num });
      this.num = nextProps.num;
    }
    return nextAccounts !== accounts || nextActions !== actions ||
      this.num !== nextProps.num || props.user !== nextProps.user ||
      props.account !== nextProps.account ||
      this.state !== nextState;
  }

  getAccountActions = () => {
    return this.props.mutator.accountActions.GET().then(records => {
      this.setState({
        data: records,
      });
    });
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

  onSort(e, meta) {
    if (!this.sortMap[meta.alias]) return;

    let { sortOrder, sortDirection } = this.state;

    if (sortOrder[0] !== meta.alias) {
      sortOrder = [meta.alias, sortOrder[1]];
      sortDirection = ['asc', sortDirection[1]];
    } else {
      const direction = (sortDirection[0] === 'desc') ? 'asc' : 'desc';
      sortDirection = [direction, sortDirection[1]];
    }
    this.setState({ sortOrder, sortDirection });
  }

  render() {
    const {
      sortOrder,
      sortDirection,
    } = this.state;

    const {
      handleAddRecords,
      onCancel,
      onClickViewLoanActionsHistory,
      patronGroup: patron,
      resources,
      stripes,
      user,
    } = this.props;

    const account = _.get(resources, ['accountHistory', 'records', 0]) || this.props.account;

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
            buttonClass={css.addCommentBtn}
            onClick={this.comment}
          >
            <FormattedMessage id="ui-users.accounts.button.new" />
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
      created: action => action.createdAt,
      source: action => action.source,
      comments: action => action.comments,
    };

    const actions = this.state.data || [];
    const actionsSort = _.orderBy(actions, [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const amount = (account.amount) ? parseFloat(account.amount).toFixed(2) : '-';
    const remaining = (account.remaining) ? parseFloat(account.remaining).toFixed(2) : '0.00';
    const loanId = account.loanId || '';
    const disabled = (_.get(account, ['status', 'name'], '') === 'Closed');
    const isAccountId = actions[0] && actions[0].accountId === account.id;

    return (
      <Paneset isRoot>
        <Pane
          id="pane-loandetails"
          defaultWidth="100%"
          dismissible
          onClose={onCancel}
          paneTitle={(
            <FormattedMessage id="ui-users.details.paneTitle.feeFineDetails">
              {(msg) => `${msg} - ${getFullName(user)} (${_.upperFirst(patron.group)}) `}
            </FormattedMessage>
          )}
        >
          <Row>
            <Col xs={12}>
              <Button
                disabled={disabled}
                buttonStyle="primary"
                onClick={this.pay}
              >
                <FormattedMessage id="ui-users.accounts.history.button.pay" />
              </Button>
              <Button
                disabled={disabled}
                buttonStyle="primary"
                onClick={this.waive}
              >
                <FormattedMessage id="ui-users.accounts.history.button.waive" />
              </Button>
              <Button
                disabled
                buttonStyle="primary"
              >
                <FormattedMessage id="ui-users.accounts.history.button.refund" />
              </Button>
              <Button
                disabled
                buttonStyle="primary"
              >
                <FormattedMessage id="ui-users.accounts.history.button.transfer" />
              </Button>
              <Button
                disabled={disabled}
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
                value={remaining}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.latest" />}
                value={_.get(account, ['paymentStatus', 'name'], '-')}
              />
            </Col>
            <Col xs={1.5}>
              {(loanId !== '0' && user.id === account.userId) ?
                <KeyValue
                  label={<FormattedMessage id="ui-users.details.label.loanDetails" />}
                  value={(
                    <button
                      buttonClass={css.btnView}
                      type="button"
                      onClick={(e) => {
                        onClickViewLoanActionsHistory(e, { id: loanId });
                      }}
                    >
                      <FormattedMessage id="ui-users.details.field.loan" />
                    </button>
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
          <Row>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.instance" />}
                value={_.get(account, ['title'], '-')}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.type" />}
                value={_.get(account, ['materialType'], '-')}
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.barcode" />}
                value={
                  <Link
                    to={`/inventory/view/${_.get(account, ['itemId'], '')}?query=${_.get(account, ['itemId'], '')}`}
                  >
                    {_.get(account, ['barcode'], '-')}
                  </Link>
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
                  <FormattedTime
                    value={account.dueDate}
                    day="numeric"
                    month="numeric"
                    year="numeric"
                  /> || '-'
                }
              />
            </Col>
            <Col xs={1.5}>
              <KeyValue
                label={<FormattedMessage id="ui-users.details.field.returnedate" />}
                value={
                  account.returnedDate ?
                    <FormattedTime
                      value={account.returnedDate}
                      day="numeric"
                      month="numeric"
                      year="numeric"
                    /> : '-'
                }
              />
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
          <this.connectedActions
            actions={this.state.actions}
            onChangeActions={this.onChangeActions}
            user={user}
            stripes={stripes}
            balance={account.remaining || 0}
            accounts={[account]}
            handleEdit={() => {
              this.getAccountActions();
              handleAddRecords();
            }}
          />

        </Pane>
      </Paneset>
    );
  }
}

export default AccountActionsHistory;
