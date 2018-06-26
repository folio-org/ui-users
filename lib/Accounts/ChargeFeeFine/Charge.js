import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';

import ChargeForm from './ChargeForm';

class Charge extends React.Component {
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
    instances: {
      type: 'okapi',
      records: 'instances',
      path: 'instance-storage/instances?query=%{activeRecord.queryInstance}',
    },
    locations: {
      type: 'okapi',
      record: 'shelflocations',
      path: 'shelf-locations',
    },
    material: {
      type: 'okapi',
      record: 'mtypes',
      path: 'material-types',
    },
    barcodes: {
      type: 'okapi',
      record: 'items',
      path: 'item-storage/items?query=%{activeRecord.queryItem}',
    },
    holdings: {
      type: 'okapi',
      record: 'holdingsRecords',
      path: 'holdings-storage/holdings?query=%{activeRecord.query}',
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
    stripes: PropTypes.object,
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
    };
    this.onClickCharge = this.onClickCharge.bind(this);
    this.onClickSelectItem = this.onClickSelectItem.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onFindShared = this.onFindShared.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.item = {};
  }

  componentDidMount() {
    this.item.load = true;
    if (this.props.selectedLoan.id) {
      this.props.mutator.activeRecord.update({ item: this.props.selectedLoan.item.barcode });
    } else {
      this.props.mutator.activeRecord.update({ item: 0 });
    }
  }

  shouldComponentUpdate(nextProps) {
    const bar = _.get(this.props.resources, ['barcodes', 'records', 0, 'items'], []);
    const nextBar = _.get(nextProps.resources, ['barcodes', 'records', 0, 'items'], []);
    const title = _.get(this.props.resources, ['instances', 'records'], []);
    const nextTitle = _.get(nextProps.resources, ['instances', 'records'], []);
    const holdings = _.get(this.props.resources, ['holdings', 'records', 0, 'holdingsRecords'], []);
    const nextHoldings = _.get(nextProps.resources, ['holdings', 'records', 0, 'holdingsRecords'], []);

    if (bar !== nextBar && nextBar.length === 1) {
      if (!this.item.barcode) {
        this.item.barcode = nextBar[0].barcode;
        this.item.itemStatus = (nextBar[0].status || {}).name || '';
        this.props.mutator.activeRecord.update({ query: 'id=' + nextBar[0].holdingsRecordId });
        return false;
      }
      this.item.barcode = nextBar[0].barcode;
      this.item.itemStatus = (nextBar[0].status || {}).name || '';
    } else if (title !== nextTitle && nextTitle.length === 1) {
      if (!this.item.instance) {
        this.item.instance = nextTitle[0].title;
        this.props.mutator.activeRecord.update({ query: 'instanceId=' + nextTitle[0].id });
        return false;
      }
      this.item.instance = nextTitle[0].title;
    } else if (holdings !== nextHoldings) {
      if (!this.item.barcode && nextHoldings.length === 1) {
        this.item.barcode = nextHoldings[0].id;
        this.props.mutator.activeRecord.update({ queryItem: 'holdingsRecordId=' + nextHoldings[0].id });
        return false;
      } else if (!this.item.instance && nextHoldings.length === 1) {
        this.item.instance = nextHoldings[0].instanceId;
        this.props.mutator.activeRecord.update({ queryInstance: 'id=' + nextHoldings[0].instanceId });
        return false;
      }
    }
    return true;
  }

  componentWillUnmount() {
    this.props.mutator.activeRecord.update({
      query: 'id=0',
      queryItem: 'id=0',
      queryInstance: 'id=0',
    });
  }

  onClickCharge(type) {
    const instances = _.get(this.props.resources, ['instances', 'records', 0], {});
    const locations = _.get(this.props.resources, ['locations', 'records', 0, 'shelflocations'], []);
    const barcodes = _.get(this.props.resources, ['barcodes', 'records', 0, 'items', 0], {});
    const material = _.get(this.props.resources, ['material', 'records', 0, 'mtypes'], []);
    const holdings = _.get(this.props.resources, ['holdings', 'records', 0, 'holdingsRecords', 0], {});

    const owners = _.get(this.props.resources, ['owners', 'records'], []);
    const feefines = _.get(this.props.resources, ['feefines', 'records'], []);

    const item = {
      title: instances.title || '',
      barcode: barcodes.barcode || '',
      itemStatus: (barcodes.status || {}).name || '',
      callNumber: holdings.callNumber || '',
      location: (locations.find(l => l.id === holdings.permanentLocationId) || {}).name || '',
      type: (material.find(m => m.id === barcodes.materialTypeId) || {}).name || '',
      materialTypeId: (material.find(m => m.id === barcodes.materialTypeId) || {}).id || '0'
    };
    type.feeFineType = feefines.find(f => f.id === type.feeFineId).feeFineType || '';
    type.feeFineOwner = owners.find(o => o.id === type.ownerId).owner || '';
    type.title = item.title;
    type.barcode = item.barcode;
    type.paymentStatus = {
      name: item.itemStatus,
    };
    type.callNumber = item.callNumber;
    type.location = item.location;
    type.materialType = item.type;

    const date = new Date();
    const action = {};
    type.id = uuid();
    type.loanId = this.props.selectedLoan.id || '0';
    type.userId = this.props.user.id;
    type.itemId = this.item.id || '0';
    type.materialTypeId = item.materialTypeId;
    const source = `${this.props.okapi.currentUser.lastName}, ${this.props.okapi.currentUser.firstName}`;
    action.id = uuid();
    action.accountId = type.id;
    action.userId = type.userId;
    action.dateAction = moment(date);
    action.typeAction = (feefines.find(f => f.id === type.feeFineId) || {}).feeFineType || '';
    action.source = source;
    action.transactionNumber = 0;
    action.createdAt = 'Main Library';
    if (type.comments) {
      action.comments = type.comments;
    }
    action.amountAction = type.amount;
    action.balance = type.remaining;
    delete type.comments;
    this.props.mutator.accounts.POST(type)
      .then(() => this.props.mutator.feefineactions.POST(action));
    this.props.handleAddRecords();
    setTimeout(this.props.onCloseChargeFeeFine, 350);
  }

  onSubmit(data) {
    this.log('xhr', data);
  }

  onClickSelectItem(search) {
    this.item = {};
    this.item.load = false;
    if (search === '' || search === '0') {
      this.item.load = true;
    } else if (Number.isNaN(Number(search))) {
      this.props.mutator.activeRecord.update({ queryInstance: 'title=' + search });
    } else {
      this.props.mutator.activeRecord.update({ queryItem: 'barcode=' + search });
    }
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    this.props.mutator.activeRecord.update({ ownerId });
    this.setState({
      ownerId,
    });
  }

  onFindShared(id) {
    this.props.mutator.activeRecord.update({ shared: id });
  }

  render() {
    const resources = this.props.resources;
    const owners = _.get(resources, ['owners', 'records'], []);
    const feefines = (this.state.ownerId !== '0') ? (resources.feefines || {}).records || [] : [];
    const instances = _.get(this.props.resources, ['instances', 'records', 0], {});
    const locations = _.get(this.props.resources, ['locations', 'records', 0, 'shelflocations'], []);
    const barcodes = _.get(this.props.resources, ['barcodes', 'records', 0, 'items', 0], {});
    const material = _.get(this.props.resources, ['material', 'records', 0, 'mtypes'], []);
    const holdings = _.get(this.props.resources, ['holdings', 'records', 0, 'holdingsRecords', 0], {});

    const item = (!this.item.load) ? {
      instance: instances.title || '',
      barcode: barcodes.barcode || '',
      itemStatus: (barcodes.status || {}).name || '',
      callNumber: holdings.callNumber || '',
      location: (locations.find(l => l.id === holdings.permanentLocationId) || {}).name || '',
      type: (material.find(m => m.id === barcodes.materialTypeId) || {}).name || '',
    } : {};

    return (
      <ChargeForm
        onClickCancel={this.props.onCloseChargeFeeFine}
        onClickCharge={this.onClickCharge}
        onSubmit={data => this.onSubmit(data)}
        user={this.props.user}
        owners={owners}
        ownerId={this.state.ownerId}
        feefines={feefines}
        item={item}
        onFindShared={this.onFindShared}
        onChangeOwner={this.onChangeOwner}
        onClickSelectItem={this.onClickSelectItem}
        stripes={this.props.stripes}
      />
    );
  }
}

export default Charge;

