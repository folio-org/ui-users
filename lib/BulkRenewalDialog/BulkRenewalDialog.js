import React from 'react';
import PropTypes from 'prop-types';
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

  static getDerivedStateFromProps(props, state) {
    const newState = {};
    if (!state.open && props.open) {
      newState.open = true;
    }

    if (Object.keys(newState).length) return newState;
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false, // eslint-disable-line react/no-unused-state
    };

    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel() {
    this.props.onClose();
  }

  render() {
    const { formatMessage } = this.props.stripes.intl;
    const BodyComponent = BulkRenewInfo;
    const modalLabel = formatMessage({ id: 'ui-users.brd.renewConfirmation' });


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
        />
      </Modal>
    );
  }
}

export default BulkRenewalDialog;
