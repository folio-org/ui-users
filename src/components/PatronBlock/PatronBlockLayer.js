import _ from 'lodash';
import React from 'react';
import {
  intlShape,
  injectIntl
} from 'react-intl';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ConfirmationModal } from '@folio/stripes/components';
import PatronBlockForm from './PatronBlockForm';

class PatronBlockLayer extends React.Component {
  static manifest = Object.freeze({
    patronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path:'manualblocks',
      // TODO: the use of activerecord here is very confusing.
      // it specifically correspoonds to a userId in the GET query but
      // is set to an item's ID in onUpdateItem and onDeleteItem.
      // that's not wrong, but it's not clear.
      GET: {
        path: 'manualblocks?query=userId==%{activeRecord.id}',
      },
      PUT: {
        path: 'manualblocks/%{activeRecord.id}',
      },
      DELETE: {
        path: 'manualblocks/%{activeRecord.id}',
      }
    },
    activeRecord: {},
  });

  static propTypes = {
    mutator: PropTypes.shape({
      patronBlocks: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired
      }),
      activeRecord: PropTypes.object,
    }).isRequired,
    resources: PropTypes.object,
    selectedPatronBlock: PropTypes.object,
    onCancel: PropTypes.func,
    user: PropTypes.object,
    query: PropTypes.object,
    initialValues: PropTypes.object,
    intl: intlShape.isRequired,
    stripes: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      showConfirmDialog: false,
    };

    this.onCreateItem = this.onCreateItem.bind(this);
    this.onDeleteItem = this.onDeleteItem.bind(this);
    this.onUpdateItem = this.onUpdateItem.bind(this);
    this.showConfirm = this.showConfirm.bind(this);
    this.hideConfirm = this.hideConfirm.bind(this);
  }

  componentDidMount() {
    const { query, selectedPatronBlock } = this.props;

    if (query.block && !selectedPatronBlock.id) {
      this.props.mutator.activeRecord.update({ id: query.block });
    } else {
      this.props.mutator.activeRecord.update({ id: 'x' });
    }
  }

  onCreateItem(item) {
    item.type = 'Manual';
    item.userId = (this.props.user || {}).id;
    if (item.expirationDate) {
      item.expirationDate = moment(item.expirationDate).format();
    }
    return this.props.mutator.patronBlocks.POST(item).then(() => {
      this.props.mutator.activeRecord.update({ id: item.userId });
    }).then(() => { this.props.onCancel(); });
  }

  onDeleteItem() {
    const { query } = this.props;
    const selectedItem = (query.block && !this.props.selectedPatronBlock.id) ?
      _.get(this.props.resources, ['patronBlocks', 'records', 0], {})
      : this.props.selectedPatronBlock;

    this.props.mutator.activeRecord.update({ id: selectedItem.id });
    return this.props.mutator.patronBlocks.DELETE({ id: selectedItem.id })
      .then(() => { this.deleteItemResolve(); })
      .catch(() => { this.deleteItemReject(); })
      .finally(() => {
        this.hideConfirm();
        this.props.onCancel();
      });
  }

  onUpdateItem(item) {
    if (item.expirationDate) {
      item.expirationDate = moment(item.expirationDate).format();
    }
    delete item.metadata;
    this.props.mutator.activeRecord.update({ id: item.id });
    return this.props.mutator.patronBlocks.PUT(item).then(() => {
      this.props.onCancel();
    });
  }

  showConfirm() {
    this.setState({
      showConfirmDialog: true,
    });

    return new Promise((resolve, reject) => {
      this.deleteItemResolve = resolve;
      this.deleteItemReject = reject;
    });
  }

  hideConfirm() {
    this.setState({
      showConfirmDialog: false,
    });
  }

  onSubmit = (item) => {
    const { query } = this.props;
    if (query.layer === 'add-block') {
      this.onCreateItem(item);
    } else {
      this.onUpdateItem(item);
    }
  }

  render() {
    const {
      query,
      intl,
    } = this.props;
    const selectedItem = (query.block && !this.props.selectedPatronBlock.id) ?
      _.get(this.props.resources, ['patronBlocks', 'records', 0], {})
      : this.props.selectedPatronBlock;

    const message = !_.isEmpty(selectedItem) ?
      <span>
        <strong>{selectedItem.desc}</strong>
        {' '}
        {intl.formatMessage({ id: 'ui-users.blocks.message' })}
      </span> : '';

    return (
      <div>
        <PatronBlockForm
          intl={this.props.intl}
          stripes={this.props.stripes}
          onClose={this.props.onCancel}
          onDeleteItem={this.showConfirm}
          query={query}
          selectedItem={selectedItem}
          user={this.props.user}
          onSubmit={this.onSubmit}
          initialValues={this.props.initialValues}
        />
        <ConfirmationModal
          id="patron-block-confirmation-modal"
          open={this.state.showConfirmDialog}
          onConfirm={this.onDeleteItem}
          onCancel={this.hideConfirm}
          confirmLabel={intl.formatMessage({ id: 'ui-users.blocks.layer.confirmLabel' })}
          heading={intl.formatMessage({ id: 'ui-users.blocks.layer.heading' })}
          message={message}
        />
      </div>
    );
  }
}

export default injectIntl(PatronBlockLayer);
