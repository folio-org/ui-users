import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';
import {
  Callout,
  ConfirmationModal,
} from '@folio/stripes/components';
import {
  FormattedMessage,
  intlShape,
  injectIntl
} from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
// import withServicePoints from '../../../withServicePoints';
import ChargeForm from './ChargeForm';
import ItemLookup from './ItemLookup';
import ActionModal from '../Actions/ActionModal';
import { getFullName } from '../../util';
import { loadServicePoints } from '../accountFunctions';

class Charge extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      feefines: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      owners: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      activeRecord: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }),
      feefineactions: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      account: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }).isRequired,
    stripes: PropTypes.object.isRequired,
    handleAddRecords: PropTypes.func,
    okapi: PropTypes.object,
    selectedLoan: PropTypes.object,
    user: PropTypes.object,
    onSubmit: PropTypes.func,
    servicePointsIds: PropTypes.arrayOf(PropTypes.string),
    defaultServicePointId: PropTypes.string,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ownerId: '0',
      lookup: false,
      pay: false,
      showConfirmDialog: false,
    };
    this.onClickCharge = this.onClickCharge.bind(this);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onFindShared = this.onFindShared.bind(this);
    this.item = {};
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onChangeItem = this.onChangeItem.bind(this);
    this.onClosePayModal = this.onClosePayModal.bind(this);
    this.onClickPay = this.onClickPay.bind(this);
    this.type = {};
    this.callout = null;
  }

  shouldComponentUpdate(nextProps) {
    const items = _.get(this.props.resources, ['items', 'records'], []);
    const nextItems = _.get(nextProps.resources, ['items', 'records'], []);
    const barcode = _.get(this.props.resources, ['activeRecord', 'barcode']);
    if (nextItems.length === 1 && barcode !== null) {
      if (nextItems[0].barcode === barcode) this.item = nextItems[0];
    }

    if (items !== nextItems) {
      this.setState({
        lookup: true,
      });
    }

    return true;
  }

  componentWillUnmount() {
    this.item = {};
    this.props.mutator.activeRecord.update({ barcode: null });
  }

  onClickCharge(type) {
    const owners = _.get(this.props.resources, ['owners', 'records'], []);
    const feefines = _.get(this.props.resources, ['feefines', 'records'], []);
    const selectedLoan = this.props.selectedLoan || {};

    const { intl: { formatMessage } } = this.props;
    const item = (selectedLoan.id) ? selectedLoan.item : this.item;

    type.paymentStatus = {
      name: 'Outstanding',
    };
    type.status = {
      name: 'Open',
    };
    type.remaining = type.amount;
    type.feeFineType = (feefines.find(f => f.id === type.feeFineId) || {}).feeFineType || '';
    type.feeFineOwner = (owners.find(o => o.id === type.ownerId) || {}).owner || '';
    type.title = item.title;
    type.barcode = item.barcode;
    type.callNumber = item.callNumber;
    type.location = (selectedLoan.id) ? (item.location || {}).name : (item.effectiveLocation || {}).name;
    type.materialType = (item.materialType || {}).name;
    type.materialTypeId = (selectedLoan.id) ? '0' : (item.materialType || {}).id || '0';

    if (selectedLoan.dueDate) type.dueDate = selectedLoan.dueDate;
    if (selectedLoan.returnDate) type.returnedDate = selectedLoan.returnDate;
    type.id = uuid();
    type.loanId = selectedLoan.id || '0';
    type.userId = this.props.user.id;
    type.itemId = this.item.id || '0';
    let commentInfo = '';
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const tagPatron = formatMessage({ id: 'ui-users.accounts.actions.tag.patron' });
    if (type.comments) {
      commentInfo = `${tagStaff} : ${type.comments}`;
    }
    if (type.patronInfo && type.notify) {
      commentInfo = `${commentInfo} \n ${tagPatron} : ${type.patronInfo}`;
    }
    delete type.comments;
    delete type.notify;
    delete type.patronInfo;
    this.type = type;
    return this.props.mutator.accounts.POST(type)
      .then(() => this.newAction({}, type.id, type.feeFineType, type.amount, commentInfo, type.remaining, 0, type.feeFineOwner));
  }

  newAction = (action, id, typeAction, amount, comment, balance, transaction, createdAt) => {
    const path = `accounts/${this.type.id}`;
    return this.props.mutator.account.GET({ path }).then(record => {
      const dateAction = _.get(record, ['metadata', 'updatedDate'], moment().format());

      const newAction = {
        typeAction,
        source: `${this.props.okapi.currentUser.lastName}, ${this.props.okapi.currentUser.firstName}`,
        createdAt,
        accountId: id,
        dateAction,
        userId: this.props.user.id,
        amountAction: parseFloat(amount || 0).toFixed(2),
        balance: parseFloat(balance || 0).toFixed(2),
        transactionInformation: transaction || '-',
        comments: comment,
      };
      this.props.mutator.feefineactions.POST(Object.assign(action, newAction));
    });
  }


  onClickPay(type) {
    this.type = type;
    this.type.remaining = type.amount;
    this.setState({
      pay: true,
    });
    return new Promise((resolve, reject) => {
      this.payResolve = resolve;
      this.payReject = reject;
    });
  }

  onClosePayModal() {
    this.setState({
      pay: false,
    });
  }

  onClickSelectItem(barcode) {
    if (barcode !== '') {
      this.props.mutator.activeRecord.update({ barcode });
      if ((this.props.resources.activeRecord || {}).barcode === barcode) {
        this.setState({
          lookup: true,
        });
      }
    }
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    if (_.get(this.props.resources, ['activeRecord', 'shared']) === undefined) {
      const owners = _.get(this.props.resources, ['owners', 'records'], []);
      const shared = (owners.find(o => o.owner === 'Shared') || {}).id || '0';
      this.props.mutator.activeRecord.update({ shared });
    }
    this.props.mutator.activeRecord.update({ ownerId });
    this.setState({
      ownerId,
    });
  }

  onChangeItem(item) {
    this.item = item;
  }

  onFindShared(id) {
    this.props.mutator.activeRecord.update({ shared: id });
  }

  onCloseModal() {
    this.setState({
      lookup: false,
    });
  }

  showCalloutMessage(a) {
    const message =
      <span>
        <FormattedMessage id="ui-users.charge.messageThe" />
        {a.feeFineType}
        <FormattedMessage id="ui-users.charge.messageOf" />
        <strong>{`${parseFloat(a.amount).toFixed(2)}`}</strong>
        <FormattedMessage id="ui-users.charge.messageSuccessfully" />
        {a.paymentStatus.name}
        <FormattedMessage id="ui-users.charge.messageFor" />
        <strong>{`${getFullName(this.props.user)}`}</strong>
      </span>;
    this.callout.sendCallout({ message });
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
    const { values } = this.state;
    const { intl: { formatMessage } } = this.props;
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const tagPatron = formatMessage({ id: 'ui-users.accounts.actions.tag.patron' });
    let comment = '';
    if (values.comment) {
      comment = `${tagStaff} : ${values.comment}`;
    }
    if (values.patronInfo && values.notify) {
      comment = `${comment} \n ${tagPatron} : ${values.patronInfo}`;
    }
    this.onClickCharge(this.type).then(() => {
      this.type.remaining = parseFloat(this.type.amount - values.amount).toFixed(2);
      let paymentStatus = _.capitalize(formatMessage({ id: 'ui-users.accounts.actions.warning.paymentAction' }));
      if (this.type.remaining === '0.00') {
        paymentStatus = `${paymentStatus} ${formatMessage({ id: 'ui-users.accounts.status.fully' })}`;
        this.type.status.name = 'Closed';
      } else {
        paymentStatus = `${paymentStatus} ${formatMessage({ id: 'ui-users.accounts.status.partially' })}`;
      }
      this.type.paymentStatus.name = paymentStatus;
      this.props.mutator.activeRecord.update({ id: this.type.id });
      return this.props.mutator.accounts.PUT(this.type);
    })
      .then(() => this.newAction({ paymentMethod: values.method }, this.type.id,
        this.type.paymentStatus.name, values.amount,
        comment, this.type.remaining,
        values.transaction, this.type.feeFineOwner))
      .then(() => {
        this.hideConfirmDialog();
        this.onClosePayModal();
        this.showCalloutMessage(this.type);
        this.payResolve();
      })
      .then(() => { this.props.history.goBack(); });
  }

  renderConfirmMessage = () => {
    const { intl: { formatMessage } } = this.props;
    const values = this.state.values || {};
    const type = this.type || {};
    const amount = parseFloat(values.amount || 0).toFixed(2);
    let paymentStatus = formatMessage({ id: 'ui-users.accounts.actions.warning.paymentAction' });
    paymentStatus = `${(parseFloat(values.amount) !== parseFloat(type.amount)
      ? formatMessage({ id: 'ui-users.accounts.status.partially' })
      : formatMessage({ id: 'ui-users.accounts.status.fully' }))} ${paymentStatus}`;
    return (
      <SafeHTMLMessage
        id="ui-users.accounts.confirmation.message"
        values={{ count: 1, amount, action: paymentStatus }}
      />
    );
  }

  onSubmitCharge = (data) => {
    const {
      history
    } = this.props;
    if (data.pay) {
      delete data.pay;
      this.type.remaining = data.amount;
      this.onClickPay(data);
    } else {
      delete data.pay;
      this.onClickCharge(data)
        .then(() => { history.goBack(); });
    }
  }

  render() {
    const {
      resources,
      user,
      stripes,
      location,
      history,
      intl,
    } = this.props;
    const allfeefines = _.get(resources, ['allfeefines', 'records'], []);
    const owners = _.get(resources, ['owners', 'records'], []);
    const list = [];
    const shared = owners.find(o => o.owner === 'Shared');
    allfeefines.forEach(f => {
      if (!list.find(o => (o || {}).id === f.ownerId)) {
        const owner = owners.find(o => (o || {}).id === f.ownerId);
        if (owner !== undefined) { list.push(owner); }
      }
    });
    const feefines = (this.state.ownerId !== '0') ? (resources.feefines || {}).records || [] : [];
    const payments = _.get(resources, ['payments', 'records'], []).filter(p => p.ownerId === this.state.ownerId);
    const accounts = _.get(resources, ['accounts', 'records'], []);
    const settings = _.get(this.props.resources, ['commentRequired', 'records', 0], {});

    const defaultServicePointId = _.get(resources, ['curUserServicePoint', 'records', 0, 'defaultServicePointId'], '-');
    const servicePointsIds = _.get(resources, ['curUserServicePoint', 'records', 0, 'servicePointsIds'], []);

    let selected = parseFloat(0);
    accounts.forEach(a => {
      selected += parseFloat(a.remaining);
    });
    parseFloat(selected).toFixed(2);
    const item = {
      id: this.item.id || '',
      instance: this.item.title || '',
      barcode: this.item.barcode || '',
      itemStatus: (this.item.status || {}).name || '',
      callNumber: this.item.callNumber || '',
      location: (this.item.effectiveLocation || {}).name || '',
      type: (this.item.materialType || {}).name || '',
    };

    const isPending = {
      owners: _.get(resources, ['owners', 'isPending'], false),
      feefines: _.get(resources, ['feefines', 'isPending'], false),
      servicePoints: _.get(resources, ['curUserServicePoint', 'isPending'], true)
    };

    const items = _.get(resources, ['items', 'records'], []);
    const ownerId = loadServicePoints({ owners: (shared ? owners : list), defaultServicePointId, servicePointsIds });
    const initialValues = { amount: this.type.amount, notify: true, ownerId };

    return (
      <div>
        <ChargeForm
          onClickPay={this.onClickPay}
          defaultServicePointId={defaultServicePointId}
          servicePointsIds={servicePointsIds}
          onSubmit={this.onSubmitCharge}
          user={user}
          ownerList={(shared) ? owners : list}
          owners={owners}
          isPending={isPending}
          ownerId={this.state.ownerId}
          feefines={feefines}
          item={item}
          onFindShared={this.onFindShared}
          onChangeOwner={this.onChangeOwner}
          onClickSelectItem={this.onClickSelectItem}
          stripes={stripes}
          location={location}
          history={history}
          {...this.props}
        />
        <ItemLookup
          resources={resources}
          items={items}
          open={(this.state.lookup && items.length > 1)}
          onChangeItem={this.onChangeItem}
          onClose={this.onCloseModal}
        />
        <ActionModal
          intl={intl}
          action="payment"
          form="payment-modals"
          label="nameMethod"
          initialValues={initialValues}
          open={this.state.pay}
          commentRequired={settings.paid}
          onClose={this.onClosePayModal}
          accounts={[this.type]}
          balance={this.type.amount}
          data={payments}
          stripes={stripes}
          onSubmit={(values) => { this.showConfirmDialog(values); }}
          owners={owners}
          feefines={feefines}
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
        <ConfirmationModal
          open={this.state.showConfirmDialog}
          heading={<FormattedMessage id="ui-users.accounts.confirmation.head" values={{ action: 'payment' }} />}
          message={this.renderConfirmMessage()}
          onConfirm={this.onConfirm}
          onCancel={this.hideConfirmDialog}
          cancelLabel={<FormattedMessage id="ui-users.accounts.cancellation.field.back" />}
          confirmLabel={<FormattedMessage id="ui-users.accounts.cancellation.field.confirm" />}
        />
      </div>
    );
  }
}

export default injectIntl(Charge);
