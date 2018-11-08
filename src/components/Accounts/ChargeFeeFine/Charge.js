import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';
import { Callout } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import ChargeForm from './ChargeForm';
import ItemLookup from './ItemLookup';
import PayModal from '../Actions/PayModal';
import { getFullName } from '../../../util';

class Charge extends React.Component {
  static manifest = Object.freeze({
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items?query=barcode=%{activeRecord.barcode}*',
    },
    feefines: {
      type: 'okapi',
      records: 'feefines',
      GET: {
        path: 'feefines?query=(ownerId=%{activeRecord.ownerId} or ownerId=%{activeRecord.shared})&limit=100',
      },
    },
    feefineactions: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions',
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?limit=100',
    },
    accounts: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
      PUT: {
        path: 'accounts/%{activeRecord.id}'
      },
    },
    account: {
      type: 'okapi',
      resource: 'accounts',
      accumulate: 'true',
      path: 'accounts',
    },
    payments: {
      type: 'okapi',
      records: 'payments',
      path: 'payments',
    },
    commentRequired: {
      type: 'okapi',
      records: 'comments',
      path: 'comments',
    },
    allfeefines: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines?limit=100',
    },
    activeRecord: {},
  });

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
    }).isRequired,
    stripes: PropTypes.object.isRequired,
    onCloseChargeFeeFine: PropTypes.func.isRequired,
    handleAddRecords: PropTypes.func,
    okapi: PropTypes.object,
    selectedLoan: PropTypes.object,
    user: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      ownerId: '0',
      lookup: false,
      pay: false,
    };
    this.onClickCharge = this.onClickCharge.bind(this);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onFindShared = this.onFindShared.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
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
    const { selectedLoan } = this.props;
    const item = (selectedLoan.id) ? selectedLoan.item : this.item;

    type.paymentStatus = {
      name: 'Outstanding',
    };
    type.status = {
      name: 'Open',
    };
    type.remaining = type.amount;
    type.feeFineType = (feefines.find(f => f.id === type.feeFineId.substring(0, 36)) || {}).feeFineType || '';
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
    type.loanId = this.props.selectedLoan.id || '0';
    type.userId = this.props.user.id;
    type.itemId = this.item.id || '0';
    const c = type.comments;
    delete type.comments;
    this.type = type;
    return this.props.mutator.accounts.POST(type)
      .then(() => this.newAction({}, type.id, type.feeFineType, type.amount, c, type.remaining, 0, type.feeFineOwner));
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

  onSubmit(data) {
    this.log('xhr', data);
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
      const shared = owners.find(o => o.owner === 'Shared').id || '0';
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

  render() {
    const resources = this.props.resources;
    const allfeefines = _.get(resources, ['allfeefines', 'records'], []);
    const owners = _.get(resources, ['owners', 'records'], []);
    const list = [];
    const shared = owners.find(o => o.owner === 'Shared'); // Crear variable Shared en translations
    allfeefines.forEach(f => {
      if (!list.find(o => o.id === f.ownerId)) {
        list.push(owners.find(o => o.id === f.ownerId));
      }
    });
    const feefines = (this.state.ownerId !== '0') ? (resources.feefines || {}).records || [] : [];
    const payments = _.get(resources, ['payments', 'records'], []);
    const accounts = _.get(resources, ['accounts', 'records'], []);
    const settings = _.get(this.props.resources, ['commentRequired', 'records', 0], {});

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
    };

    const items = _.get(resources, ['items', 'records'], []);
    return (
      <div>
        <ChargeForm
          onClickCancel={this.props.onCloseChargeFeeFine}
          onClickPay={this.onClickPay}
          onSubmit={(data) => {
            if (data.pay) {
              delete data.pay;
              this.type.remaining = data.amount;
              this.onClickPay(data);
            } else {
              delete data.pay;
              this.onClickCharge(data)
                .then(() => this.props.handleAddRecords())
                .then(() => this.props.onCloseChargeFeeFine());
            }
          }}
          user={this.props.user}
          ownerList={(shared) ? owners : list}
          owners={owners}
          isPending={isPending}
          ownerId={this.state.ownerId}
          feefines={feefines}
          item={item}
          onFindShared={this.onFindShared}
          onChangeOwner={this.onChangeOwner}
          onClickSelectItem={this.onClickSelectItem}
          stripes={this.props.stripes}
          {...this.props}
        />
        <ItemLookup
          resources={this.props.resources}
          items={items}
          open={(this.state.lookup && items.length > 1)}
          onChangeItem={this.onChangeItem}
          onClose={this.onCloseModal}
        />
        <PayModal
          open={this.state.pay}
          commentRequired={settings.paid}
          onClose={this.onClosePayModal}
          accounts={[this.type]}
          balance={this.type.amount}
          payments={payments}
          stripes={this.props.stripes}
          onSubmit={(values) => {
            this.onClickCharge(this.type).then(() => {
              this.type.remaining = parseFloat(this.type.amount - values.amount).toFixed(2);
              if (this.type.remaining === '0.00') {
                this.type.paymentStatus.name = 'Paid Fully';
                this.type.status.name = 'Closed';
              } else {
                this.type.paymentStatus.name = 'Paid Partially';
              }
              this.props.mutator.activeRecord.update({ id: this.type.id });
              return this.props.mutator.accounts.PUT(this.type);
            })
              .then(() => this.newAction({ paymentMethod: values.method }, this.type.id,
                this.type.paymentStatus.name, values.amount,
                values.comment, this.type.remaining,
                values.transaction, this.type.feeFineOwner))
              .then(() => {
                this.showCalloutMessage(this.type);
                this.payResolve();
              })
              .then(() => this.props.handleAddRecords())
              .then(() => setTimeout(this.props.onCloseChargeFeeFine, 2000));
          }}
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
      </div>
    );
  }
}

export default Charge;
