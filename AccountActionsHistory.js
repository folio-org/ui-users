import _ from 'lodash';
import React from 'react';
import Link from 'react-router-dom/Link';
import PropTypes from 'prop-types';

import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';

import { Actions } from './lib/Accounts/Actions';
import { formatDateTime, getFullName } from './util';

class AccountActionsHistory extends React.Component {
  static manifest = Object.freeze({
    account: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=id=%{activeRecord.accountId}&limit=1',
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
    stripes: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      intl: PropTypes.object.isRequired,
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
    user: PropTypes.object,
    history: PropTypes.object,
    patronGroup: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    onClickViewLoanActionsHistory: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.onSort = this.onSort.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    this.connectedActions = props.stripes.connect(Actions);
    this.error = this.error.bind(this);
    this.comment = this.comment.bind(this);

    const { stripes } = props;

    this.sortMap = {
      [stripes.intl.formatMessage({ id: 'ui-users.details.columns.date' })]: action => action.dateAction,
      [stripes.intl.formatMessage({ id: 'ui-users.details.columns.action' })]: action => action.typeAction,
      [stripes.intl.formatMessage({ id: 'ui-users.details.columns.amount' })]: action => action.amountAction,
      [stripes.intl.formatMessage({ id: 'ui-users.details.columns.balance' })]: action => action.balance,
      [stripes.intl.formatMessage({ id: 'ui-users.details.columns.number' })]: action => action.transactionNumber,
      [stripes.intl.formatMessage({ id: 'ui-users.details.columns.created' })]: action => action.createdAt,
      [stripes.intl.formatMessage({ id: 'ui-users.details.columns.source' })]: action => action.source,
      [stripes.intl.formatMessage({ id: 'ui-users.details.columns.comments' })]: action => action.comments,
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
      checkedAccounts: {},
      sortOrder: [
        stripes.intl.formatMessage({ id: 'ui-users.details.columns.date' }),
        stripes.intl.formatMessage({ id: 'ui-users.details.columns.action' }),
        stripes.intl.formatMessage({ id: 'ui-users.details.columns.amount' }),
        stripes.intl.formatMessage({ id: 'ui-users.details.columns.balance' }),
        stripes.intl.formatMessage({ id: 'ui-users.details.columns.number' }),
        stripes.intl.formatMessage({ id: 'ui-users.details.columns.created' }),
        stripes.intl.formatMessage({ id: 'ui-users.details.columns.source' }),
        stripes.intl.formatMessage({ id: 'ui-users.details.columns.comments' }),
      ],
      sortDirection: ['desc', 'asc'],
      message: {},
      source: '',
      id: '',
    };
  }

  componentDidMount() {
    const { history } = this.props;
    const str = history.location.search || '';
    const n = str.indexOf('account=');
    const id = str.substring(n + 8, n + 44);
    this.props.mutator.activeRecord.update({ accountId: id });
    this.getAccountActions();
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
    this.setState({ ...this.state, sortOrder, sortDirection });
  }

  render() {
    const { sortOrder, sortDirection } = this.state;
    const { onCancel, stripes } = this.props;
    const account = _.get(this.props.resources, ['account', 'records', 0]) || this.props.account;

    const user = this.props.user;
    const patron = this.props.patronGroup;

    const columnMapping = {
      Comments: (<span>{this.props.stripes.intl.formatMessage({ id: 'ui-users.details.columns.comments' })}<Button style={{ float: 'right', marginLeft: '50px' }} onClick={this.comment}>+ New</Button></span>),
    };

    const accountActionsFormatter = {
      // Action: aa => loanActionMap[la.action],
      'Action Date': action => formatDateTime(action.dateAction, stripes.locale),
      'Action': action => action.typeAction + (action.paymentMethod ? ('-' + action.paymentMethod) : ' '),
      'Amount': action => (action.amountAction > 0 ? parseFloat(action.amountAction).toFixed(2) : '-'),
      'Balance': action => (action.balance > 0 ? parseFloat(action.balance).toFixed(2) : '-'),
      'Transaction information': action => action.transactionNumber || '-',
      'Created at': action => action.createdAt,
      'Source': action => action.source,
      'Comments': action => action.comments,
    };

    const actions = this.state.data || [];
    const actionsSort = _.orderBy(actions, [this.sortMap[sortOrder[0]], this.sortMap[sortOrder[1]]], sortDirection);
    const amount = (account.amount) ? parseFloat(account.amount).toFixed(2) : '-';
    const remaining = (account.remaining) ? parseFloat(account.remaining).toFixed(2) : '0.00';
    const loanId = account.loanId || '';
    const disabled = (_.get(account, ['status', 'name'], '') === 'Closed');

    return (
      <Paneset isRoot>
        <Pane
          id="pane-loandetails"
          defaultWidth="100%"
          dismissible
          onClose={onCancel}
          paneTitle={`Fees/Fines - ${getFullName(user)} (${_.upperFirst(patron.group)}) `}
        >
          <Row>
            <Col xs={12}>
              <Button disabled={disabled} buttonStyle="primary" onClick={this.pay}>Pay</Button>
              <Button disabled={disabled} buttonStyle="primary" onClick={this.waive}>Waive</Button>
              <Button disabled buttonStyle="primary">Refund</Button>
              <Button disabled buttonStyle="primary">Transfer</Button>
              <Button disabled={disabled} buttonStyle="primary" onClick={this.error}>Error</Button>
            </Col>
          </Row>

          <Row>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.feetype' })} value={_.get(account, ['feeFineType'], '-')} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.owner' })} value={_.get(account, ['feeFineOwner'], '-')} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.billedate' })} value={_.get(account, ['metadata', 'createdDate']) ? formatDateTime(_.get(account, ['metadata', 'createdDate'])) : '-'} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.billedamount' })} value={amount} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.remainingamount' })} value={remaining} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.latest' })} value={_.get(account, ['paymentStatus', 'name'], '-')} />
            </Col>
            <Col xs={1.5} >
              {(loanId !== 0) ?
                <KeyValue
                  label="Loan details"
                  value={
                    <button onClick={(e) => { this.props.onClickViewLoanActionsHistory(e, { id: loanId }); }}>
                      {this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.loan' })}
                    </button>}
                />
                :
                <KeyValue
                  label="Loan details"
                  value={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.loan' })}
                />
              }
            </Col>
          </Row>
          <Row>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.instance' })} value={_.get(account, ['title'], '-')} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.type' })} value={_.get(account, ['materialType'], '-')} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.barcode' })} value={<Link to={`/inventory/view/${_.get(account, ['itemId'], '')}?query=${_.get(account, ['itemId'], '')}`}>{_.get(account, ['barcode'], '-')}</Link>} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.callnumber' })} value={_.get(account, ['callNumber'], '-')} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.location' })} value={_.get(account, ['location'], '-')} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.duedate' })} value={formatDateTime(account.dueDate) || '-'} />
            </Col>
            <Col xs={1.5} >
              <KeyValue label={this.props.stripes.intl.formatMessage({ id: 'ui-users.details.field.returnedate' })} value={formatDateTime(account.returnedDate) || '-'} />
            </Col>
          </Row>
          <br />
          <MultiColumnList
            id="list-accountactions"
            formatter={accountActionsFormatter}
            columnMapping={columnMapping}
            visibleColumns={['Action Date', 'Action', 'Amount', 'Balance', 'Transaction information', 'Created at', 'Source', 'Comments']}
            contentData={(account.id === (actions[0] || {}).accountId) ? actionsSort : []}
            fullWidth
            onHeaderClick={this.onSort}
            sortOrder={sortOrder[0]}
            sortDirection={`${sortDirection[0]}ending`}
            columnWidths={{ 'Action': 250, 'Amount': 100, 'Balance': 100, 'Transaction information': 200, 'Created at': 100, 'Source': 200, 'Comments': 700 }}
          />
          <this.connectedActions
            actions={this.state.actions}
            onChangeActions={this.onChangeActions}
            user={this.props.user}
            balance={account.remaining || 0}
            accounts={[account]}
            handleEdit={this.getAccountActions}
          />

        </Pane>
      </Paneset>
    );
  }
}

export default AccountActionsHistory;

