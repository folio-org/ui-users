import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';
import Callout from '@folio/stripes-components/lib/Callout';

import EditableList from './EditableList';
import Owners from './Owners';
import CopyModal from './CopyModal';

function validate(type, props) {
  const feefines = props.contentData.map(f => f.feeFineType);
  const items = type.items || [];
  const errors = { items: [] };
  items.forEach((item, i) => {
    errors.items.push({});
    if (Number.isNaN(item.defaultAmount) && item.defaultAmount) { errors.items[i].defaultAmount = 'Default amount must be numeric '; }
    if (parseFloat(item.defaultAmount) < 0) { errors.items[i].defaultAmount = 'Default amount must be positive'; }
    if (Number.isNaN(item.taxVat) && item.taxVat) { errors.items[i].taxVat = 'Tax/Vat must be numeric'; }
    if (parseFloat(item.taxVat) < 0 || parseFloat(item.taxVat) > 100) { errors.items[i].taxVat = 'Tax/Vat must be a numbre between 0 and 100'; }
    if (!item.id) {
      if (props.shared.includes(item.feeFineType) || feefines.includes(item.feeFineType)) {
        errors.items[i].feeFineType = 'The Fee/Fine Type alredy exist';
      }
    }
    if (!item.feeFineType) { errors.items[i].feeFineType = 'Please fill this in to continue'; }
  });
  return errors;
}

