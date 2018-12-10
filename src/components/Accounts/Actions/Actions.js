import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';
import { Callout } from '@folio/stripes/components';
import CancellationModal from './CancellationModal';
import PayModal from './PayModal';
import WaiveModal from './WaiveModal';
import CommentModal from './CommentModal';
import WarningModal from './WarningModal';
import { getFullName } from '../../../util';

class Actions extends React.Component {
  static manifest = Object.freeze({
    commentRequired: {
      type: 'okapi',
      records: 'comments',
      path: 'comments',
    },
    accounts: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?query=(userId=%{user.id})&limit=100',
      PUT: {
        path: 'accounts/%{activeRecord.id}'
      },
    },
    feefineactions: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions',
    },
    payments: {
      type: 'okapi',
      records: 'payments',
      path: 'payments',
    },
    waives: {
      type: 'okapi',
      records: 'waiver',
      path: 'waives',
    },
    activeRecord: {},
    user: {},
  });

  static propTypes = {
    resources: PropTypes.shape({
      accounts: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      user: PropTypes.object,
      activeRecord: PropTypes.object,
      accounts: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
      feefineactions: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }),
    okapi: PropTypes.object,
    balance: PropTypes.number,
    accounts: PropTypes.arrayOf(PropTypes.object),
    selectedAccounts: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.object,
    onChangeActions: PropTypes.func,
    stripes: PropTypes.object,
    handleEdit: PropTypes.func,
    user: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
    };
    this.onCloseCancellation = this.onCloseCancellation.bind(this);
    this.onClickCancellation = this.onClickCancellation.bind(this);
    this.onClosePay = this.onClosePay.bind(this);
    this.onClickPay = this.onClickPay.bind(this);
    this.onCloseWaive = this.onCloseWaive.bind(this);
    this.onClickWaive = this.onClickWaive.bind(this);
    this.onCloseComment = this.onCloseComment.bind(this);
    this.onClickComment = this.onClickComment.bind(this);
    this.callout = null;
  }

  componentDidMount() {
    this.props.mutator.user.update({ id: this.props.user.id });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const props = this.props;
    if (props.selectedAccounts !== nextProps.selectedAccounts) this.setState({ accounts: nextProps.selectedAccounts });
    return props.accounts !== nextProps.accounts ||
      props.actions !== nextProps.actions ||
      props.selectedAccounts !== nextProps.selectedAccounts ||
      this.state !== nextState;
  }

  showCalloutMessage({ feeFineType, amount, paymentStatus }) {
    const { user } = this.props;
    const formattedAmount = parseFloat(amount).toFixed(2);
    const fullName = getFullName(user);

    const message = (
      <FormattedMessage
        id="ui-users.accounts.actions.calloutMessage"
        values={{
          amount: <strong>{formattedAmount}</strong>,
          paymentStatus: <strong>{paymentStatus.name}</strong>,
          name: <strong>{fullName}</strong>,
          feeFineType,
        }}
      />
    );
    this.callout.sendCallout({ message });
  }

  onCloseCancellation() {
    this.props.onChangeActions({
      cancellation: false,
    });
  }

  onClosePay() {
    this.props.onChangeActions({
      pay: false,
      regular: false,
    });
    this.setState({ accounts: this.props.selectedAccounts });
  }

  onCloseWaive() {
    this.props.onChangeActions({
      waiveModal: false,
      waiveMany: false,
    });
    this.setState({ accounts: this.props.selectedAccounts });
  }

  onCloseWarning = () => {
    this.props.onChangeActions({
      regular: false,
      waiveMany: false,
    });
    this.setState({ accounts: this.props.selectedAccounts });
  }

  onCloseComment() {
    this.props.onChangeActions({
      comment: false,
    });
  }

  newAction = (action, id, typeAction, amount, comment, balance, transaction, createAt) => {
    const newAction = {
      typeAction,
      source: `${this.props.okapi.currentUser.lastName}, ${this.props.okapi.currentUser.firstName}`,
      createdAt: createAt,
      accountId: id,
      dateAction: moment().format(),
      userId: this.props.user.id,
      amountAction: parseFloat(amount || 0).toFixed(2),
      balance: parseFloat(balance || 0).toFixed(2),
      transactionInformation: transaction || '-',
      comments: comment,
    };
    return this.props.mutator.feefineactions.POST(Object.assign(action, newAction));
  }

  editAccount = (account, paymentStatus, status, remaining) => {
    account.metadata.updatedDate = moment().format();
    const newAccount = {
      status: { name: status },
      paymentStatus: { name: paymentStatus },
      remaining: parseFloat(remaining || 0).toFixed(2),
    };

    return this.props.mutator.accounts.PUT(Object.assign(account, newAccount));
  }

  onClickCancellation(values) {
    const type = this.props.accounts[0] || {};
    delete type.rowIndex;
    this.props.mutator.activeRecord.update({ id: type.id });
    this.newAction({}, type.id, 'Cancelled as Error', type.amount, values.comment, 0, 0, type.feeFineOwner);
    this.editAccount(type, 'Cancelled as Error', 'Closed', 0.00)
      .then(() => this.props.handleEdit(1))
      .then(() => this.showCalloutMessage(type))
      .then(() => this.onCloseCancellation());
  }

  onClickPay(values) {
    const type = this.props.accounts[0] || {};
    delete type.rowIndex;
    this.pay(type, values.amount, values)
      .then(() => this.props.handleEdit(1))
      .then(() => this.showCalloutMessage(type))
      .then(() => this.onClosePay());
  }

  onPayMany = (values) => {
    const selected = _.orderBy(this.props.selectedAccounts, ['remaining'], ['asc']);
    let payment = parseFloat(values.amount);
    selected.forEach(account => {
      if (payment > 0) {
        const type = account || {};
        delete type.rowIndex;
        if (payment < type.remaining) {
          this.pay(type, payment, values)
            .then(() => this.props.handleEdit(1))
            .then(() => this.onClosePay());
          payment = 0;
        } else {
          payment -= parseFloat(type.remaining);
          this.pay(type, type.remaining, values)
            .then(() => this.props.handleEdit(1))
            .then(() => this.onClosePay());
        }
      }
    });
  }

  pay = (type, payment, values) => {
    this.props.mutator.activeRecord.update({ id: type.id });
    let paymentStatus = 'Paid ';
    const action = { paymentMethod: values.method };
    if (payment < type.remaining) {
      paymentStatus += 'Partially';
    } else {
      paymentStatus += 'Fully';
      type.status.name = 'Closed';
    }
    const balance = type.remaining - parseFloat(payment);
    return this.editAccount(type, paymentStatus, type.status.name, balance)
      .then(() => this.newAction(action, type.id, paymentStatus, payment, values.comment, balance, values.transaction, type.feeFineOwner));
  }

  onClickWaive(values) {
    const type = this.props.accounts[0] || {};
    delete type.rowIndex;
    this.waive(type, values.waive, values)
      .then(() => this.props.handleEdit(1))
      .then(() => this.showCalloutMessage(type))
      .then(() => this.onCloseWaive());
  }

  onWaiveMany = (values) => {
    const selected = _.orderBy(this.props.selectedAccounts, ['remaining'], ['asc']);
    let waive = parseFloat(values.waive);
    selected.forEach(account => {
      if (waive > 0) {
        const type = account || {};
        delete type.rowIndex;
        if (waive < type.remaining) {
          this.waive(type, waive, values)
            .then(() => this.props.handleEdit(1))
            .then(() => this.onCloseWaive());
          waive = 0;
        } else {
          waive -= parseFloat(type.remaining);
          this.waive(type, type.remaining, values)
            .then(() => this.props.handleEdit(1))
            .then(() => this.onCloseWaive());
        }
      }
    });
  }

  waive = (type, waive, values) => {
    this.props.mutator.activeRecord.update({ id: type.id });
    let paymentStatus = 'Waived ';
    const action = { paymentMethod: values.method };
    if (waive < type.remaining) {
      paymentStatus += 'Partially';
    } else {
      paymentStatus += 'Fully';
      type.status.name = 'Closed';
    }
    const balance = type.remaining - parseFloat(waive);
    return this.editAccount(type, paymentStatus, type.status.name, balance)
      .then(() => this.newAction(action, type.id, paymentStatus, waive, values.comment, balance, 0, type.feeFineOwner));
  }

  onClickComment(values) {
    const account = this.props.accounts[0] || '';
    const id = this.props.accounts[0].id || '';
    const createAt = this.props.accounts[0].feeFineOwner || '';
    const balance = this.props.balance || 0;
    this.props.mutator.activeRecord.update({ id });
    this.newAction({}, id, 'Comment', 0, values.comment, balance, 0, createAt);
    this.editAccount(account, account.paymentStatus.name, account.status.name, balance)
      .then(() => this.props.handleEdit(1))
      .then(() => this.onCloseComment());
  }

  onChangeAccounts = (accounts) => {
    this.setState({ accounts });
  }

  render() {
    const {
      actions,
      stripes,
      resources,
    } = this.props;

    const payments = _.get(resources, ['payments', 'records'], []);
    const waives = _.get(resources, ['waives', 'records'], []);
    const settings = _.get(resources, ['commentRequired', 'records', 0], {});
    const accounts = this.state.accounts || [];
    const warning = accounts.filter(a => a.status.name === 'Closed').length !== 0 && (actions.regular || actions.waiveMany);
    const warningModalLabelId = actions.regular
      ? 'ui-users.accounts.actions.payFeeFine'
      : 'ui-users.accounts.actions.waiveFeeFine';

    return (
      <div>
        <FormattedMessage id={warningModalLabelId}>
          {label => (
            <WarningModal
              open={warning}
              accounts={accounts}
              onChangeAccounts={this.onChangeAccounts}
              stripes={stripes}
              onClose={this.onCloseWarning}
              label={label}
            />
          )}
        </FormattedMessage>
        <CancellationModal
          open={this.props.actions.cancellation}
          onClose={this.onCloseCancellation}
          user={this.props.user}
          stripes={this.props.stripes}
          account={this.props.accounts[0] || {}}
          onSubmit={(values) => { this.onClickCancellation(values); }}
        />
        <PayModal
          open={this.props.actions.pay || (this.props.actions.regular && !warning)}
          commentRequired={settings.paid}
          onClose={this.onClosePay}
          account={[this.type]}
          stripes={this.props.stripes}
          balance={this.props.balance}
          accounts={(this.props.actions.pay) ? this.props.accounts : accounts}
          payments={payments}
          onSubmit={(values) => {
            if (this.props.actions.pay) {
              this.onClickPay(values);
            } else {
              this.onPayMany(values);
            }
          }}
        />
        <WaiveModal
          open={this.props.actions.waiveModal || (this.props.actions.waiveMany && !warning)}
          commentRequired={settings.waived}
          onClose={this.onCloseWaive}
          stripes={this.props.stripes}
          accounts={(this.props.actions.waiveModal) ? this.props.accounts : accounts}
          balance={this.props.balance}
          waives={waives}
          onSubmit={(values) => {
            if (this.props.actions.waiveModal) this.onClickWaive(values);
            else this.onWaiveMany(values);
          }}
        />
        <CommentModal
          open={this.props.actions.comment}
          stripes={this.props.stripes}
          onClose={this.onCloseComment}
          onSubmit={(values) => { this.onClickComment(values); }}
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
      </div>
    );
  }
}

export default Actions;
