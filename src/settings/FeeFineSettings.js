import _ from 'lodash';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import {
  Button,
  Callout,
  ConfirmationModal,
  Pane,
  Paneset,
  Row,
  Col,
  Modal,
} from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { EditableList } from '@folio/stripes/smart-components';
import { validate } from '../util';

import { Owners, CopyModal } from './FeeFinesTable';

class FeefineSettings extends React.Component {
  static manifest = Object.freeze({
    feefines: {
      type: 'okapi',
      records: 'feefines',
      path: 'feefines',
      throwErrors: false,
      PUT: {
        path: 'feefines/%{activeRecord.id}',
      },
      DELETE: {
        path: 'feefines/%{activeRecord.id}',
      },
      GET: {
        path: 'feefines?query=cql.allRecords=1 sortby feeFineType&limit=500',
      },
    },
    ownerList: {
      type: 'okapi',
      records: 'owners',
      path: 'owners',
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);

    this.state = {
      showConfirmDialog: false,
      showCopyDialog: false,
      showItemInUseDialog: false,
      selectedItem: {},
      ownerId: '',
    };

    this.onCreateItem = this.onCreateItem.bind(this);
    this.onUpdateItem = this.onUpdateItem.bind(this);
    this.onDeleteItem = this.onDeleteItem.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
    this.hideCopyDialog = this.hideCopyDialog.bind(this);
    this.hideItemInUseDialog = this.hideItemInUseDialog.bind(this);
    this.validate = this.validate.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onCopyFeeFines = this.onCopyFeeFines.bind(this);
  }

  componentDidMount() {
    const owners = _.get(this.props.resources, ['ownerList', 'records'], []);
    const shared = owners.find(o => o.owner === 'Shared');
    const ownerId = (shared) ? shared.id : ((owners.length > 0) ? owners[0].id : '');
    this.setState({ ownerId });
  }

  componentDidUpdate(prevProps) {
    const prevOwners = _.get(prevProps.resources, ['ownerList', 'records'], []);
    const owners = _.get(this.props.resources, ['ownerList', 'records'], []);
    if (JSON.stringify(prevOwners) !== JSON.stringify(owners) && owners.length) {
      const shared = owners.find(o => o.owner === 'Shared');
      this.shared = shared;
      const ownerId = (shared) ? shared.id : owners[0].id;
      this.setState({ ownerId });
    }
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    this.setState({ ownerId });
    const nextFeeFines = _.get(this.props.resources, ['feefines', 'records'], [])
      .filter(f => f.ownerId === ownerId) || [];
    if (!nextFeeFines.length && ownerId !== (this.shared || {}).id) {
      this.setState({ showCopyDialog: true });
    }
  }

  onCopyFeeFines(values) {
    const { ownerId, option } = values;
    const feefines = _.get(this.props.resources, ['feefines', 'records'], []);
    if (option === 'true') {
      const source = feefines.filter(f => f.ownerId === ownerId) || [];
      source.forEach(item => {
        delete item.id;
        this.onCreateItem(item);
      });
    }
    this.hideCopyDialog();
  }

  onCreateItem(item) {
    item.ownerId = this.state.ownerId;
    return this.props.mutator.feefines.POST(item);
  }

  onUpdateItem(item) {
    this.props.mutator.activeRecord.update({ id: item.id });
    return this.props.mutator.feefines.PUT(item);
  }

  onDeleteItem() {
    const { selectedItem } = this.state;
    delete selectedItem.metadata;
    this.props.mutator.activeRecord.update({ id: selectedItem.id });
    return this.props.mutator.feefines.DELETE(selectedItem)
      .then(() => {
        this.showDeletionSuccessCallout(selectedItem);
        this.deleteItemResolve();
      }).catch(() => {
        this.setState({ showItemInUseDialog: true });
        this.deleteItemReject();
      })
      .finally(() => { this.hideConfirmDialog(); });
  }

  showDeletionSuccessCallout = (item) => {
    const message = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termDeleted"
        values={{
          type: this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.singular' }),
          term: item.feeFineType,
        }}
      />
    );

    this.callout.sendCallout({ message });
  }


  showConfirmDialog(itemId) {
    const records = _.get(this.props.resources, ['feefines', 'records'], []);
    const selectedItem = records.find(r => r.id === itemId);
    this.setState({
      showConfirmDialog: true,
      selectedItem,
    });

    return new Promise((resolve, reject) => {
      this.deleteItemResolve = resolve;
      this.deleteItemReject = reject;
    });
  }

  hideConfirmDialog() {
    this.setState({
      showConfirmDialog: false,
      selectedItem: {},
    });
  }

  hideCopyDialog() {
    this.setState({
      showCopyDialog: false,
    });
  }

