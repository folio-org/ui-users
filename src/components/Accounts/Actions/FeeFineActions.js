import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { stripesConnect } from '@folio/stripes/core';

// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';
import {
  Callout,
  ConfirmationModal
} from '@folio/stripes/components';

import CancellationModal from './CancellationModal';
import CommentModal from './CommentModal';
import WarningModal from './WarningModal';
import ActionModal from './ActionModal';
import { MAX_RECORDS } from '../../../constants';
import { getFullName } from '../../util';
import {
  calculateSelectedAmount,
  isRefundAllowed,
  loadServicePoints,
} from '../accountFunctions';

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
      path: `accounts?query=(userId==%{user.id})&limit=${MAX_RECORDS}`,
      PUT: {
        path: 'accounts/%{activeRecord.id}'
      },
    },
    feefineactions: {
      type: 'okapi',
      records: 'feefineactions',
      path: `feefineactions?limit=${MAX_RECORDS}`,
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
    refunds: {
      type: 'okapi',
      records: 'refunds',
      path: 'refunds',
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: `owners?query=cql.allRecords=1&limit=${MAX_RECORDS}`,
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
      path: `service-points-users?query=(userId==!{currentUser.id})&limit=${MAX_RECORDS}`,
      records: 'servicePointsUsers',
    },
    activeRecord: {},
    user: {},
    checkPay: {
      type: 'okapi',
      POST: {
        path: 'accounts/%{accountId}/check-pay',
      },
      fetch: false,
      clientGeneratePk: false,
    },
    checkWaive: {
      type: 'okapi',
      POST: {
        path: 'accounts/%{accountId}/check-waive',
      },
      fetch: false,
      clientGeneratePk: false,
    },
    checkTransfer: {
      type: 'okapi',
      POST: {
        path: 'accounts/%{accountId}/check-transfer',
      },
      fetch: false,
      clientGeneratePk: false,
    },
    checkRefund: {
      type: 'okapi',
      POST: {
        path: 'accounts/%{accountId}/check-refund',
      },
      fetch: false,
      clientGeneratePk: false,
    },
    pay: {
      type: 'okapi',
      path: 'accounts/%{activeRecord.id}/pay',
      fetch: false,
      accumulate: 'true',
      clientGeneratePk: false,
    },
    waive: {
      type: 'okapi',
      path: 'accounts/%{activeRecord.id}/waive',
      fetch: false,
      accumulate: 'true',
      clientGeneratePk: false,
    },
    transfer: {
      type: 'okapi',
      path: 'accounts/%{activeRecord.id}/transfer',
      fetch: false,
      accumulate: 'true',
      clientGeneratePk: false,
    },
    cancel: {
      type: 'okapi',
      path: 'accounts/%{activeRecord.id}/cancel',
      fetch: false,
      accumulate: 'true',
      clientGeneratePk: false,
    },
    refund: {
      type: 'okapi',
      path: 'accounts/%{activeRecord.id}/refund',
      fetch: false,
      accumulate: 'true',
      clientGeneratePk: false,
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      accounts: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      refunds: PropTypes.shape({
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
      checkPay: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      checkWaive: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      checkTransfer: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      checkRefund: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      pay: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      waive: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      transfer: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      cancel: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      refund: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }),
    okapi: PropTypes.object,
    balance: PropTypes.number,
    totalPaidAmount: PropTypes.number,
    owedAmount: PropTypes.number,
    accounts: PropTypes.arrayOf(PropTypes.object),
    selectedAccounts: PropTypes.arrayOf(PropTypes.object),
    onChangeSelectedAccounts: PropTypes.func,
    actions: PropTypes.object,
    onChangeActions: PropTypes.func,
    stripes: PropTypes.object,
    handleEdit: PropTypes.func,
    user: PropTypes.object,
    intl: PropTypes.object.isRequired,
    match: PropTypes.object,
  };

  static defaultProps = {
    totalPaidAmount: 0,
    owedAmount: 0,
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

    this.actionToEndpointMapping = {
      'payment': 'pay',
      'waive': 'waive',
      'transfer': 'transfer',
      'refund': 'refund'
    };
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

    if (this.callout) {
      this.callout.sendCallout({ message });
    }
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
      refundMany: false,
    });
    this.setState({ accounts: this.props.selectedAccounts || [] });
  }

  onCloseComment() {
    this.props.onChangeActions({
      comment: false,
    });
  }

  newAction = (action, id, typeAction, amount, comment, balance, transaction, createAt, values) => {
    let notify;
    if (values) {
      notify = _.isUndefined(values.notify) ? true : values.notify;
    } else {
      notify = this.state.notify;
    }

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
      notify,
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
    const {
      mutator,
      accounts,
    } = this.props;
    const account = accounts[0] || {};
    delete account.rowIndex;
    mutator.activeRecord.update({ id: account.id });
    const payload = this.buildActionBody(values);
    delete payload.amount;
    mutator.cancel.POST(_.omit(payload, ['id']))
      .then(() => this.props.handleEdit(1))
      .then(() => this.showCalloutMessage(account))
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

  buildActionBody = (values) => {
    const {
      okapi: {
        currentUser: {
          firstName,
          lastName,
          curServicePoint: { id: servicePointId }
        },
      }
    } = this.props;

    const body = {};

    body.amount = values.amount;
    body.paymentMethod = values.method;
    body.notifyPatron = values.notify;
    body.comments = this.assembleTagInfo(values);
    body.servicePointId = servicePointId;
    body.userName = `${lastName}, ${firstName}`;

    return body;
  };

  onSubmit(values, action) {
    const {
      accounts,
      mutator,
    } = this.props;

    const account = _.head(accounts) || {};
    mutator.activeRecord.update({ id: account.id });
    const payload = this.buildActionBody(values);

    mutator[this.actionToEndpointMapping[action]].POST(_.omit(payload, ['id']))
      .then(() => this.props.handleEdit(1))
      .then(() => this.showCalloutMessage(account))
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
    if (amount < type.remaining) {
      paymentStatus = `${paymentStatus} ${formatMessage({ id: 'ui-users.accounts.status.partially' })}`;
    } else {
      paymentStatus = `${paymentStatus} ${formatMessage({ id: 'ui-users.accounts.status.fully' })}`;
      type.status.name = 'Closed';
    }
    const balance = type.remaining - parseFloat(amount);
    const createdAt = this.props.okapi.currentUser.curServicePoint.id;
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
      refundModal: false,
      refundMany: false,
    });
    this.setState({
      accounts: this.props.selectedAccounts || [],
      submitting: false
    });
  }

  onConfirm = () => {
    const { actions, selectedAccounts = [] } = this.props;
    const { values } = this.state;
    const singleSelectedAccount = selectedAccounts.length === 1;
    const singlePay = actions.pay || (actions.regular && singleSelectedAccount);
    const singleWaive = actions.waiveModal || (actions.waiveMany && singleSelectedAccount);
    const singleTransfer = actions.transferModal || (actions.transferMany && singleSelectedAccount);
    const singeRefund = actions.refundModal || (actions.refundMany && singleSelectedAccount);

    if (singlePay) {
      this.onSubmit(values, 'payment');
    } else if (actions.regular) {
      this.onSubmitMany(values, selectedAccounts, 'payment');
    } else if (singleWaive) {
      this.onSubmit(values, 'waive');
    } else if (actions.waiveMany) {
      this.onSubmitMany(values, selectedAccounts, 'waive');
    } else if (singleTransfer) {
      this.onSubmit(values, 'transfer');
    } else if (actions.transferMany) {
      this.onSubmitMany(values, selectedAccounts, 'transfer');
    } else if (singeRefund) {
      this.onSubmit(values, 'refund');
    } else if (actions.refundMany) {
      this.onSubmitMany(values, selectedAccounts, 'refund');
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
      values,
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
    const {
      actions: {
        pay,
        regular,
        waiveModal,
        waiveMany,
        transferModal,
        transferMany,
        refundModal,
        refundMany,
      },
      intl: { formatMessage },
    } = this.props;

    let action = '';

    if (pay || regular) {
      action = formatMessage({ id: 'ui-users.accounts.actions.payment' });
    } else if (waiveModal || waiveMany) {
      action = formatMessage({ id: 'ui-users.accounts.actions.waive' });
    } else if (transferModal || transferMany) {
      action = formatMessage({ id: 'ui-users.accounts.actions.transfer' });
    } else if (refundModal || refundMany) {
      action = formatMessage({ id: 'ui-users.accounts.actions.refund' });
    }

    return (
      <FormattedMessage
        id="ui-users.accounts.confirmation.head"
        values={{ action }}
      />
    );
  }

  renderConfirmMessage = () => {
    const {
      actions: {
        pay,
        regular,
        waiveModal,
        waiveMany,
        transferModal,
        transferMany,
        refundModal,
        refundMany,
      },
      intl: { formatMessage }
    } = this.props;

    const { values } = this.state;
    const amount = values.amount;
    let paymentStatus = (pay || regular)
      ? formatMessage({ id: 'ui-users.accounts.actions.warning.paymentAction' })
      : (waiveModal || waiveMany)
        ? formatMessage({ id: 'ui-users.accounts.actions.warning.waiveAction' })
        : (transferModal || transferMany)
          ? formatMessage({ id: 'ui-users.accounts.actions.warning.transferAction' })
          : formatMessage({ id: 'ui-users.accounts.actions.warning.refundAction' });

    if (pay || waiveModal || transferModal || refundModal) {
      const account = this.props.accounts[0] || {};
      const total = (refundModal ? account.amount : account.remaining) || 0;
      paymentStatus = `${((amount < total)
        ? formatMessage({ id: 'ui-users.accounts.status.partially' })
        : formatMessage({ id: 'ui-users.accounts.status.fully' }))} ${paymentStatus}`;
      return (
        <SafeHTMLMessage
          id="ui-users.accounts.confirmation.message"
          values={{ count: 1, amount, action: paymentStatus }}
        />
      );
    } else if (regular || waiveMany || transferMany || refundMany) {
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
      match: { params },
      intl: { formatMessage },
    } = this.props;
    const {
      accounts,
      showConfirmDialog,
      submitting
    } = this.state;

    const account = this.props.accounts[0] || {};
    const defaultServicePointId = _.get(resources, ['curUserServicePoint', 'records', 0, 'defaultServicePointId'], '-');
    const servicePointsIds = _.get(resources, ['curUserServicePoint', 'records', 0, 'servicePointsIds'], []);
    const payments = _.get(resources, ['payments', 'records'], []);
    const refunds = _.get(resources, ['refunds', 'records'], []);
    const owners = _.get(resources, ['owners', 'records'], []).filter(o => o.owner !== 'Shared');
    const feefines = _.get(resources, ['feefineTypes', 'records'], []);
    const waives = _.get(resources, ['waives', 'records'], []);
    const transfers = _.get(resources, ['transfers', 'records'], []);
    const settings = _.get(resources, ['commentRequired', 'records', 0], {});
    const hasInvalidAccounts = accounts.some(a => {
      return actions.refundMany ? !isRefundAllowed(a) : a?.status?.name === 'Closed';
    });
    const isWarning = hasInvalidAccounts
        && (actions.regular || actions.waiveMany || actions.transferMany || actions.refundMany)
        && params.accountstatus;
    const warningModalLabelId = actions.regular
      ? 'ui-users.accounts.actions.payFeeFine'
      : actions.waiveMany
        ? 'ui-users.accounts.actions.waiveFeeFine'
        : actions.transferMany
          ? 'ui-users.accounts.actions.transferFeeFine'
          : 'ui-users.accounts.actions.refundFeeFine';

    const ownerId = loadServicePoints({ owners, defaultServicePointId, servicePointsIds });
    const currentFeeFineType = feefines.find(({ feeFineType }) => feeFineType === account?.feeFineType);
    const initialValues = {
      ownerId,
      amount: calculateSelectedAmount(this.props.accounts),
      notify: !!(currentFeeFineType?.actionNoticeId || currentFeeFineType?.chargeNoticeId),
    };

    const modals = [
      {
        action: 'payment',
        checkAmount: 'check-pay',
        item: actions.pay,
        label: 'nameMethod',
        data: payments,
        comment: 'paid',
        open: actions.pay || (actions.regular && accounts.length === 1),
        initialValues,
      },
      {
        action: 'payment',
        checkAmount: 'check-pay',
        form: 'payment-many-modal',
        label: 'nameMethod',
        accounts,
        data: payments,
        comment: 'paid',
        open: actions.regular && !isWarning && accounts.length > 1,
        initialValues: { ...initialValues, amount: calculateSelectedAmount(accounts) },
      },
      {
        action: 'waive',
        checkAmount: 'check-waive',
        item: actions.waiveModal,
        label: 'nameReason',
        data: waives,
        comment: 'waived',
        open: actions.waiveModal || (actions.waiveMany && !isWarning),
        initialValues,
      },
      {
        action: 'transfer',
        checkAmount: 'check-transfer',
        item: actions.transferModal,
        label: 'accountName',
        data: transfers,
        comment: 'transferredManually',
        open: actions.transferModal || (actions.transferMany && !isWarning),
        initialValues,
      },
      {
        action: 'refund',
        checkAmount: 'check-refund',
        item: actions.refundModal,
        label: 'nameReason',
        data: refunds,
        comment: 'refunded',
        open: actions.refundModal || (actions.refundMany && !isWarning),
        initialValues: { ...initialValues, amount: calculateSelectedAmount(this.props.accounts, true) }
      },
    ];

    return (
      <div>
        <WarningModal
          id="actions-warning-modal"
          open={isWarning && !submitting}
          label={formatMessage({ id: warningModalLabelId })}
          accounts={accounts}
          onChangeAccounts={this.onChangeAccounts}
          stripes={stripes}
          onClose={this.onCloseWarning}
        />
        <CancellationModal
          form="error-modal"
          initialValues={initialValues}
          open={actions.cancellation}
          onClose={this.onCloseCancellation}
          user={this.props.user}
          account={account}
          onSubmit={(values) => { this.onClickCancellation(values); }}
          owners={owners}
          feefines={feefines}
        />
        {modals.reduce((am, m) => {
          if (m.open) {
            am.push(
              <ActionModal
                {...m}
                intl={this.props.intl}
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
                okapi={this.props.okapi}
                totalPaidAmount={parseFloat(this.props.totalPaidAmount).toFixed(2)}
                owedAmount={parseFloat(this.props.owedAmount).toFixed(2)}
              />
            );
          }

          return am;
        }, [])}
        <CommentModal
          open={actions.comment}
          stripes={this.props.stripes}
          onClose={this.onCloseComment}
          onSubmit={(values) => { this.onClickComment(values); }}
        />
        <ConfirmationModal
          style={{ position: 'relative', zIndex: 1000 }}
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

export default stripesConnect(injectIntl(withRouter(Actions)));
