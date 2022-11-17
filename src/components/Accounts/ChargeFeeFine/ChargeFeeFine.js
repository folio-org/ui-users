import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';
import {
  Callout,
  ConfirmationModal,
} from '@folio/stripes/components';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { effectiveCallNumber } from '@folio/stripes/util';
import ChargeForm from './ChargeForm';
import ItemLookup from './ItemLookup';
import ActionModal from '../Actions/ActionModal';
import { getFullName } from '../../util';
import {
  loadServicePoints,
  deleteOptionalActionFields,
} from '../accountFunctions';
import { SHARED_OWNER } from '../../../constants';

class ChargeFeeFine extends React.Component {
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
      pay: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
    stripes: PropTypes.object.isRequired,
    okapi: PropTypes.object,
    selectedLoan: PropTypes.object,
    user: PropTypes.object,
    intl: PropTypes.object.isRequired,
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      ownerId: '0',
      feeFineTypeId: null,
      lookup: false,
      pay: false,
      showConfirmDialog: false,
      notify: null,
      paymentNotify: null,
    };
    this.chargeAction = this.chargeAction.bind(this);
    this.payAction = this.payAction.bind(this);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onFindShared = this.onFindShared.bind(this);
    this.item = {};
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onChangeItem = this.onChangeItem.bind(this);
    this.onClosePayModal = this.onClosePayModal.bind(this);
    this.onFormAccountData = this.onFormAccountData.bind(this);
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

  onFormAccountData(type) {
    const owners = _.get(this.props.resources, ['owners', 'records'], []);
    const feefines = _.get(this.props.resources, ['allfeefines', 'records'], []);
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
    type.callNumber = effectiveCallNumber(item);
    type.location = item?.location?.name || item?.effectiveLocation?.name;
    type.materialType = (item.materialType || {}).name;
    type.materialTypeId = (selectedLoan.id) ? undefined : (item.materialType || {}).id || undefined;

    if (item.contributorNames) { type.contributors = item.contributorNames; }
    if (selectedLoan.dueDate) type.dueDate = selectedLoan.dueDate;
    if (selectedLoan.returnDate) type.returnedDate = selectedLoan.returnDate;
    type.id = uuidv4();
    type.loanId = selectedLoan.id;
    type.userId = this.props.user.id;
    type.itemId = this.item.id;
    let commentInfo = '';
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const tagPatron = formatMessage({ id: 'ui-users.accounts.actions.tag.patron' });
    if (type.comments) {
      commentInfo = `${tagStaff} : ${type.comments}`;
    }
    if (type.patronInfo && type.notify) {
      commentInfo = `${commentInfo} \n ${tagPatron} : ${type.patronInfo}`;
    }
    this.setState({ notify: type.notify });
    const typeAction = _.omit(type, ['comments', 'patronInfo', 'notify']);

    return {
      typeAction,
      commentInfo,
    };
  }

  chargeAction(type) {
    const {
      typeAction,
      commentInfo,
    } = this.onFormAccountData(type);

    deleteOptionalActionFields(
      typeAction,
      'itemId',
      'materialTypeId',
      'materialType',
      'loanId'
    );

    return this.props.mutator.accounts.POST(typeAction)
      .then(() => this.newAction({}, typeAction.id, typeAction.feeFineType, typeAction.amount, commentInfo, typeAction.remaining, 0, typeAction.feeFineOwner));
  }

  newAction = (action, id, typeAction, amount, comment, balance, transaction) => {
    const {
      user,
      okapi: { currentUser },
      mutator
    } = this.props;
    const path = `accounts/${id}`;
    const notify = _.isEmpty(action) ? this.state.notify : this.state.paymentNotify;

    return mutator.account.GET({ path }).then(record => {
      const dateAction = _.get(record, ['metadata', 'updatedDate'], moment().format());

      const newAction = {
        typeAction,
        source: `${currentUser.lastName}, ${currentUser.firstName}`,
        createdAt: currentUser.curServicePoint.id,
        accountId: id,
        dateAction,
        userId: user.id,
        amountAction: parseFloat(amount || 0).toFixed(2),
        balance: parseFloat(balance || 0).toFixed(2),
        transactionInformation: transaction || '',
        comments: comment,
        notify,
      };

      mutator.feefineactions.POST(Object.assign(action, newAction));
    });
  }

  payAction(type) {
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

  goBack = () => {
    const { history } = this.props;

    history.goBack();
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

  onChangeOwner(ownerId) {
    const {
      resources,
      mutator,
    } = this.props;

    if (_.get(resources, ['activeRecord', 'shared']) === undefined) {
      const owners = _.get(resources, ['owners', 'records'], []);
      const shared = (owners.find(o => o.owner === SHARED_OWNER) || {}).id || '0';
      mutator.activeRecord.update({ shared });
    }
    mutator.activeRecord.update({ ownerId });
    this.setState({ ownerId });
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
    const {
      intl: { formatNumber },
    } = this.props;
    const amount = parseFloat(a.amount).toFixed(2);
    const paymentName = (a.paymentStatus.name).toLowerCase();
    const fullName = getFullName(this.props.user);
    const { feeFineType } = a;
    const message =
      <FormattedMessage
        id="ui-users.charge.message.successfully"
        values={{
          feeFineType,
          amount: formatNumber(amount, { style: 'currency' }),
          paymentName,
          fullName,
        }}
      />;

    if (this.callout) {
      this.callout.sendCallout({ message });
    }
  }

  showConfirmDialog = (values) => {
    this.setState({
      values,
      showConfirmDialog: true,
      paymentNotify: values.notify
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
    const { values, pay } = this.state;
    const {
      intl: { formatMessage },
      okapi: {
        currentUser,
        currentUser: {
          curServicePoint: { id: servicePointId }
        },
      },
      mutator,
    } = this.props;
    const tagStaff = formatMessage({ id: 'ui-users.accounts.actions.tag.staff' });
    const tagPatron = formatMessage({ id: 'ui-users.accounts.actions.tag.patron' });
    let comment = '';

    if (values.comment) {
      comment = `${tagStaff} : ${values.comment}`;
    }
    if (values.patronInfo && values.notify) {
      comment = `${comment} \n ${tagPatron} : ${values.patronInfo}`;
    }

    this.type.remaining = parseFloat(this.type.amount - values.amount).toFixed(2);
    let paymentStatus = _.capitalize(formatMessage({ id: 'ui-users.accounts.actions.warning.paymentAction' }));

    if (this.type.remaining === '0.00') {
      paymentStatus = `${paymentStatus} ${formatMessage({ id: 'ui-users.accounts.status.fully' })}`;
      this.type.status.name = 'Closed';
    } else {
      paymentStatus = `${paymentStatus} ${formatMessage({ id: 'ui-users.accounts.status.partially' })}`;
    }

    this.type.paymentStatus.name = paymentStatus;
    mutator.activeRecord.update({ id: this.type.id });

    if (pay) {
      const payBody = {
        amount: values.amount,
        notifyPatron: values.notify,
        servicePointId,
        userName: `${currentUser.lastName}, ${currentUser.firstName}`,
        paymentMethod: values.method,
        comments: comment,
        transactionInfo: values?.transaction ?? '',
      };

      return mutator.pay.POST(payBody)
        .then(() => this.hideConfirmDialog())
        .then(() => this.onClosePayModal())
        .then(this.showCalloutMessage(this.type))
        .then(() => this.payResolve())
        .catch((error) => {
          this.payReject();
          this.callout.current.sendCallout({
            type: 'error',
            message: error
          });
        });
    } else {
      return this.showCalloutMessage(this.type);
    }
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
      <FormattedMessage
        id="ui-users.accounts.confirmation.message"
        values={{ count: 1, amount, action: paymentStatus }}
      />
    );
  }

  onSubmitCharge = (data) => {
    if (data.pay) {
      delete data.pay;
      this.type.remaining = data.amount;

      return this.chargeAction(data)
        .then(() => this.payAction(data))
        .then(() => this.goBack());
    } else {
      delete data.pay;

      return this.chargeAction(data)
        .then(() => this.showCalloutMessage(data))
        .then(() => this.goBack());
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
      match: {
        params: { loanid },
      },
      okapi: {
        currentUser: {
          curServicePoint,
        }
      },
    } = this.props;
    const {
      ownerId,
      feeFineTypeId,
      pay,
    } = this.state;
    this.item = _.get(resources, ['items', 'records', [0]], {});
    const feefines = _.get(resources, ['allfeefines', 'records'], []);
    const owners = _.get(resources, ['owners', 'records'], []);
    const list = [];
    const shared = owners.find(o => o.owner === SHARED_OWNER);
    feefines.forEach(f => {
      if (!list.find(o => (o || {}).id === f.ownerId)) {
        const owner = owners.find(o => (o || {}).id === f.ownerId);

        if (owner) {
          list.push(owner);
        }
      }
    });
    const payments = _.get(resources, ['payments', 'records'], []);
    const accounts = _.get(resources, ['accounts', 'records'], []);
    const settings = _.get(resources, ['commentRequired', 'records', 0], {});
    const barcode = _.get(resources, 'activeRecord.barcode');
    const defaultServicePointId = curServicePoint?.id;
    const servicePointsIds = _.get(resources, ['curUserServicePoint', 'records', 0, 'servicePointsIds'], []);
    let selected = parseFloat(0);
    accounts.forEach(a => {
      selected += parseFloat(a.remaining);
    });
    parseFloat(selected).toFixed(2);
    let item;

    if (this.item && (loanid || barcode)) {
      item = {
        id: this.item.id || '',
        instance: this.item.title || '',
        barcode: this.item.barcode || '',
        itemStatus: (this.item.status || {}).name || '',
        callNumber: effectiveCallNumber(this.item),
        location: (this.item.effectiveLocation || {}).name || '',
        type: (this.item.materialType || {}).name || '',
      };
    }

    const isPending = {
      owners: _.get(resources, ['owners', 'isPending'], false),
      feefines: _.get(resources, ['allfeefines', 'isPending'], false),
      servicePoints: _.get(resources, ['curUserServicePoint', 'isPending'], true)
    };

    const items = _.get(resources, ['items', 'records'], []);
    const servicePointOwnerId = loadServicePoints({ owners: (shared ? owners : list), defaultServicePointId, servicePointsIds });
    const initialOwnerId = ownerId !== '0' ? ownerId : servicePointOwnerId;
    const selectedFeeFine = feefines.find(f => f.id === feeFineTypeId);
    const currentOwnerFeeFineTypes = feefines.filter(f => f.ownerId === initialOwnerId || f.ownerId === resources.activeRecord.shared);
    const selectedOwner = owners.find(o => (o.id === initialOwnerId || o.id === resources.activeRecord.shared));

    const initialChargeValues = {
      ownerId: initialOwnerId,
      notify: !!(selectedFeeFine?.chargeNoticeId || selectedOwner?.defaultChargeNoticeId),
      feeFineId: '',
      amount: ''
    };

    const initialActionValues = {
      amount: this.type.amount,
      notify: !!(selectedFeeFine?.actionNoticeId || selectedOwner?.defaultActionNoticeId),
      ownerId: initialOwnerId
    };

    return (
      <div>
        <ChargeForm
          form="feeFineChargeForm"
          initialValues={initialChargeValues}
          feeFineTypeOptions={currentOwnerFeeFineTypes}
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
        {pay &&
          <ActionModal
            intl={intl}
            action="payment"
            form="payment-modals"
            label="nameMethod"
            initialValues={initialActionValues}
            open
            commentRequired={settings.paid}
            onClose={this.goBack}
            accounts={[this.type]}
            balance={this.type.amount}
            data={payments}
            stripes={stripes}
            onSubmit={(values) => {
              this.showConfirmDialog(values);
            }}
            owners={owners}
            okapi={this.props.okapi}
            checkAmount="check-pay"
          />
        }
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

export default injectIntl(ChargeFeeFine);
