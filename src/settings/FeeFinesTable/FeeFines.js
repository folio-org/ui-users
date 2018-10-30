import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { ConfirmationModal, Callout } from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { EditableList } from '@folio/stripes/smart-components';
import Owners from './Owners';
import CopyModal from './CopyModal';

function includes(arr, str, input, out) {
  const items = [];
  for (let i = 0; i < arr.length; i++) {
    const obj = arr[i];
    if (obj[input].localeCompare(str, 'sv', { sensitivity: 'base' }) === 0) {
      items.push(obj[out]);
    }
  }
  return items;
}

function validate(type, props) {
  const items = type.items || [];
  const owners = _.get(props.resources, ['owners', 'records'], []);
  const ownerId = _.get(props.resources, ['activeRecord', 'ownerId'], '');
  const errors = { items: [] };
  items.forEach((item, i) => {
    const allfeefines = _.get(props.resources, ['allfeefines', 'records'], []);
    errors.items.push({});
    if (Number.isNaN(item.defaultAmount) && item.defaultAmount) { errors.items[i].defaultAmount = props.stripes.intl.formatMessage({ id: 'ui-users.feefines.errors.amountNumeric' }); }
    if (parseFloat(item.defaultAmount) < 0) { errors.items[i].defaultAmount = props.stripes.intl.formatMessage({ id: 'ui-users.feefines.errors.amountPositive' }); }

    const exist = includes(allfeefines.filter(f => f.id !== item.id), item.feeFineType, 'feeFineType', 'ownerId') || '';
    const shared = owners.find(o => o.owner === 'Shared') || {};
    if (exist.length > 0) {
      if (exist.find(e => e === ownerId)) {
        errors.items[i].feeFineType = props.stripes.intl.formatMessage({ id: 'ui-users.feefines.errors.exist' });
      } else if (ownerId === shared.id) {
        errors.items[i].feeFineType = <SafeHTMLMessage
          id="ui-users.feefines.errors.existShared"
          values={{ owner: (owners.find(o => o.id === exist[0]) || {}).owner }}
        />;
      } else if (exist.find(e => e === shared.id)) {
        errors.items[i].feeFineType = <SafeHTMLMessage
          id="ui-users.feefines.errors.existShared"
          values={{ owner: 'Shared' }}
        />;
      }
    }


    if (!item.feeFineType) { errors.items[i].feeFineType = props.stripes.intl.formatMessage({ id: 'ui-users.errors.missingRequiredField' }); }
  });
  return errors;
}

class FeeFines extends React.Component {
  static manifest = Object.freeze({
    feefinesPerOwner: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines',
    },
    accountsPerFeeFine: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts',
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
    nextfeefines: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines',
      accumulate: 'true',
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
    stripes: PropTypes.shape({
      intl: PropTypes.object,
    }),
    okapi: PropTypes.object,
  };

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

  componentDidUpdate(prevProps) {
    if ((this.props.resources.owners || {}).records !== (prevProps.resources.owners || {}).records) {
      const shared = ((this.props.resources.owners || {}).records || []).find(o => o.owner === 'Shared') || {};
      if (shared.id) {
        this.props.mutator.activeRecord.update({ ownerId: shared.id });
      } else {
        const first = ((this.props.resources.owners || {}).records || [])[0] || {};
        this.props.mutator.activeRecord.update({ ownerId: first.id });
      }
    }
  }

  onCreateType(type) {
    type.ownerId = this.props.resources.activeRecord.ownerId;
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
        <SafeHTMLMessage
          id="ui-users.feefines.callout"
          values={{ feefine: name.feeFineType }}
        />
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
    const query = `ownerId=${ownerId}`
    const owners = (this.props.resources.owners || {}).records || [];
    const shared = owners.find(o => o.owner === 'Shared') || {};
    this.props.mutator.nextfeefines.GET({ query }).then(records => {
      const nextFeeFines = records.filter(f => f.ownerId === ownerId) || [];
      if (nextFeeFines.length === 0 && ownerId !== shared.id) {
        this.setState({ openModal: true });
      }
    });
    this.props.mutator.activeRecord.update({ ownerId });
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
    const allfeefines = _.get(this.props.resources, ['allfeefines', 'records'], []);
    const count = _.get(this.props.resources, ['feefinesPerOwner', 'other', 'resultInfo', 'facets', 0, 'facetValues'], []);
    const shared = owners.find(o => o.owner === 'Shared') || {};
    const sharedFeeFines = data.filter(f => f.ownerId === shared.id).map(f => f.feeFineType);
    const list = [];
    allfeefines.forEach(f => {
      if (!list.find(l => l.id === f.ownerId) && f.ownerId !== shared.id) {
        list.push(owners.find(o => o.id === f.ownerId));
      }
    });
    const ownerList = owners.filter(o => list.includes(o.id));

    const formatter = {
      defaultAmount: i => ((i.defaultAmount) ? parseFloat(i.defaultAmount).toFixed(2) : '-'),
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
            title: this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.disabledItem' }),
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
          label={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.title' })}
          createButtonLabel={this.props.stripes.intl.formatMessage({ id: 'stripes-core.button.new' })}
          contentData={this.props.resources.feefines.records || []}
          visibleFields={['feeFineType', 'defaultAmount']}
          columnMapping={{
            feeFineType: this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.columns.type' }),
            defaultAmount: this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.columns.amount' })
          }}
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
          heading={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modalHeader' })}
          message={<SafeHTMLMessage id="ui-users.feefines.modalMessage" values={{ feefine: this.state.type.feeFineType }} />}
          onConfirm={this.onDeleteType}
          onCancel={this.hideConfirm}
          confirmLabel="Delete"
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
        <CopyModal
          {...this.props}
          openModal={this.state.openModal}
          onCloseModal={this.onCloseModal}
          onCopyFeeFines={this.onCopyFeeFines}
          ownerList={list}
        />
      </div>
    );
  }
}

export default FeeFines;
