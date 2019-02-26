import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux';
import {
  injectIntl,
  intlShape,
  FormattedMessage,
  FormattedDate
} from 'react-intl';
import { Link } from 'react-router-dom';
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
import { Field } from 'redux-form';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  EditableList,
  UserName
} from '@folio/stripes/smart-components';
import { validate } from '../util';
import stripesConnect from '../connect';

import {
  Owners,
} from './FeeFinesTable';

class PaymentSettings extends React.Component {
  static manifest = Object.freeze({
    payments: {
      type: 'okapi',
      records: 'payments',
      path: 'payments',
      throwErrors: false,
      PUT: {
        path: 'payments/%{activeRecord.id}',
      },
      DELETE: {
        path: 'payments/%{activeRecord.id}',
      },
      GET: {
        path: 'payments?query=cql.allRecords=1 sortby nameMethod&limit=500',
      },
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?query=cql.allRecords=1 sortby owner&limit=500',
      accumulate: 'true',
    },
    activeRecord: {},
  });

  static propTypes = {
    resources: PropTypes.object,
    stripes: PropTypes.object,
    mutator: PropTypes.object,
    intl: intlShape.isRequired,
    id: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      showConfirmDialog: false,
      showItemInUseDialog: false,
      selectedItem: {},
      ownerId: '',
      owners: [],
    };

    this.metadataCache = {};
    this.connectedUserName = props.stripes.connect(UserName);

    this.onCreateItem = this.onCreateItem.bind(this);
    this.onUpdateItem = this.onUpdateItem.bind(this);
    this.onDeleteItem = this.onDeleteItem.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
    this.validate = this.validate.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
  }

  componentDidMount() {
    this.props.mutator.owners.GET().then(records => {
      const ownerId = (records.length > 0) ? records[0].id : '';
      this.setState({ owners: records, ownerId });
    });
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    this.setState({ ownerId });
  }

  onCreateItem(item) {
    item.ownerId = this.state.ownerId;
    return this.props.mutator.payments.POST(item);
  }

  onUpdateItem(item) {
    this.props.mutator.activeRecord.update({ id: item.id });
    return this.props.mutator.payments.PUT(item);
  }

  onDeleteItem() {
    const { selectedItem } = this.state;
    delete selectedItem.metadata;
    this.props.mutator.activeRecord.update({ id: selectedItem.id });
    return this.props.mutator.payments.DELETE(selectedItem)
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
          type: formatMessage({ id: 'ui-users.payments.singular' }),
          term: item.nameMethod,
        }}
      />
    );

    this.callout.sendCallout({ message });
  }


  showConfirmDialog(itemId) {
    const records = _.get(this.props.resources, ['payments', 'records'], []);
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

  hideItemInUseDialog() {
    this.setState({
      showItemInUseDialog: false,
      selectedItem: {},
    });
  }

  renderLastUpdated = (metadata) => {
    const { stripes } = this.props;

    if (!this.metadataCache[metadata.updatedByUserId]) {
      if (stripes.hasPerm('ui-users.view')) {
        this.metadataCache[metadata.updatedByUserId] = (
          <Link to={`/users/view/${this.props.id}`}>
            <this.connectedUserName stripes={this.props.stripes} id={metadata.updatedByUserId} />
          </Link>
        );
      } else {
        this.metadataCache[metadata.updatedByUserId] = (
          <this.connectedUserName stripes={this.props.stripes} id={metadata.updatedByUserId} />
        );
      }
    }

    return (
      <div>
        <FormattedMessage
          id="stripes-smart-components.cv.updatedAtAndBy"
          values={{
            date: <FormattedDate value={metadata.updatedDate} />,
            user: this.metadataCache[metadata.updatedByUserId],
          }}
        />
      </div>
    );
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
      items.forEach((item, index) => {
        const itemErrors = validate(item, index, items, 'nameMethod', formatMessage({ id: 'ui-users.payments.singular' }));
        if (!item.nameMethod) {
          itemErrors.nameMethod = formatMessage({ id: 'stripes-core.label.missingRequiredField' });
        }
        errors[index] = itemErrors;
      });
      return { items: errors };
    }
    return {};
  }

  render() {
    if (!this.props.resources.payments) return <div />;

    const { intl: { formatMessage } } = this.props;
    const items = _.get(this.props.resources, ['payments', 'records'], []);
    const rows = items.filter(i => i.ownerId === this.state.ownerId);

    const type = formatMessage({ id: 'ui-users.payments.singular' });
    const term = this.state.selectedItem.nameMethod;
    const { owners } = this.state;

    const fieldComponents = {
      'allowedRefundMethod': ({ fieldProps }) => (
        <Field
          {...fieldProps}
          component={Select}
          dataOptions={[{ label: formatMessage({ id: 'ui-users.feefines.modal.yes' }), value: true }, { label: formatMessage({ id: 'ui-users.feefines.modal.no' }), value: false }]}
          marginBottom0
        />
      )
    };

    const formatter = {
      'allowedRefundMethod': (item) => ((item.allowedRefundMethod)
        ? <FormattedMessage id="ui-users.feefines.modal.yes" />
        : <FormattedMessage id="ui-users.feefines.modal.no" />),
      'lastUpdated': (item) => {
        if (item.metadata) {
          return this.renderLastUpdated(item.metadata);
        }
        return '-';
      },
    };

    const modalMessage = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termWillBeDeleted"
        values={{ type, term }}
      />
    );

    return (
      <Paneset>
        <Pane
          defaultWidth="fill"
          fluidContentWidth
          paneTitle={<FormattedMessage id="ui-users.payments.label" />}
        >
          <Owners dataOptions={owners} onChange={this.onChangeOwner} />
          <EditableList
            {...this.props}
            label={formatMessage({ id: 'ui-users.payments.label' })}
            contentData={rows}
            formatter={formatter}
            fieldComponents={fieldComponents}
            validate={this.validate}
            itemTemplate={{ allowedRefundMethod: true }}
            createButtonLabel={formatMessage({ id:'stripes-core.button.new' })}
            visibleFields={['nameMethod', 'allowedRefundMethod', 'lastUpdated']}
            columnMapping={{
              nameMethod: formatMessage({ id: 'ui-users.payments.columns.name' }),
              allowedRefundMethod: formatMessage({ id: 'ui-users.payments.columns.refund' }),
              lastUpdated: formatMessage({ id: 'stripes-smart-components.cv.lastUpdated' })
            }}
            readOnlyFields={['lastUpdated']}
            onUpdate={this.onUpdateItem}
            onCreate={this.onCreateItem}
            onDelete={this.showConfirmDialog}
            isEmptyMessage={
              formatMessage({ id: 'ui-users.payments.nodata' },
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

export default compose(
  injectIntl,
  stripesConnect,
)(PaymentSettings);
