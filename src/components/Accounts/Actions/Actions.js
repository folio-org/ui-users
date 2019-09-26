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

import { calculateSelectedAmount, loadServicePoints } from '../accountFunctions';
import CancellationModal from './CancellationModal';
import CommentModal from './CommentModal';
import WarningModal from './WarningModal';
import ActionModal from './ActionModal';
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
      path: 'payments?limit=100',
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
    transfers: {
      type: 'okapi',
      records: 'transfers',
      path: 'transfers?limit=100',
    },
    curUserServicePoint: {
      type: 'okapi',
      path: 'service-points-users?query=(userId==!{currentUser.id})',
      records: 'servicePointsUsers',
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
    layer: PropTypes.string,
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
    this.onSubmit = this.onSubmit.bind(this);
    this.onSubmitMany = this.onSubmitMany.bind(this);
    this.onCloseActionModal = this.onCloseActionModal.bind(this);
    this.onCloseComment = this.onCloseComment.bind(this);
    this.onClickComment = this.onClickComment.bind(this);
    this.callout = null;
  }

  static getDerivedStateFromProps(props, state) {
    if (props.selectedAccounts !== state.accounts && props.selectedAccounts) {
      return { accounts: props.selectedAccounts };
    }
    return null;
  }

  componentDidMount() {
    this.props.mutator.user.update({ id: this.props.user.id });
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

  onCloseWarning = () => {
    this.props.onChangeActions({
      regular: false,
      waiveMany: false,
      transferMany: false,
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

  assembleTagInfo = (values) => {
    const { intl: { formatMessage } } = this.props;
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const tagPatron = formatMessage({ id: 'ui-users.accounts.actions.tag.patron' });
    let tagInfo = '';
    if (values.comment) {
      tagInfo = `${tagStaff} : ${values.comment}`;
    }

    if (values.patronInfo) {
      tagInfo = `${tagInfo} \n ${tagPatron} : ${values.patronInfo}`;
    }
    return tagInfo;
  }

  onClickCancellation(values) {
    const { intl: { formatMessage } } = this.props;
    const canceled = formatMessage({ id: 'ui-users.accounts.cancelError' });
    const type = this.props.accounts[0] || {};
    delete type.rowIndex;
    this.props.mutator.activeRecord.update({ id: type.id });
    this.newAction({}, type.id, canceled, type.amount, this.assembleTagInfo(values), 0, 0, type.feeFineOwner);
    this.editAccount(type, canceled, 'Closed', 0.00)
      .then(() => this.props.handleEdit(1))
      .then(() => this.showCalloutMessage(type))
      .then(() => this.onCloseCancellation());
  }

  onClickComment(values) {
    const { intl: { formatMessage } } = this.props;
    const info = formatMessage({ id: 'ui-users.accounts.comment.staffInfo' });
    const account = this.props.accounts[0] || '';
    const id = this.props.accounts[0].id || '';
    const createAt = this.props.accounts[0].feeFineOwner || '';
    const balance = this.props.balance || 0;
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const comment = `${tagStaff} : ${values.comment}`;
    this.props.mutator.activeRecord.update({ id });
    this.newAction({}, id, info, 0, comment, balance, 0, createAt);
    this.editAccount(account, account.paymentStatus.name, account.status.name, balance)
      .then(() => this.props.handleEdit(1))
      .then(() => this.onCloseComment());
  }

  onSubmit(values, action) {
    const type = this.props.accounts[0] || {};
    delete type.rowIndex;
    this.action(type, values.amount, values, action)
      .then(() => this.props.handleEdit(1))
      .then(() => this.showCalloutMessage(type))
      .then(() => this.onCloseActionModal());
  }

  onSubmitMany = (values, items, action) => {
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
          this.action(item, item.remaining, values, action).then(() => {
            this.showCalloutMessage(item);
            resolve();
          }).catch(reject);
        } else {
          this.action(item, partialAmounts[index - offset], values, action).then(() => {
            this.showCalloutMessage(item);
            resolve();
          }).catch(reject);
        }
      });
      promises.push(promise);
    });

    Promise.all(promises).then(() => {
      this.props.handleEdit(1);
      this.onCloseActionModal();
    });
  }

  action = (type, amount, values, action) => {
    const { intl: { formatMessage } } = this.props;
    this.props.mutator.activeRecord.update({ id: type.id });
    let paymentStatus = _.capitalize(formatMessage({ id: `ui-users.accounts.actions.warning.${action}Action` }));
    const owners = _.get(this.props.resources, ['owners', 'records'], []);
    if (amount < type.remaining) {
      paymentStatus = `${paymentStatus} ${formatMessage({ id: 'ui-users.accounts.status.partially' })}`;
    } else {
      paymentStatus = `${paymentStatus} ${formatMessage({ id: 'ui-users.accounts.status.fully' })}`;
      type.status.name = 'Closed';
    }
    const balance = type.remaining - parseFloat(amount);
    const createdAt = (owners.find(o => o.id === values.ownerId) || {}).owner;
    return this.editAccount(type, paymentStatus, type.status.name, balance)
      .then(() => this.newAction({ paymentMethod: values.method }, type.id, paymentStatus, amount, this.assembleTagInfo(values), balance, values.transaction, createdAt || type.feeFineOwner));
  }

  onCloseActionModal() {
    this.props.onChangeActions({
      pay: false,
      regular: false,
      waiveModal: false,
      waiveMany: false,
      transferModal: false,
      transferMany: false,
    });
    this.setState({
      accounts: this.props.selectedAccounts || [],
      submitting: false
    });
  }

  onConfirm = () => {
    const { actions, selectedAccounts } = this.props;
    const { values } = this.state;

    if (actions.pay) {
      this.onSubmit(values, 'payment');
    } else if (actions.regular) {
      this.onSubmitMany(values, selectedAccounts, 'payment');
    } else if (actions.waiveModal) {
      this.onSubmit(values, 'waive');
    } else if (actions.waiveMany) {
      this.onSubmitMany(values, selectedAccounts, 'waive');
    } else if (actions.transferModal) {
      this.onSubmit(values, 'transfer');
    } else if (actions.transferMany) {
      this.onSubmitMany(values, selectedAccounts, 'transfer');
    }
    this.setState({ submitting: true });

    this.hideConfirmDialog();
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

  renderConfirmHeading = () => {
    const { actions: { pay, regular, waiveModal, waiveMany, transferModal, transferMany }, intl: { formatMessage } } = this.props;
    let action = '';
    if (pay || regular) {
      action = formatMessage({ id: 'ui-users.accounts.actions.payment' });
    } else if (waiveModal || waiveMany) {
      action = formatMessage({ id: 'ui-users.accounts.actions.waive' });
    } else if (transferModal || transferMany) {
      action = formatMessage({ id: 'ui-users.accounts.actions.transfer' });
    }

    return (
      <FormattedMessage
        id="ui-users.accounts.confirmation.head"
        values={{ action }}
      />
    );
  }

  renderConfirmMessage = () => {
    const { actions: { pay, regular, waiveModal, waiveMany, transferModal, transferMany }, intl: { formatMessage } } = this.props;
    const { values } = this.state;
    const amount = values.amount;
    let paymentStatus = (pay || regular)
      ? formatMessage({ id: 'ui-users.accounts.actions.warning.paymentAction' })
      : (waiveModal || waiveMany)
        ? formatMessage({ id: 'ui-users.accounts.actions.warning.waiveAction' })
        : formatMessage({ id: 'ui-users.accounts.actions.warning.transferAction' });
    if (pay || waiveModal || transferModal) {
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
    } else if (regular || waiveMany || transferMany) {
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
      resources,
      layer
    } = this.props;
    const {
      accounts,
      showConfirmDialog,
      submitting
    } = this.state;

    const amount = calculateSelectedAmount((actions.pay || actions.waiveModal || actions.transferModal) ? this.props.accounts : accounts);

    const defaultServicePointId = _.get(resources, ['curUserServicePoint', 'records', 0, 'defaultServicePointId'], '-');
    const servicePointsIds = _.get(resources, ['curUserServicePoint', 'records', 0, 'servicePointsIds'], []);
    const payments = _.get(resources, ['payments', 'records'], []);
    const owners = _.get(resources, ['owners', 'records'], []).filter(o => o.owner !== 'Shared');
    const feefines = _.get(resources, ['feefineTypes', 'records'], []);
    const waives = _.get(resources, ['waives', 'records'], []);
    const transfers = _.get(resources, ['transfers', 'records'], []);
    const settings = _.get(resources, ['commentRequired', 'records', 0], {});
    const warning = accounts.filter(a => a.status.name === 'Closed').length !== 0 && (actions.regular || actions.waiveMany || actions.transferMany) && layer === 'all-accounts';
    const warningModalLabelId = actions.regular
      ? 'ui-users.accounts.actions.payFeeFine'
      : actions.waiveMany
        ? 'ui-users.accounts.actions.waiveFeeFine'
        : actions.transferMany
          ? 'ui-users.accounts.actions.transferFeeFine'
          : 'ui-users.accounts.history.button.refund';

    const ownerId = loadServicePoints({ owners, defaultServicePointId, servicePointsIds });
    const initialValues = { ownerId, amount, notify: true };
    const modals = [
      { action: 'payment', item: actions.pay, label: 'nameMethod', data: payments, comment: 'paid', open: actions.pay || (actions.regular && accounts.length === 1) },
      { action: 'payment', form: 'payment-many-modal', label: 'nameMethod', accounts, data: payments, comment: 'paid', open: actions.regular && !warning && accounts.length > 1 },
      { action: 'waive', item: actions.waiveModal, label: 'nameReason', data: waives, comment: 'waived', open: actions.waiveModal || (actions.waiveMany && !warning) },
      { action: 'transfer', item: actions.transferModal, label: 'accountName', data: transfers, comment: 'transferredManually', open: actions.transferModal || (actions.transferMany && !warning) }
    ];

    return (
      <div>
        <FormattedMessage id={warningModalLabelId}>
          {label => (
            <WarningModal
              id="actions-warning-modal"
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
          account={this.props.accounts[0] || {}}
          onSubmit={(values) => { this.onClickCancellation(values); }}
          owners={owners}
          feefines={feefines}
        />
        {modals.map(m => (
          <ActionModal
            {...m}
            intl={this.props.intl}
            initialValues={initialValues}
            commentRequired={settings[m.comment]}
            form={m.form ? m.form : `${m.action}-modal`}
            onClose={this.onCloseActionModal}
            defaultServicePointId={defaultServicePointId}
            servicePointsIds={servicePointsIds}
            balance={parseFloat(this.props.balance).toFixed(2)}
            accounts={(m.accounts) ? m.accounts : ((m.item) ? this.props.accounts : accounts)}
            onSubmit={(values) => { this.showConfirmDialog(values); }}
            owners={owners}
            feefines={feefines}
          />
        ))}
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