  hideItemInUseDialog() {
    this.setState({
      showItemInUseDialog: false,
      selectedItem: {},
    });
  }

  includes(item, index, items) {
    for (let i = 0; i < items.length; i++) {
      const myItem = items[i];
      if (((myItem || {}).feeFineType || '').toLowerCase() === ((item || {}).feeFineType || '').toLowerCase()
        && myItem.id !== item.id) {
        return myItem.ownerId;
      }
    }
    return null;
  }

  validate({ items }) {
    if (Array.isArray(items)) {
      const errors = [];
      const feefines = _.get(this.props.resources, ['feefines', 'records'], []);
      const owners = _.get(this.props.resources, ['ownerList', 'records'], []);
      const myFeeFines = feefines.filter(f => f.ownerId !== this.state.ownerId) || [];

      items.forEach((item, index) => {
        const itemErrors = validate(item, index, items, 'feeFineType', 'Fee fine');
        if (Number.isNaN(item.defaultAmount) && item.defaultAmount !== null) {
          itemErrors.defaultAmount = this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.errors.amountNumeric' });
        }
        if (parseFloat(item.defaultAmount) < 0) {
          itemErrors.defaultAmount = this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.errors.amountPositive' });
        }
        if (this.state.ownerId === (this.shared || {}).id) {
          const includes = this.includes(item, index, myFeeFines, 'feeFineType', 'ownerId');
          if (includes) {
            itemErrors.feeFineType =
              <SafeHTMLMessage
                id="ui-users.feefines.errors.existShared"
                values={{ owner: (owners.find(o => o.id === includes) || {}).owner }}
              />;
          }
        } else {
          const shareds = feefines.filter(f => f.ownerId === (this.shared || {}).id) || [];
          const includes = this.includes(item, index, shareds, 'feeFineType', 'ownerId');
          if (includes) {
            itemErrors.feeFineType =
              <SafeHTMLMessage
                id="ui-users.feefines.errors.existShared"
                values={{ owner: 'Shared' }}
              />;
          }
        }
        errors[index] = itemErrors;
      });
      return { items: errors };
    }
    return {};
  }

  render() {
    if (!this.props.resources.feefines) return <div />;

    const { intl: { formatMessage } } = this.props;
    const items = _.get(this.props.resources, ['feefines', 'records'], []);
    const rows = items.filter(i => i.ownerId === this.state.ownerId);
    const type = this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.singular' });
    const term = this.state.selectedItem.feeFineType;
    const owners = _.get(this.props.resources, ['ownerList', 'records'], []);
    const filterOwners = [];
    items.forEach(i => {
      const owner = owners.find(o => o.id === i.ownerId) || {};
      if (!filterOwners.some(o => o.id === owner.id)) {
        filterOwners.push(owner);
      }
    });

    const modalMessage = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termWillBeDeleted"
        values={{ type, term }}
      />
    );

    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.title' })}>
          <Owners dataOptions={owners} onChange={this.onChangeOwner} />
          <EditableList
            {...this.props}
            label={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.title' })}
            validate={this.validate}
            contentData={rows}
            createButtonLabel={formatMessage({ id: 'stripes-core.button.new' })}
            visibleFields={['feeFineType', 'defaultAmount']}
            columnMapping={{
              feeFineType: this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.columns.type' }),
              defaultAmount: this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.columns.amount' })
            }}
            onUpdate={this.onUpdateItem}
            onCreate={this.onCreateItem}
            onDelete={this.showConfirmDialog}
            isEmptyMessage={
              formatMessage({ id: 'stripes-smart-components.cv.noExistingTerms' },
                { terms: 'label' })
            }
          />
          <ConfirmationModal
            id={`delete${type.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-confirmation`}
            open={this.state.showConfirmDialog}
            heading={formatMessage({ id: 'stripes-core.button.deleteEntry' }, { entry: type })}
            message={modalMessage}
            onConfirm={this.onDeleteItem}
            onCancel={this.hideConfirmDialog}
            confirmLabel={formatMessage({ id: 'stripes-core.button.delete' })}
          />
          <CopyModal
            {...this.props}
            openModal={this.state.showCopyDialog}
            onCopyFeeFines={this.onCopyFeeFines}
            onCloseModal={this.hideCopyDialog}
            ownerList={filterOwners}
          />
          <Modal
            open={this.state.showItemInUseDialog}
            label={<FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermHeader" values={{ type }} />}
            size="small"
          >
            <Row>
              <Col xs>
                <FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermMessage" values={{ type }} />
              </Col>
            </Row>
            <Row>
              <Col xs>
                <Button buttonStyle="primary" onClick={this.hideItemInUseDialog}>
                  <FormattedMessage id="stripes-core.label.okay" />
                </Button>
              </Col>
            </Row>
          </Modal>
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default injectIntl(FeefineSettings);
