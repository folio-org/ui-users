import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes/components';

import ResetPasswordModal from './ResetPasswordModal';

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
    const {
      email,
      name,
    } = this.props;

    const fieldLabel = <FormattedMessage id="ui-users.extended.folioPassword" />;
    const contentText = <FormattedMessage id="ui-users.extended.sendResetPassword" />;

    return (
      <Col
        xs={12}
        md={3}
      >
        <KeyValue label={fieldLabel}>
          <button
            type="button"
            className={css.resetPasswordButton}
            onClick={this.openModal}
          >
            {contentText}
          </button>
        </KeyValue>
        <ResetPasswordModal
          isOpen={this.state.showModal}
          email={email}
          name={name}
          onClose={this.closeModal}
        />
      </Col>
    );
  }
}

ResetPasswordControl.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default ResetPasswordControl;
