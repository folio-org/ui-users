import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import dateFormat from 'dateformat';

import ChargeForm from './ChargeForm';

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
    onCloseChargeFeeFine: PropTypes.func.isRequired,
    handleAddRecords: PropTypes.func,
    okapi: PropTypes.object,
    selectedLoan: PropTypes.object,
    loan: PropTypes.object,
    user: PropTypes.object,
  };

  static manifest = Object.freeze({
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
    },
    chargeitem: {
      type: 'okapi',
      records: 'chargeitem',
      GET: {
        path: 'chargeitem?query=(instance=%{activeRecord.item} or barcode=%{activeRecord.item})',
      },
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);
    this.state = {
      ownerId: '0',
    };
    this.onClickCharge = this.onClickCharge.bind(this);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onFindShared = this.onFindShared.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.item = {};
  }

  componentWillMount() {
    if (this.props.selectedLoan.id) {
      this.props.mutator.activeRecord.update({ item: this.props.selectedLoan.item.barcode });
    } else {
      this.props.mutator.activeRecord.update({ item: 0 });
    }
  }

  onClickCharge(type) {
    const date = new Date();
    const action = {};
    type.id = uuid();
    type.metadata = {
      createdDate: dateFormat(date, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      updatedDate: dateFormat(date, "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      createdByUserId: '1ad737b0-d847-11e6-bf26-cec0c932ce01',
    };
    type.loanId = this.props.selectedLoan.id || '0';
    type.userId = this.props.user.id;
    type.itemId = this.item.id || '0';
    type.materialTypeId = this.item.materialTypeId || '0';
    const source = `${this.props.okapi.currentUser.lastName}, ${this.props.okapi.currentUser.firstName}`;
    action.id = uuid();
    action.dateAction = (type.metadata || {}).createdDate || '';
    const feefines = _.get(this.props.resources, ['feefines', 'records'], []);
    action.typeAction = (feefines.find(f => f.id === type.feeFineId) || {}).feeFineType || '';
    if (type.comments) {
      action.comments = type.comments;
    }
    action.amountAction = type.amount;
    action.balance = type.remaining;
    action.transactionNumber = 0;
    action.createdAt = 'Main Library';
    action.source = source;
    action.accountId = type.id;
    action.userId = type.userId;
    delete type.comments;
    this.props.mutator.accounts.POST(type)
      .then(() => this.props.mutator.feefineactions.POST(action));
    this.props.handleAddRecords();
    setTimeout(this.props.onCloseChargeFeeFine, 350);
  }

  onSubmit(data) {
    this.log('xhr', data);
  }

  onClickSelectItem(barcode) {
    this.props.mutator.activeRecord.update({ item: barcode });
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    this.setState({
      ownerId,
    });
    this.props.mutator.activeRecord.update({ ownerId });
  }

  onFindShared(id) {
    this.props.mutator.activeRecord.update({ shared: id });
  }

  render() {
    const resources = this.props.resources;
    const owners = _.get(resources, ['owners', 'records'], []);
    const feefines = (this.state.ownerId !== '0') ? (resources.feefines || {}).records || [] : [];
    const feefinesFilter = feefines.filter(feefine => feefine.allowManualCreation === true);
    const item = _.get(resources, ['chargeitem', 'records', 0], {});
    this.item = item;

    return (
      <ChargeForm
        onClickCancel={this.props.onCloseChargeFeeFine}
        onClickCharge={this.onClickCharge}
        onSubmit={data => this.onSubmit(data)}
        user={this.props.user}
        owners={owners}
        ownerId={this.state.ownerId}
        feefines={feefinesFilter}
        item={item}
        onFindShared={this.onFindShared}
        onChangeOwner={this.onChangeOwner}
        onClickSelectItem={this.onClickSelectItem}
        {...this.props}
      />
    );
  }
}

export default Charge;

