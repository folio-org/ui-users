import React from 'react';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import Modal from '@folio/stripes-components/lib/Modal';

import BulkRenewInfo from './BulkRenewInfo';

class BulkRenewalDialog extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func,
      }),
    }),
    loanIds: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ),
    onClose: PropTypes.func,
    open: PropTypes.bool,
    mutator: PropTypes.shape({
      loans: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({ // eslint-disable-line
      loans: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            itemId: PropTypes.string,
            loanDate: PropTypes.string,
          })
        )
      })
    }).isRequired,
  }

  static defaultProps = {
    loanIds: [],
  }

  static getDerivedStateFromProps(props, state) {
    const newState = {};
    if (!state.open && props.open) {
      newState.open = true;
    }

    const loanIds = props.loanIds.map(l => l.id);
    if (isEqual(loanIds, state.loanIds) === false) {
      newState.loanIds = loanIds;
    }

    if (Object.keys(newState).length) return newState;

    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false, // eslint-disable-line react/no-unused-state
      loanIds: [], // eslint-disable-line react/no-unused-state
    };

    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel() {
    this.props.onClose();
  }

  loans() {
    const userLoans = get(this.props, ['resources', 'loans', 'records', 0, 'loans'], []);
    return userLoans.filter(l => this.state.loanIds.includes(l.id));
  }

  render() {
    const { formatMessage } = this.props.stripes.intl;

    const BodyComponent = BulkRenewInfo;
    const modalLabel = formatMessage({ id: 'stripes-smart-components.brd.renewConfirmation' });


    return (
      <Modal
        size="large"
        dismissible
        closeOnBackgroundClick
        enforceFocus={false} // Needed to allow Calendar in Datepicker to get focus
        onClose={this.props.onClose}
        open={this.props.open}
        label={modalLabel}
      >
        <BodyComponent
          {...this.props}
          onCancel={this.handleCancel}
          loans={this.loans()}
        />
      </Modal>
    );
  }
}

export default BulkRenewalDialog;
