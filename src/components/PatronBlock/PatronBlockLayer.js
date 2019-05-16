import { get as _get, isEmpty as _isEmpty } from 'lodash';
import React from 'react';
import {
  intlShape,
  injectIntl
} from 'react-intl';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ConfirmationModal } from '@folio/stripes/components';
import PatronBlockForm from './PatronBlockForm';
import { handleBackLink } from '../../util';

class PatronBlockLayer extends React.Component {
  static propTypes = {
    mutator: PropTypes.shape({
      patronBlocks: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired
      }),
      activeRecord: PropTypes.object,
    }).isRequired,
    resources: PropTypes.shape({
      patronBlocks: PropTypes.object,
    }),
    onDeleteItem: PropTypes.func,
    onCreateItem: PropTypes.func,
    onUpdateItem: PropTypes.func,
    user: PropTypes.object,
    selectedPatronBlock: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
    initialValues: PropTypes.object,
    intl: intlShape.isRequired,
    stripes: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      showConfirmDialog: false,
    };

    this.showConfirm = this.showConfirm.bind(this);
    this.hideConfirm = this.hideConfirm.bind(this);
  }

  componentDidMount() {
    const { match: { params } } = this.props;
    // if editting an existing patron block, the patronblockid will be present
    // in match.params.
    if (!params.patronblockid) {
      this.props.mutator.activeRecord.update({ blockid: 'x' });
    } else {
      this.props.mutator.activeRecord.update({ blockid: params.id });
    }
  }

  onCreateItem = (item) => {
    const { match: { params } } = this.props;
    item.type = 'Manual';
    item.userId = (params.id);
    if (item.expirationDate) {
      item.expirationDate = moment(item.expirationDate).format();
    }
    return this.props.mutator.patronBlocks.POST(item).then(() => {
      this.props.mutator.activeRecord.update({ blockid: item.userId });
    }).then(() => { this.onCancel(); });
  }

  onDeleteItem = () => {
    const { match: { params } } = this.props;
    const selectedItem = (params.patronblockid) ?
      _get(this.props.resources, ['patronBlocks', 'records', 0], {})
      : this.props.selectedPatronBlock;

    this.props.mutator.activeRecord.update({ blockid: selectedItem.id });
    return this.props.mutator.patronBlocks.DELETE({ id: selectedItem.id })
      .then(() => { this.deleteItemResolve(); })
      .catch(() => { this.deleteItemReject(); })
      .finally(() => {
        this.hideConfirm();
        this.onCancel();
      });
  }

  onUpdateItem = (item) => {
    if (item.expirationDate) {
      item.expirationDate = moment(item.expirationDate).format();
    }
    delete item.metadata;
    this.props.mutator.activeRecord.update({ blockid: item.id });
    return this.props.mutator.patronBlocks.PUT(item).then(() => {
      this.onCancel();
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
    const {
      match: { params },
    } = this.props;
    if (params.patronblockid) {
      this.onUpdateItem(item);
    } else {
      this.onCreateItem(item);
    }
  }

  onCancel = () => {
    const {
      location,
      history,
    } = this.props;
    handleBackLink(location, history);
  }

  render() {
    const {
      intl,
      match: { params },
      user,
      stripes,
      // initialValues
    } = this.props;
    const selectedItem = params.patronblockid ?
      _get(this.props.resources, ['patronBlocks', 'records', 0], {})
      : this.props.selectedPatronBlock;

    const message = !_isEmpty(selectedItem) ?
      <span>
        <strong>{selectedItem.desc}</strong>
        {' '}
        {intl.formatMessage({ id: 'ui-users.blocks.message' })}
      </span> : '';

    return (
      <React.Fragment>
        <PatronBlockForm
          intl={intl}
          stripes={stripes}
          onClose={this.onCancel}
          onDeleteItem={this.showConfirm}
          selectedItem={selectedItem}
          user={user}
          onSubmit={this.onSubmit}
          initialValues={selectedItem}
          params={params}
        />
        <ConfirmationModal
          open={this.state.showConfirmDialog}
          onConfirm={this.onDeleteItem}
          onCancel={this.hideConfirm}
          confirmLabel={intl.formatMessage({ id: 'ui-users.blocks.layer.confirmLabel' })}
          heading={intl.formatMessage({ id: 'ui-users.blocks.layer.heading' })}
          message={message}
        />
      </React.Fragment>
    );
  }
}

export default injectIntl(PatronBlockLayer);
