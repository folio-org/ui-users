import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Modal from '@folio/stripes-components/lib/Modal';

import EditableList from './EditableList';
import Owners from './Owners';
import CopyFeeFines from './CopyFeeFines';

let ownerId = 0;
let ownerList = [];
let render = true;

class FeeFines extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      feefines: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      owners: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      allfeefines: PropTypes.shape({
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
      recordsRequired: 100,
      perRequest: 100,
      path: 'owners',
    },
    allfeefines: {
      type: 'okapi',
      records: 'feefines',
      recordsRequired: 100,
      perRequest: 100,
      path: 'feefines',
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
    };
    this.onCreateType = this.onCreateType.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
    this.onUpdateType = this.onUpdateType.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onCopyFeeFines = this.onCopyFeeFines.bind(this);
  }

  componentWillMount() {
    render = true;
  }

  componentWillReceiveProps(nextProps) {
    if (render && nextProps.resources.owners.records.length !== 0) {
      const shared = ((nextProps.resources.owners || {}).records || []).find(o => o.desc === 'Shared').id;
      ownerId = shared;
      this.props.mutator.activeRecord.update({ ownerId: shared });
      render = false;
    }
  }

  onCreateType(type) {
    type.ownerId = ownerId;
    this.props.mutator.feefines.POST(type);
  }

  onUpdateType(type) {
    this.props.mutator.activeRecord.update({ id: type.id });
    delete type.metadata;
    this.props.mutator.feefines.PUT(type);
  }

  onDeleteType(typeId) {
    this.props.mutator.activeRecord.update({ id: typeId });
    this.props.mutator.feefines.DELETE(this.props.resources.feefines.records.find(t => t.id === typeId));
  }

  onCloseModal() {
    this.setState({
      openModal: false,
    });
  }

  onChangeOwner(e) {
    ownerId = e.target.value;
    const owners = (this.props.resources.owners || {}).records || [];
    const shared = owners.find(o => o.desc === 'Shared') || {};
    this.props.mutator.activeRecord.update({ ownerId });
    const ids = [];
    ownerList.forEach((owner) => {
      ids.push(owner.id);
    });
    if (ids.indexOf(ownerId) < 0 && ids.length !== 0 && ownerId !== shared.id) {
      this.setState({ openModal: true });
    }
  }

  onCopyFeeFines(type) {
    if (type.option === 'true') {
      const feefines = (this.props.resources.allfeefines || {}).records || [];
      feefines.forEach((feefine) => {
        if (feefine.ownerId === type.ownerId) {
          feefine.id = uuid();
          feefine.ownerId = ownerId;
          this.props.mutator.feefines.POST(feefine);
        }
      });
    }
    this.onCloseModal();
  }

  render() {
    const suppressor = {
      delete: () => false,
      edit: () => false,
    };

    const feefines = (this.props.resources.feefines || {}).records || [];
    const data = (this.props.resources.allfeefines || {}).records || [];
    const owners = (this.props.resources.owners || {}).records || [];

    const shared = owners.find(o => o.desc === 'Shared') || {};
    const sharedFeeFines = [];
    data.forEach((f) => {
      if (f.ownerId === shared.id) {
        sharedFeeFines.push(f.feeFineType);
      }
    });

    const list = [];
    ownerList = [];

    data.forEach((feefine) => {
      if (list.indexOf(feefine.ownerId) < 0) {
        list.push(feefine.ownerId);
      }
    });

    owners.forEach((owner) => {
      if (list.indexOf(owner.id) >= 0) {
        ownerList.push(owner);
      }
    });

    const formatter = {
      defaultAmount: i => ((i.defaultAmount) ? parseFloat(i.defaultAmount).toFixed(2) : '-'),
      taxVat: i => ((i.taxVat) ? parseFloat(i.taxVat).toFixed(2) : '-'),
      allowManualCreation: i => ((i.allowManualCreation === true) ? 'Yes' : 'No'),
    };

    return (
      <div>
        <Row>
          <Col>
            <span style={{ fontSize: 'large', fontWeight: '600', marginLeft: '8px' }}>
              Fee/Fine Owner
            </span>
          </Col>
          <Col><Owners dataOptions={owners} onChange={this.onChangeOwner} /></Col>
        </Row>
        <EditableList
          {...this.props}
          contentData={feefines}
          createButtonLabel="+ Add new"
          visibleFields={['feeFineType', 'defaultAmount', 'allowManualCreation', 'taxVat']}
          columnMapping={
            { feeFineType: 'Fee/Fine Type*',
              defaultAmount: 'Default Amount',
              allowManualCreation: 'Allow Manual Creation?',
              taxVat: 'Tax/Vat %' }}
          itemTemplate={
            { id: 'number',
              feeFineType: 'string',
              defaultAmount: 'string',
              allowManualCreation: 'string',
              taxVat: 'string' }}
          onUpdate={this.onUpdateType}
          onDelete={this.onDeleteType}
          onCreate={this.onCreateType}
          nameKey={this.props.nameKey}
          actionSuppression={suppressor}
          formatter={formatter}
          shared={sharedFeeFines}
        />
        <Modal
          open={this.state.openModal}
          label="Copy existing fee/fine owner table entries?"
          size="small"
          onClose={this.onCloseModal}
        >
          <CopyFeeFines
            onClose={this.onCloseModal}
            onSubmit={(type) => { this.onCopyFeeFines(type); }}
            owners={ownerList}
          />
        </Modal>
      </div>
    );
  }
}

export default FeeFines;
