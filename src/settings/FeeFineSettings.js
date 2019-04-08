import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
  FormattedMessage
} from 'react-intl';
import {
  Button,
  Callout,
  ConfirmationModal,
  Pane,
  Paneset,
  Row,
  Col,
  Modal,
  Select,
} from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { Field } from 'redux-form';
import { EditableList } from '@folio/stripes/smart-components';
import { stripesConnect } from '@folio/stripes/core';
import { validate } from '../util';

import {
  Owners,
  CopyModal,
  ChargeNotice
} from './FeeFinesTable';

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
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?query=cql.allRecords=1 sortby owner&limit=500',
      accumulate: 'true',
      PUT: {
        path: 'owners/%{activeRecord.ownerId}',
      }
    },
    templates: {
      type: 'okapi',
      records: 'templates',
      path: 'templates?limit=50&query=cql.allRecords=1 AND category=""',
      accumulate: 'true',
    },
    activeRecord: {},
  });

  static propTypes = {
    mutator: PropTypes.object,
    resources: PropTypes.object,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showConfirmDialog: false,
      showCopyDialog: false,
      showItemInUseDialog: false,
      selectedItem: {},
      ownerId: '',
      owners: [],
      templates: [],
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
    this.onUpdateOwner = this.onUpdateOwner.bind(this);
  }

  componentDidMount() {
    this.props.mutator.owners.GET().then(records => {
      this.setState({ owners: records });
      const shared = records.find(o => o.owner === 'Shared');
      this.shared = shared;
      const ownerId = (shared) ? shared.id : ((records.length > 0) ? records[0].id : '');
      this.setState({ ownerId });
    });
    this.props.mutator.templates.GET().then(records => {
      this.setState({ templates: records });
    });
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    this.setState({ ownerId });
    const nextFeeFines = _.get(this.props.resources, ['feefines', 'records'], [])
      .filter(f => f.ownerId === ownerId) || [];
    const filterOwners = this.getOwners();
    if (!nextFeeFines.length && (ownerId !== (this.shared || {}).id) && !!filterOwners.length) {
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
    const { intl: { formatMessage } } = this.props;
    const message = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termDeleted"
        values={{
          type: formatMessage({ id: 'ui-users.feefines.singular' }),
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
    const { intl: { formatMessage } } = this.props;
    if (Array.isArray(items)) {
      const errors = [];
      const feefines = _.get(this.props.resources, ['feefines', 'records'], []);
      //      const owners = _.get(this.props.resources, ['owners', 'records'], []);
      const { owners } = this.state;
      const myFeeFines = feefines.filter(f => f.ownerId !== this.state.ownerId) || [];

      items.forEach((item, index) => {
        const itemErrors = validate(item, index, items, 'feeFineType', 'Fee fine');
        if (Number.isNaN(Number(item.defaultAmount)) && item.defaultAmount) {
          itemErrors.defaultAmount = formatMessage({ id: 'ui-users.feefines.errors.amountNumeric' });
        }
        if (parseFloat(item.defaultAmount) < 0) {
          itemErrors.defaultAmount = formatMessage({ id: 'ui-users.feefines.errors.amountPositive' });
        }
        if (!item.feeFineType) {
          itemErrors.feeFineType = formatMessage({ id: 'stripes-core.label.missingRequiredField' });
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

  getOwners = () => {
    const items = _.get(this.props.resources, ['feefines', 'records'], []);
    const filterOwners = [];
    const { owners } = this.state;

    items.forEach(i => {
      const owner = owners.find(o => o.id === i.ownerId) || {};
      if (!filterOwners.some(o => o.id === owner.id)) {
        filterOwners.push(owner);
      }
    });
    return filterOwners;
  }

  onUpdateOwner(item) {
    const { owners, ownerId } = this.state;
    const owner = owners.find(o => o.id === ownerId) || {};
    owner.defaultChargeNoticeId = item.defaultChargeNoticeId;
    owner.defaultActionNoticeId = item.defaultActionNoticeId;
    this.props.mutator.activeRecord.update({ ownerId });
    return this.props.mutator.owners.PUT(owner);
  }

  render() {
    if (!this.props.resources.feefines) return <div />;

    const { intl: { formatMessage } } = this.props;
    const items = _.get(this.props.resources, ['feefines', 'records'], []);
    const rows = items.filter(i => i.ownerId === this.state.ownerId);
    const type = formatMessage({ id: 'ui-users.feefines.singular' });
    const term = this.state.selectedItem.feeFineType;
    //    const owners = _.get(this.props.resources, ['owners', 'records'], []);
    const { owners, templates, ownerId } = this.state;
    const filterOwners = this.getOwners();
    const modalMessage = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termWillBeDeleted"
        values={{ type, term }}
      />
    );
    let templateCharge = templates.filter(t => t.category === 'FeeFineCharge') || [];
    templateCharge = [{}, ...templateCharge.map((t) => ({ value: t.id, label: t.name }))];
    let templateAction = templates.filter(t => t.category === 'FeeFineAction') || [];
    templateAction = [{}, ...templateAction.map((t) => ({ value: t.id, label: t.name }))];

    const fieldComponents = {
      'chargeNoticeId': ({ fieldProps }) => (
        <Field
          {...fieldProps}
          marginBottom0
          component={Select}
          dataOptions={templateCharge}
        />
      ),
      'actionNoticeId': ({ fieldProps }) => (
        <Field
          {...fieldProps}
          marginBottom0
          component={Select}
          dataOptions={templateAction}
        />

      ),
    };

    const formatter = {
      'chargeNoticeId': (value) => (value.chargeNoticeId ? ((templates.find(t => t.id === value.chargeNoticeId) || {}).name) : '-'),
      'actionNoticeId': (value) => (value.actionNoticeId ? ((templates.find(t => t.id === value.actionNoticeId) || {}).name) : '-'),
    };

    const owner = owners.find(o => o.id === ownerId) || {};

    return (
      <Paneset>
        <Pane
          defaultWidth="fill"
          fluidContentWidth
          paneTitle={<FormattedMessage id="ui-users.feefines.title" />}
        >
          <Owners dataOptions={owners} onChange={this.onChangeOwner} />
          <ChargeNotice owner={owner} templates={templates} templateCharge={templateCharge} templateAction={templateAction} onSubmit={(values) => { this.onUpdateOwner(values); }} />
          <EditableList
            {...this.props}
            formatter={formatter}
            fieldComponents={fieldComponents}
            label={formatMessage({ id: 'ui-users.feefines.title' })}
            validate={this.validate}
            contentData={rows}
            createButtonLabel={formatMessage({ id:'stripes-core.button.new' })}
            visibleFields={['feeFineType', 'defaultAmount', 'chargeNoticeId', 'actionNoticeId']}
            columnMapping={{
              feeFineType: formatMessage({ id: 'ui-users.feefines.columns.type' }),
              defaultAmount: formatMessage({ id: 'ui-users.feefines.columns.amount' }),
              chargeNoticeId: formatMessage({ id: 'ui-users.feefines.columns.chargeNotice' }),
              actionNoticeId: formatMessage({ id: 'ui-users.feefines.columns.actionNotice' }),
            }}
            onUpdate={this.onUpdateItem}
            onCreate={this.onCreateItem}
            onDelete={this.showConfirmDialog}
            isEmptyMessage={
              formatMessage({ id: 'ui-users.feefines.nodata' },
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

export default injectIntl(stripesConnect(FeefineSettings));
