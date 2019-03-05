import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Callout,
  Pane,
  Paneset,
  ConfirmationModal,
} from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  EditableList,
  UserName
} from '@folio/stripes/smart-components';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
  FormattedDate
} from 'react-intl';
import { Link } from 'react-router-dom';
import { validate } from '../util';
import { Owners } from './FeeFinesTable';

class TransferAccountsSettings extends React.Component {
  static manifest = Object.freeze({
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?query=cql.allRecords=1 sortby owner&limit=100',
      accumulate: 'true',
      fetch: 'false',
    },
    transferAccounts: {
      type: 'okapi',
      records: 'transfers',
      path: 'transfers',
      PUT: {
        path: 'transfers/%{activeRecord.id}',
      },
      DELETE: {
        path: 'transfers/%{activeRecord.id}',
      },
    },
    activeRecord: {},
  });

  static propTypes = {
    stripes: PropTypes.object,
    mutator: PropTypes.shape({
      owners: PropTypes.shape({
        reset: PropTypes.func,
        GET: PropTypes.func,
      }),
      transferAccounts: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
        DELETE: PropTypes.func,
      }),
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
    }),
    resources: PropTypes.object,
    id: PropTypes.string,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showConfirmDialog : false,
      selectedItem : {},
      ownerId:'',
      owners: [],
    };

    this.connectedUserName = props.stripes.connect(UserName);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onCreateItem = this.onCreateItem.bind(this);
    this.onUpdateItem = this.onUpdateItem.bind(this);
    this.metadataCache = {};
  }

  componentDidMount() {
    this.props.mutator.owners.reset();
    this.props.mutator.owners.GET().then(records => {
      const ownerId = records[0].id;
      this.setState({ owners : records, ownerId });
    });
  }

  onCreateItem(item) {
    item.ownerId = this.state.ownerId;
    return this.props.mutator.transferAccounts.POST(item);
  }

  onUpdateItem(item) {
    this.props.mutator.activeRecord.update({ id: item.id });
    return this.props.mutator.transferAccounts.PUT(item);
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    this.setState({ ownerId });
  }

  showConfirmDialog = (itemId) => {
    const records = _.get(this.props.resources, ['transferAccounts', 'records'], []);
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


  onDeleteItem = () => {
    const { selectedItem } = this.state;
    delete selectedItem.metadata;
    this.props.mutator.activeRecord.update({ id: selectedItem.id });
    return this.props.mutator.transferAccounts.DELETE({ id: selectedItem.id })
      .then(() => {
        this.showDeleteSuccessCallout(selectedItem);
        this.deleteItemResolve();
      }).catch(() => {
        this.deleteItemReject();
      })
      .finally(() => { this.hideConfirmDialog(); });
  }

  showDeleteSuccessCallout = (item) => {
    const { intl: { formatMessage } } = this.props;
    const message = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termDeleted"
        values={{
          type: formatMessage({ id: 'ui-users.transfers.singular' }),
          term: item.accountName,
        }}
      />
    );
    this.callout.sendCallout({ message });
  }

  hideConfirmDialog = () => {
    this.setState({ showConfirmDialog: false });
  }

  validate = ({ items }) => {
    const { intl : { formatMessage } } = this.props;
    if (Array.isArray(items)) {
      const errors = [];
      items.forEach((item, index) => {
        const itemError = validate(item, index, items, 'accountName', formatMessage({ id:'ui-users.transfers.singular' }));
        if (!item.accountName) {
          itemError.accountName = formatMessage({ id:'stripes-core.label.missingRequiredField' });
        }
        errors[index] = itemError;
      });
      return { items : errors };
    }
    return {};
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


  render() {
    const { resources, intl: { formatMessage } } = this.props;
    const owners = this.state.owners;
    const transfers = _.get(resources, ['transferAccounts', 'records'], []);
    const row = transfers.filter(t => t.ownerId === this.state.ownerId);
    const type = formatMessage({ id: 'ui-users.transfers.singular' });
    const term = this.state.selectedItem.accountName;

    const modalMessage = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termWillBeDeleted"
        values={{ type, term }}
      />
    );

    const formatter = {
      'lastUpdated': (item) => {
        if (item.metadata) {
          return this.renderLastUpdated(item.metadata);
        }
        return '-';
      },
    };

    return (
      <Paneset>
        <Pane
          defaultWidth="fill"
          fluidContentWidth
          paneTitle={<FormattedMessage id="ui-users.transfers.label" />}
        >
          <Owners dataOptions={owners} onChange={this.onChangeOwner} />
          <EditableList
            contentData={row}
            formatter={formatter}
            validate={this.validate}
            visibleFields={['accountName', 'desc', 'lastUpdated']}
            columnMapping={{
              accountName: formatMessage({ id: 'ui-users.transfers.columns.name' }),
              desc: formatMessage({ id: 'ui-users.transfers.columns.desc' }),
              lastUpdated: formatMessage({ id: 'stripes-smart-components.cv.lastUpdated' })
            }}
            readOnlyFields={['lastUpdated']}
            createButtonLabel={formatMessage({ id:'stripes-core.button.new' })}
            onCreate={this.onCreateItem}
            onUpdate={this.onUpdateItem}
            onDelete={this.showConfirmDialog}
            isEmptyMessage={
              formatMessage({ id: 'ui-users.transfers.nodata' },
                { terms: 'label' })
            }
          />
          <ConfirmationModal
            heading={formatMessage({ id: 'ui-users.transfers.modalHeader' })}
            message={modalMessage}
            open={this.state.showConfirmDialog}
            onConfirm={this.onDeleteItem}
            onCancel={this.hideConfirmDialog}
            confirmLabel={formatMessage({ id: 'ui-users.delete' })}
          />
          <Callout
            ref={(ref) => { this.callout = ref; }}
          />
        </Pane>
      </Paneset>
    );
  }
}

export default injectIntl(TransferAccountsSettings);