class FeeFines extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      feefinesPerOwner: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      accountsPerFeeFine: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      feefines: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      owners: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      allfeefines: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      activeRecord: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      feefines: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired,
      }),
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
    }).isRequired,
    nameKey: PropTypes.string,
    okapi: PropTypes.object,
  };

  static manifest = Object.freeze({
    feefinesPerOwner: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines?limit=0&facets=ownerId',
    },
    accountsPerFeeFine: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?limit=0&facets=feeFineId',
    },
    feefines: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines',
      GET: {
        path: 'feefines?query=(ownerId=%{activeRecord.ownerId})&limit=100',
      },
      PUT: {
        path: 'feefines/%{activeRecord.id}',
      },
      DELETE: {
        path: 'feefines/%{activeRecord.id}',
      },
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?limit=100',
    },
    allfeefines: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines?limit=100',
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      confirming: false,
      type: {},
    };
    this.hideConfirm = this.hideConfirm.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onCopyFeeFines = this.onCopyFeeFines.bind(this);
    this.onCreateType = this.onCreateType.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
    this.onUpdateType = this.onUpdateType.bind(this);
    this.showConfirm = this.showConfirm.bind(this);
    this.callout = null;
  }

  componentWillReceiveProps(nextProps) {
    if ((this.props.resources.owners || {}).records !== (nextProps.resources.owners || {}).records) {
      const shared = ((nextProps.resources.owners || {}).records || []).find(o => o.owner === 'Shared') || {};
      if (shared.id) {
        this.props.mutator.activeRecord.update({ ownerId: shared.id });
      } else {
        const first = ((nextProps.resources.owners || {}).records || [])[0] || {};
        this.props.mutator.activeRecord.update({ ownerId: first.id });
      }
    }
  }

  onCreateType(type) {
    type.ownerId = this.props.resources.activeRecord.ownerId;
    if (type.allowManualCreation === undefined) type.allowManualCreation = true;
    return this.props.mutator.feefines.POST(type);
  }

  onUpdateType(type) {
    this.props.mutator.activeRecord.update({ id: type.id });
    delete type.metadata;
    return this.props.mutator.feefines.PUT(type);
  }

  onDeleteType() {
    const type = this.state.type;
    this.props.mutator.activeRecord.update({ id: type.id });
    delete this.state.type.metadata;
    return this.props.mutator.feefines.DELETE(type)
      .then(() => this.deleteFeeFineResolve())
      .then(() => this.showCalloutMessage(type))
      .catch(() => this.deleteFeeFineReject())
      .finally(() => this.hideConfirm());
  }

  showCalloutMessage(name) {
    const message = (
      <span>
      The Fee/Fine Type <strong>{name.feeFineType}</strong> was successfully <strong>deleted</strong>.
      </span>
    );
    this.callout.sendCallout({ message });
  }

  hideConfirm() {
    this.setState({
      confirming: false,
      type: {},
    });
  }

  showConfirm(typeId) {
    const type = this.props.resources.feefines.records.find(t => t.id === typeId);
    this.setState({
      confirming: true,
      type,
    });
    this.deleteFeeFinePromise = new Promise((resolve, reject) => {
      this.deleteFeeFineResolve = resolve;
      this.deleteFeeFineReject = reject;
    });
    return this.deleteFeeFinePromise;
  }

  onCloseModal() {
    this.setState({
      openModal: false,
    });
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    const owners = (this.props.resources.owners || {}).records || [];
    const count = _.get(this.props.resources, ['feefinesPerOwner', 'other', 'resultInfo', 'facets', 0, 'facetValues'], []);
    const shared = owners.find(o => o.owner === 'Shared') || {};
    const ownerList = count.filter(c => c.value !== shared.id).map(c => c.value);
    this.props.mutator.activeRecord.update({ ownerId });
    if (ownerId !== shared.id && !ownerList.includes(ownerId) && ownerList.length) {
      this.setState({ openModal: true });
    }
  }

  onCopyFeeFines(type) {
    if (type.option === 'true') {
      const feefines = (this.props.resources.allfeefines || {}).records || [];
      feefines.forEach((feefine) => {
        if (feefine.ownerId === type.ownerId) {
          delete feefine.id;
          feefine.ownerId = this.props.resources.activeRecord.ownerId;
          this.props.mutator.feefines.POST(feefine);
        }
      });
    }
    this.onCloseModal();
  }

  render() {
    if (!this.props.resources.feefines) return <div />;

    const data = (this.props.resources.allfeefines || {}).records || [];
    const owners = (this.props.resources.owners || {}).records || [];
    const count = _.get(this.props.resources, ['feefinesPerOwner', 'other', 'resultInfo', 'facets', 0, 'facetValues'], []);
    const shared = owners.find(o => o.owner === 'Shared') || {};
    const sharedFeeFines = data.filter(f => f.ownerId === shared.id).map(f => f.feeFineType);
    const list = count.map(c => ((c.value !== shared.id) ? c.value : ''));
    const ownerList = owners.filter(o => list.includes(o.id));

    const formatter = {
      defaultAmount: i => ((i.defaultAmount) ? parseFloat(i.defaultAmount).toFixed(2) : '-'),
      taxVat: i => ((i.taxVat) ? parseFloat(i.taxVat).toFixed(2) : '-'),
      allowManualCreation: i => ((i.allowManualCreation) ? 'Yes' : 'No'),
    };

    const actionProps = {
      delete: (item) => {
        const accounts = (this.props.resources.accountsPerFeeFine || {}).other || {};
        let disableDelete = [];
        if (_.has(accounts, ['resultInfo', 'facets'])) {
          const facetCount = _.get(accounts, ['resultInfo', 'facets', 0, 'facetValues'], []);
          disableDelete = _.map(facetCount, 'value');
        }
        if (_.includes(disableDelete, item.id)) {
          return {
            disabled: _.includes(disableDelete, item.id),
            title: 'Fee/fine Type cannot be deleted when used by one or more user accounts',
          };
        }
        return {};
      },
    };

    return (
      <div>
        <Owners dataOptions={owners} onChange={this.onChangeOwner} />
        <EditableList
          {...this.props}
          contentData={this.props.resources.feefines.records || []}
          createButtonLabel="+ Add new"
          visibleFields={['feeFineType', 'defaultAmount', 'allowManualCreation', 'taxVat']}
          columnMapping={{ feeFineType: 'Fee/Fine Type*', defaultAmount: 'Default Amount', allowManualCreation: 'Allow Manual Creation?', taxVat: 'Tax/Vat %' }}
          itemTemplate={{}}
          onUpdate={this.onUpdateType}
          onDelete={this.showConfirm}
          onCreate={this.onCreateType}
          nameKey={this.props.nameKey}
          formatter={formatter}
          shared={sharedFeeFines}
          validate={validate}
          actionProps={actionProps}
        />
        <ConfirmationModal
          open={this.state.confirming}
          heading="Delete Fee/Fine Type?"
          message={<span>The Fee/Fine Type <strong>{this.state.type.feeFineType}</strong> will be <strong>deleted</strong></span>}
          onConfirm={this.onDeleteType}
          onCancel={this.hideConfirm}
          confirmLabel="Delete"
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
        <CopyModal
          openModal={this.state.openModal}
          onCloseModal={this.onCloseModal}
          onCopyFeeFines={this.onCopyFeeFines}
          ownerList={ownerList}
        />
      </div>
    );
  }
}

export default FeeFines;
