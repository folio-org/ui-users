import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import EditableList from '@folio/stripes-components/lib/structures/EditableList';
import Pane from '@folio/stripes-components/lib/Pane';
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';
import Callout from '@folio/stripes-components/lib/Callout';

const INITIAL_RESULT_COUNT = 10;
const RESULT_COUNT_INCREMENT = 10;

function validate(values, props) {
  const errors = [];
  if (Array.isArray(values.items)) {
    const itemArrayErrors = [];
    values.items.forEach((item, itemIndex) => {
      const itemErrors = {};
      if (!item.id) {
        if (props.ownerList.includes(item.owner)) {
          itemErrors.owner = 'This owner is already exist';
          itemArrayErrors[itemIndex] = itemErrors;
        }
      }
      if (!item.owner) {
        itemErrors.owner = 'Please fill this in to continue';
        itemArrayErrors[itemIndex] = itemErrors;
      }
    });
    if (itemArrayErrors.length) {
      errors.items = itemArrayErrors;
    }
  }

  return errors;
}

class OwnersTypesSettings extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      accountsPerOwner: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      feefinesPerOwner: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      owners: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      resultCount: PropTypes.number,
    }),
    mutator: PropTypes.shape({
      owners: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired,
      }),
      resultCount: PropTypes.shape({
        replace: PropTypes.func,
      }),
      activeRecord: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    accountsPerOwner: {
      type: 'okapi',
      records: 'accounts',
      path: 'accounts?limit=0&facets=ownerId',
    },
    feefinesPerOwner: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines?limit=0&facets=ownerId',
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners',
      recordsRequired: '%{resultCount}',
      perRequest: 10,
      PUT: {
        path: 'owners/%{activeRecord.id}',
      },
      DELETE: {
        path: 'owners/%{activeRecord.id}',
      },
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);
    this.state = {
      confirming: false,
      type: {},
    };
    this.onCreateType = this.onCreateType.bind(this);
    this.hideConfirm = this.hideConfirm.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
    this.onUpdateType = this.onUpdateType.bind(this);
    this.showConfirm = this.showConfirm.bind(this);

    this.callout = null;
  }

  hideConfirm() {
    this.setState({
      confirming: false,
      type: {},
    });
  }

  onCreateType(type) {
    return this.props.mutator.owners.POST(type);
  }

  onDeleteType() {
    const type = this.state.type;
    this.props.mutator.activeRecord.update({ id: type.id });
    delete this.state.type.metadata;
    return this.props.mutator.owners.DELETE(type)
      .then(() => this.deleteOwnerResolve())
      .then(() => this.showCalloutMessage(type))
      .catch(() => this.deleteOwnerReject())
      .finally(() => this.hideConfirm());
  }

  onNeedMore = () => {
    this.props.mutator.resultCount.replace(this.props.resources.resultCount + RESULT_COUNT_INCREMENT);
  }

  onUpdateType(type) {
    this.props.mutator.activeRecord.update({ id: type.id });
    delete type.metadata;
    return this.props.mutator.owners.PUT(type);
  }

  showCalloutMessage(name) {
    const message = (
      <span>
        The Fee/Fine Owner <strong>{name.owner}</strong> was successfully <strong>deleted</strong>.
      </span>
    );
    this.callout.sendCallout({ message });
  }

  showConfirm(typeId) {
    const type = this.props.resources.owners.records.find(t => t.id === typeId);
    this.setState({
      confirming: true,
      type,
    });

    this.deleteOwnerPromise = new Promise((resolve, reject) => {
      this.deleteOwnerResolve = resolve;
      this.deleteOwnerReject = reject;
    });
    return this.deleteOwnerPromise;
  }

  render() {
    if (!this.props.resources.owners) return <div />;

    const actionProps = {
      delete: (item) => {
        const accounts = (this.props.resources.accountsPerOwner || {}).other || {};
        const feefines = (this.props.resources.feefinesPerOwner || {}).other || {};
        let disableDelete = [];
        if (_.has(accounts, ['resultInfo', 'facets'])) {
          const count = _.get(accounts, ['resultInfo', 'facets', 0, 'facetValues'], []);
          const countFeeFines = _.get(feefines, ['resultInfo', 'facets', 0, 'facetValues'], []);
          disableDelete = _.map(count, 'value').concat(_.map(countFeeFines, 'value'));
        }
        if (_.includes(disableDelete, item.id)) {
          return {
            disabled: _.includes(disableDelete, item.id),
            title: 'Fee/fine Owner cannot be deleted when used by one or more Fee/fine Types',
          };
        }
        return {};
      },
    };

    const ownerList = ((this.props.resources.owners || {}).records || []).map(o => (o.owner));
    const message = (
      <span>
        The Fee/Fine Owner <strong>{this.state.type.owner}</strong> will be <strong>deleted</strong>
      </span>
    );

    return (
      <Pane defaultWidth="fill" fluidContentWidth paneTitle="Fee/Fine Owners">
        <EditableList
          contentData={this.props.resources.owners.records || []}
          visibleFields={['owner', 'desc']}
          columnMapping={{ owner: 'Owner*', desc: 'Description' }}
          itemTemplate={{}}
          isEmptyMessage="There are no owners"
          ownerList={ownerList}
          onUpdate={this.onUpdateType}
          onDelete={this.showConfirm}
          onCreate={this.onCreateType}
          actionProps={actionProps}
          onNeedMoreData={this.onNeedMore}
          nameKey="owner"
          validate={validate}
          label="Fee/Fine Owners"
        />
        <ConfirmationModal
          open={this.state.confirming}
          heading="Delete Fee/Fine Owner?"
          onConfirm={this.onDeleteType}
          onCancel={this.hideConfirm}
          message={message}
          confirmLabel="Delete"
        />
        <Callout ref={(ref) => { this.callout = ref; }} />
      </Pane>
    );
  }
}

export default OwnersTypesSettings;
