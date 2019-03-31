import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';
import {
  Callout,
  ConfirmationModal
} from '@folio/stripes/components';
import CancellationModal from './CancellationModal';
import PayModal from './PayModal';
import PayManyModal from './PayManyModal';
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
      records: 'waivers',
      path: 'waives',
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?query=cql.allRecords=1&limit=100',
    },
    feefineTypes: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines?query=cql.allRecords=1&limit=100',
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
    onChangeSelectedAccounts: PropTypes.func,
    actions: PropTypes.object,
    onChangeActions: PropTypes.func,
    stripes: PropTypes.object,
    handleEdit: PropTypes.func,
    user: PropTypes.object,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      showConfirmDialog: false,
      values: {},
      submitting: false,
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
    const nextAccounts = nextProps.selectedAccounts || [];
    if (props.selectedAccounts !== nextProps.selectedAccounts) this.setState({ accounts: nextAccounts });
    return props.accounts !== nextProps.accounts ||
      props.actions !== nextProps.actions ||
      props.selectedAccounts !== nextProps.selectedAccounts ||
      this.state !== nextState;
  }

  showCalloutMessage({ amount, paymentStatus }) {
    const { user } = this.props;
    const formattedAmount = parseFloat(amount).toFixed(2);
    const fullName = getFullName(user);

    const message = (
      <SafeHTMLMessage
        id="ui-users.accounts.actions.cancellation.success"
        values={{
          count: 1,
          amount: formattedAmount,
          action: (paymentStatus.name || '').toLowerCase(),
          user: fullName
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
      submitting: false,
    });
    this.setState({ accounts: this.props.selectedAccounts || [] });
  }

  onCloseWaive() {
    this.props.onChangeActions({
      waiveModal: false,
      waiveMany: false,
      submitting: false,
    });
    this.setState({ accounts: this.props.selectedAccounts || [] });
  }

  onCloseWarning = () => {
    this.props.onChangeActions({
      regular: false,
      waiveMany: false,
    });
    this.setState({ accounts: this.props.selectedAccounts || [] });
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
    const { intl: { formatMessage } } = this.props;
    const canceled = formatMessage({ id: 'ui-users.accounts.cancelError' });
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const type = this.props.accounts[0] || {};
    delete type.rowIndex;
    this.props.mutator.activeRecord.update({ id: type.id });
    const comment = tagStaff + ': ' + values.comment;
    this.newAction({}, type.id, canceled, type.amount, comment, 0, 0, type.feeFineOwner);
    this.editAccount(type, canceled, 'Closed', 0.00)
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

  onPayMany = (values, items) => {
    let amount = parseFloat(values.amount);
    let offset = 0;
    const promises = [];
    const selected = _.orderBy(items, ['remaining'], ['asc']) || [];
    let partialAmounts = this.partialAmount(amount, selected.length);
    selected.forEach((item, index) => {
      const promise = new Promise((resolve, reject) => {
        if (partialAmounts[index - offset] >= item.remaining) {
          offset++;
          partialAmounts = this.partialAmount(amount - item.remaining, selected.length - offset);
          amount -= item.remaining;
          this.pay(item, item.remaining, values).then(() => {
            this.showCalloutMessage(item);
            resolve();
          }).catch(reject);
        } else {
          this.pay(item, partialAmounts[index - offset], values).then(() => {
            this.showCalloutMessage(item);
            resolve();
          }).catch(reject);
        }
      });
      promises.push(promise);
    });

    Promise.all(promises).then(() => {
      this.props.handleEdit(1);
      this.onClosePay();
    });
  }

  pay = (type, payment, values) => {
    const { intl: { formatMessage } } = this.props;
    this.props.mutator.activeRecord.update({ id: type.id });
    let paymentStatus = _.capitalize(formatMessage({ id: 'ui-users.accounts.actions.warning.payAction' }));
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const tagPatron = formatMessage({ id: 'ui-users.accounts.actions.tag.patron' });
    const action = { paymentMethod: values.method };
    if (payment < type.remaining) {
      paymentStatus = `${paymentStatus} ${_.capitalize(formatMessage({ id: 'ui-users.accounts.status.partially' }))}`;
    } else {
      paymentStatus = `${paymentStatus} ${_.capitalize(formatMessage({ id: 'ui-users.accounts.status.fully' }))}`;
      type.status.name = 'Closed';
    }
    const balance = type.remaining - parseFloat(payment);
    let c = '';
    if (values.comment) {
      c = tagStaff + ': ' + values.comment;
    }
    if (values.patronInfo && values.notify) {
      c = c + '\n' + tagPatron + ': ' + values.patronInfo;
    }
    return this.editAccount(type, paymentStatus, type.status.name, balance)
      .then(() => this.newAction(action, type.id, paymentStatus, payment, c, balance, values.transaction, type.feeFineOwner));
  }

  onClickWaive(values) {
    const type = this.props.accounts[0] || {};
    delete type.rowIndex;
    this.waive(type, values.waive, values)
      .then(() => this.props.handleEdit(1))
      .then(() => this.showCalloutMessage(type))
      .then(() => this.onCloseWaive());
  }

  onWaiveMany = (values, items) => {
    let waive = parseFloat(values.waive);
    let offset = 0;
    const promises = [];
    const selected = _.orderBy(items, ['remaining'], ['asc']) || [];
    let partialAmounts = this.partialAmount(waive, selected.length);
    selected.forEach((item, index) => {
      const promise = new Promise((resolve, reject) => {
        if (partialAmounts[index - offset] >= item.remaining) {
          offset++;
          partialAmounts = this.partialAmount(waive - item.remaining, selected.length - offset);
          waive -= item.remaining;
          this.waive(item, item.remaining, values).then(() => {
            this.showCalloutMessage(item);
            resolve();
          }).catch(reject);
        } else {
          this.waive(item, partialAmounts[index - offset], values).then(() => {
            this.showCalloutMessage(item);
            resolve();
          }).catch(reject);
        }
      });
      promises.push(promise);
    });

    Promise.all(promises).then(() => {
      this.props.handleEdit(1);
      this.onCloseWaive();
    });
  }

  waive = (type, waive, values) => {
    const { intl: { formatMessage } } = this.props;
    this.props.mutator.activeRecord.update({ id: type.id });
    let paymentStatus = _.capitalize(formatMessage({ id: 'ui-users.accounts.actions.warning.waiveAction' }));
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const action = { paymentMethod: values.method };
    if (waive < type.remaining) {
      paymentStatus = `${paymentStatus} ${_.capitalize(formatMessage({ id: 'ui-users.accounts.status.partially' }))}`;
    } else {
      paymentStatus = `${paymentStatus} ${_.capitalize(formatMessage({ id: 'ui-users.accounts.status.fully' }))}`;
      type.status.name = 'Closed';
    }
    const balance = type.remaining - parseFloat(waive);
    const comment = values.comment ? (tagStaff + ': ' + values.comment) : '';
    return this.editAccount(type, paymentStatus, type.status.name, balance)
      .then(() => this.newAction(action, type.id, paymentStatus, waive, comment, balance, 0, type.feeFineOwner));
  }

  onClickComment(values) {
    const { intl: { formatMessage } } = this.props;
    const info = formatMessage({ id: 'ui-users.accounts.comment.staffInfo' });
    const account = this.props.accounts[0] || '';
    const id = this.props.accounts[0].id || '';
    const createAt = this.props.accounts[0].feeFineOwner || '';
    const balance = this.props.balance || 0;
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const comment = tagStaff + ': ' + values.comment;
    this.props.mutator.activeRecord.update({ id });
    this.newAction({}, id, info, 0, comment, balance, 0, createAt);
    this.editAccount(account, account.paymentStatus.name, account.status.name, balance)
      .then(() => this.props.handleEdit(1))
      .then(() => this.onCloseComment());
  }

  onChangeAccounts = (accounts) => {
    this.props.onChangeSelectedAccounts(accounts);
    this.setState({ accounts: accounts || [] });
  }

  partialAmount = (total, n) => {
    const amount = total / n;
    const amounts = Array(n);
    const stringAmount = amount.toString();
    const decimal = stringAmount.indexOf('.');
    if (decimal === -1) { return amounts.fill(amount); }
    const rounding = stringAmount.substring(0, decimal + 3);
    amounts.fill(parseFloat(rounding));
    let partialAmount = stringAmount.substring(decimal + 3);
    partialAmount = '0.' + '0'.repeat(stringAmount.length - partialAmount.length - decimal - 1) + partialAmount;
    partialAmount = parseFloat(partialAmount);
    partialAmount = parseFloat(partialAmount * n).toFixed(2);
    amounts[0] += parseFloat(partialAmount);
    return amounts;
  }

  showConfirmDialog = (values) => {
    this.setState({
      showConfirmDialog: true,
      values
    });

    return new Promise((resolve, reject) => {
      this.actionResolve = resolve;
      this.actionReject = reject;
    });
  }

  hideConfirmDialog = () => {
    this.setState({
      showConfirmDialog: false,
      values: {}
    });
  }

  onConfirm = () => {
    const { actions, selectedAccounts } = this.props;
    const { values } = this.state;

    if (actions.pay) {
      this.onClickPay(values);
    } else if (actions.regular) {
      this.onPayMany(values, selectedAccounts);
    } else if (actions.waiveModal) {
      this.onClickWaive(values);
    } else if (actions.waiveMany) {
      this.onWaiveMany(values, selectedAccounts);
    }
    this.setState({ submitting: true });

    this.hideConfirmDialog();
  }

  renderConfirmHeading = () => {
    const { actions: { pay, regular }, intl: { formatMessage } } = this.props;
    return (
      <FormattedMessage
        id="ui-users.accounts.confirmation.head"
        values={{ action: (pay || regular)
          ? formatMessage({ id: 'ui-users.accounts.actions.payment' })
          : formatMessage({ id: 'ui-users.accounts.actions.waive' }) }}
      />
    );
  }

  renderConfirmMessage = () => {
    const { actions: { pay, regular, waiveModal, waiveMany }, intl: { formatMessage } } = this.props;
    const { values } = this.state;
    const amount = (pay || regular) ? values.amount : values.waive;
    let paymentStatus = (pay || regular)
      ? formatMessage({ id: 'ui-users.accounts.actions.warning.payAction' })
      : formatMessage({ id: 'ui-users.accounts.actions.warning.waiveAction' });
    if (pay || waiveModal) {
      const account = this.props.accounts[0] || {};
      const total = account.remaining || 0;
      paymentStatus = `${((amount < total)
        ? formatMessage({ id: 'ui-users.accounts.status.partially' })
        : formatMessage({ id: 'ui-users.accounts.status.fully' }))} ${paymentStatus}`;
      return (
        <SafeHTMLMessage
          id="ui-users.accounts.confirmation.message"
          values={{ count: 1, amount, action: paymentStatus }}
        />
      );
    } else if (regular || waiveMany) {
      const accounts = this.props.selectedAccounts || [];
      const total = accounts.reduce((selected, { remaining }) => {
        return selected + parseFloat(remaining);
      }, 0);
      paymentStatus = `${((amount < total)
        ? formatMessage({ id: 'ui-users.accounts.status.partially' })
        : formatMessage({ id: 'ui-users.accounts.status.fully' }))} ${paymentStatus}`;
      return (
        <SafeHTMLMessage
          id="ui-users.accounts.confirmation.message"
          values={{ count: accounts.length, amount, action: paymentStatus }}
        />
      );
    }
    return '';
  }

  render() {
    const {
      actions,
      stripes,
      resources
    } = this.props;
    const {
      accounts,
      showConfirmDialog,
      submitting
    } = this.state;

    const payments = _.get(resources, ['payments', 'records'], []);
    const owners = _.get(resources, ['owners', 'records'], []);
    const feefines = _.get(resources, ['feefineTypes', 'records'], []);
    const waives = _.get(resources, ['waives', 'records'], []);
    const settings = _.get(resources, ['commentRequired', 'records', 0], {});
    const warning = accounts.filter(a => a.status.name === 'Closed').length !== 0 && (actions.regular || actions.waiveMany);
    const warningModalLabelId = actions.regular
      ? 'ui-users.accounts.actions.payFeeFine'
      : 'ui-users.accounts.actions.waiveFeeFine';

    return (
      <div>
        <FormattedMessage id={warningModalLabelId}>
          {label => (
            <WarningModal
              open={warning && !submitting}
              accounts={accounts}
              onChangeAccounts={this.onChangeAccounts}
              stripes={stripes}
              onClose={this.onCloseWarning}
              label={label}
            />
          )}
        </FormattedMessage>
        <CancellationModal
          open={actions.cancellation}
          onClose={this.onCloseCancellation}
          user={this.props.user}
          stripes={this.props.stripes}
          account={this.props.accounts[0] || {}}
          onSubmit={(values) => { this.onClickCancellation(values); }}
        />
        <PayModal
          open={actions.pay || (actions.regular && accounts.length === 1)}
          commentRequired={settings.paid}
          onClose={this.onClosePay}
          account={[this.type]}
          stripes={this.props.stripes}
          balance={this.props.balance}
          accounts={(actions.pay) ? this.props.accounts : accounts}
          payments={payments}
          onSubmit={(values) => { this.showConfirmDialog(values); }}
          owners={owners}
          feefines={feefines}
        />
        <PayManyModal
          open={actions.regular && !warning && accounts.length > 1}
          commentRequired={settings.paid}
          onClose={this.onClosePay}
          account={[this.type]}
          stripes={this.props.stripes}
          balance={this.props.balance}
          accounts={accounts}
          payments={payments}
          onSubmit={(values) => { this.showConfirmDialog(values); }}
          owners={owners}
        />
        <WaiveModal
          open={actions.waiveModal || (actions.waiveMany && !warning)}
          commentRequired={settings.waived}
          onClose={this.onCloseWaive}
          stripes={this.props.stripes}
          accounts={(actions.waiveModal) ? this.props.accounts : accounts}
          balance={this.props.balance}
          waives={waives}
          onSubmit={(values) => { this.showConfirmDialog(values); }}
        />
        <CommentModal
          open={actions.comment}
          stripes={this.props.stripes}
          onClose={this.onCloseComment}
          onSubmit={(values) => { this.onClickComment(values); }}
        />
        <ConfirmationModal
          open={showConfirmDialog}
          heading={this.renderConfirmHeading()}
          message={(showConfirmDialog) ? this.renderConfirmMessage() : ''}
          onConfirm={this.onConfirm}
          onCancel={this.hideConfirmDialog}
          cancelLabel={<FormattedMessage id="ui-users.accounts.cancellation.field.back" />}
          confirmLabel={<FormattedMessage id="ui-users.accounts.cancellation.field.confirm" />}
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
      </div>
    );
  }
}

export default injectIntl(Actions);
