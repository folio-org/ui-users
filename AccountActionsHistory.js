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

const sortMap = {
  'Action Date': action => action.dateAction,
  'Action': action => action.typeAction,
  'Amount': action => action.amountAction,
  'Balance': action => action.balance,
  'Transaction number': action => action.transactionNumber,
  'Created at': action => action.createdAt,
  'Source': action => action.source,
  'Comments': action => action.comments,
};


class AccountActionsHistory extends React.Component {
  static manifest = Object.freeze({
    accountActions: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions?query=(accountId=%{activeRecord.accountId})',
    },
    activeRecord: {
      accountId: '0',
    },
  });

  static propTypes = {
    stripes: PropTypes.object.isRequired,
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
    }),
    account: PropTypes.object,
    user: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);

    this.state = {
      actions: {
        pay: false,
        cancellation: false,
        waiveModal: false,
        comment: false,
      },
      checkedAccounts: {},
      sortOrder: ['Action Date'],
      sortDirection: ['desc', 'asc'],
      message: {},
      source: '',
      id: '',
    };

    this.onSort = this.onSort.bind(this);
    this.onChangeActions = this.onChangeActions.bind(this);
    this.connectedActions = props.stripes.connect(Actions);
    this.error = this.error.bind(this);
    this.comment = this.comment.bind(this);
    this.accounts = [this.props.account];
  }

  componentDidMount() {
    const { account } = this.props;
    const accountId = (account) ? account.id : '';
    this.props.mutator.activeRecord.update({ accountId });
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
    if (!sortMap[meta.alias]) return;

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
    const { onCancel, account, stripes } = this.props;

    const user = this.props.user;

    const columnMapping = {
      Comments: (<span>Comments<Button style={{ float: 'right', marginLeft: '50px' }} onClick={this.comment}>+ New</Button></span>),
    };

    const accountActionsFormatter = {
      // Action: aa => loanActionMap[la.action],
      'Action Date': action => formatDateTime(action.dateAction, stripes.locale),
      'Action': action => action.typeAction,
      'Amount': action => action.amountAction || '-',
      'Balance': action => action.balance || '-',
      'Transaction number': action => action.transactionNumber,
      'Created at': action => action.createdAt,
      'Source': action => action.source,
      'Comments': action => action.comments,
    };

    const actions = _.get(this.props.resources, ['accountActions', 'records'], []);
    const actionsSort = _.orderBy(actions, [sortMap[sortOrder[0]], sortMap[sortOrder[1]]], sortDirection);

    return (
      <Paneset isRoot>
        <Pane
          id="pane-loandetails"
          defaultWidth="100%"
          dismissible
          onClose={onCancel}
          paneTitle={<Link to={`/users/view/${user.id}`}>{getFullName(user)}</Link>}
        >
          <Row>
            <Col xs={12}>
              <Button buttonStyle="primary" onClick={this.pay}>Pay</Button>
              <Button buttonStyle="primary" onClick={this.waive}>Waive</Button>
              <Button buttonStyle="primary">Refund</Button>
              <Button buttonStyle="primary">Transfer</Button>
              <Button buttonStyle="primary" onClick={this.error}>Error</Button>
              <img alt="" src="https://png.icons8.com/ios/25/666666/upload.png" />
            </Col>
          </Row>

          <Row>
            <Col xs={2} >
              <KeyValue label="Fee/fine type" value={_.get(account, ['feeFineType'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Fee/fine owner" value={_.get(account, ['feeFineOwner'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Charge date" value={_.get(account, ['dateCreated'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Original fee/fine" value={_.get(account, ['charged'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Outstanding amount" value={_.get(account, ['remaining'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Loan details" value="" />
            </Col>
          </Row>
          <Row>
            <Col xs={2} >
              <KeyValue label="Item type" value={_.get(account, ['itemType'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Instance" value={_.get(account, ['item'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Barcode (falta el ID)" value={<Link to={`/inventory/view/${_.get(account, ['itemId'], '')}?query=${_.get(account, ['itemId'], '')}`}>{_.get(account, ['barcode'], '')}</Link>} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Call number" value={_.get(account, ['callNumber'], '')} />
            </Col>
            <Col xs={2} >
              <KeyValue label="Location" value="" />
            </Col>
          </Row>
          <br />
          <MultiColumnList
            id="list-accountactions"
            formatter={accountActionsFormatter}
            columnMapping={columnMapping}
            visibleColumns={['Action Date', 'Action', 'Amount', 'Balance', 'Transaction number', 'Created at', 'Source', 'Comments']}
            contentData={actionsSort}
            fullWidth
            onHeaderClick={this.onSort}
            sortOrder={sortOrder[0]}
            sortDirection={`${sortDirection[0]}ending`}
            columnWidths={{ 'Action': 100, 'Amount': 100, 'Balance': 100, 'Transaction number': 100, 'Created at': 100, 'Source': 200, 'Comments': 700 }}
          />

          <this.connectedActions
            actions={this.state.actions}
            onChangeActions={this.onChangeActions}
            user={this.props.user}
            accounts={this.accounts}
          />
        </Pane>
      </Paneset>
    );
  }
}

export default AccountActionsHistory;

