import React from 'react';
import PropTypes from 'prop-types';
import {
  Col,
  KeyValue,
  Modal,
} from '@folio/stripes/components';

import css from './ResetPasswordControl.css';

class ResetPasswordControl extends React.Component {
  state = {
    showModal: false,
  }

  openModal = () => {
    this.setState({ showModal: true });
  }

  closeModal = () => {
    this.setState({ showModal: false });
  }

  render() {
    const { intl } = this.props;
    const fieldLabel = intl.formatMessage({ id: 'ui-users.extended.folioPassword' });
    const contentText = intl.formatMessage({ id: 'ui-users.extended.sendResetPassword' });

    return (
      <Col xs={12} md={3}>
        <KeyValue label={fieldLabel}>
          <button
            type="button"
            onClick={this.openModal}
            className={css.resetPasswordButton}
          >
            {contentText}
          </button>
        </KeyValue>
        <Modal
          dismissible
          size="small"
          open={this.state.showModal}
          onClose={this.closeModal}
          label="Reset password email sent"
        >
          {'Some template text'}
        </Modal>
      </Col>
    );
  }
}

ResetPasswordControl.propTypes = {
  intl: PropTypes.object.isRequired,
};

export default ResetPasswordControl;
