import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';
import dateFormat from 'dateformat';

import ChargeForm from './ChargeForm';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

let ownerId = '0';
let buscar = false;
let selecteditem = {};

class Charge extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      feefines: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      owners: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      chargeitem: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      instances: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      accounts: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      feefineactions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    location: PropTypes.shape({
      search: PropTypes.string,
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      feefineactions: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
    }).isRequired,
    onClickCloseChargeFeeFine: PropTypes.func.isRequired,
    okapi: PropTypes.object,
    loan: PropTypes.object,
    user: PropTypes.object,
  };

  static manifest = Object.freeze({
    userCount: { initialValue: INITIAL_RESULT_COUNT },
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
      recordsRequired: '%{userCount}',
      perRequest: RESULT_COUNT_INCREMENT,
      path: 'owners',
    },
    accounts: {
      type: 'okapi',
      records: 'accounts',
      recordsRequired: '%{userCount}',
      perRequest: RESULT_COUNT_INCREMENT,
      path: 'accounts',
    },
    chargeitem: {
      type: 'okapi',
      records: 'chargeitem',
      GET: {
        path: 'chargeitem?query=(instance=%{activeRecord.itembarcode} or barcode=%{activeRecord.itembarcode})',
      },
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);
    this.onClickCharge = this.onClickCharge.bind(this);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onFindShared = this.onFindShared.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillMount() {
    if (this.props.loan.item.barcode) {
      console.log('buscando el loan');
      console.log(this.props.loan);
      this.props.mutator.activeRecord.update({ itembarcode: this.props.loan.item.barcode });
      buscar = true;
    }
    this.props.mutator.activeRecord.update({ instanceid: 0 });
    this.props.mutator.activeRecord.update({ userid: this.props.user.id });
  }

  componentDidUpdate() {
    if (selecteditem.instanceId && buscar) {
      const instanceid = (selecteditem) ? selecteditem.instanceId : 0;
      this.props.mutator.activeRecord.update({ instanceid });
      buscar = false;
    }
  }

  onClickCharge(type) {
    const date = new Date();
    const action = {};
    type.id = uuid();
    type.dateCreated = dateFormat(date, "yyyy-mm-dd'T'HH:MM:ss'Z'");
    type.dateUpdated = dateFormat(date, "yyyy-mm-dd'T'HH:MM:ss'Z'");
    type.loanId = '0';
    type.userId = this.props.user.id;
    type.itemId = '0';
    type.materialTypeId = '0';
    console.log(selecteditem);
    if (selecteditem.id) {
      type.itemId = selecteditem.id;
      if (selecteditem.materialTypeId) {
        type.materialTypeId = selecteditem.materialTypeId;
      }
    }
    delete type.totalamount;
    const source = `${this.props.okapi.currentUser.lastName}, ${this.props.okapi.currentUser.firstName}`;
    action.id = uuid();
    action.dateAction = type.dateCreated;
    action.typeAction = 'Carga';
    action.comments = type.comments;
    action.amountAction = type.amount;
    action.balance = type.remaining;
    action.transactionNumber = 0;
    action.createdAt = 'Main Library';
    action.source = source;
    action.accountId = type.id;
    action.userId = type.userId;
    type.metadata = {
      createdByUserId: '1ad737b0-d847-11e6-bf26-cec0c932ce01',
    };
    delete type.comments;
    this.props.mutator.accounts.POST(type);
    this.props.mutator.feefineactions.POST(action);
    setTimeout(this.props.onClickCloseChargeFeeFine, 350);
    this.props.mutator.activeRecord.update({ itembarcode: 0 });
  }

  onSubmit(data) {
    this.log('xhr', data);
  }

  onClickSelectItem(barcode) {
    this.props.mutator.activeRecord.update({ itembarcode: barcode });
    buscar = true;
  }

  onChangeOwner(e) {
    ownerId = e.target.value;
    this.props.mutator.activeRecord.update({ ownerId });
    console.log(ownerId);
    console.log('ownerId');
  }

  onFindShared(id) {
    this.props.mutator.activeRecord.update({ shared: id });
  }

  render() {
    const resources = this.props.resources;
    const owners = _.get(resources, ['owners', 'records'], []);
    const feefines = (resources.feefines || {}).records || [];
    const feefinesFilter = feefines.filter(feefine => feefine.allowManualCreation === true);
    const items = (resources.chargeitem || {}).records || [];
    const item = (items[0]) ? items[0] : {};
    selecteditem = item;
    const instances = (resources.instances || {}).records || [];
    const instance = (instances[0]) ? instances[0] : {};
    const user = this.props.user;

    return (
      <ChargeForm
        onClickCancel={this.props.onClickCloseChargeFeeFine}
        onClickCharge={this.onClickCharge}
        onSubmit={data => this.onSubmit(data)}
        user={user}
        owners={owners}
        ownerId={ownerId}
        loan={this.props.loan}
        feefines={feefinesFilter}
        item={item}
        instance={instance}
        onFindShared={this.onFindShared}
        onChangeOwner={this.onChangeOwner}
        onClickSelectItem={this.onClickSelectItem}
        {...this.props}
      />
    );
  }
}

export default Charge;

